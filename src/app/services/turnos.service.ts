import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Turno } from '../interfaces/turno.interface';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from '../store/app.reducer';
import { activateLoading, loadIncrementCounter, loadCloseDialog, deactivateLoading } from '../store/actions';
import * as firebase from 'firebase';
import * as moment from 'moment';
import { Counter } from '../interfaces/counter.interface';
import Swal from 'sweetalert2';
import { PacientsService } from './pacients.service';

@Injectable({ providedIn: 'root' })
export class TurnosService {

    private stuffColl: AngularFirestoreCollection;

    private currentDate:number;


    constructor(private afs: AngularFirestore, 
                private store:Store<AppState>, 
                private pacientsService:PacientsService
                ) {

        this.stuffColl = this.afs.collection('stuff');

        this.currentDate = moment().startOf('day').unix();

    }


    getMiembroTurnos(especialistaId:string, count:number = 15) { 
        this.store.dispatch( activateLoading() )
        return this.stuffColl.doc(especialistaId).collection('turnos', ref => 
                                                                  ref.where('dateInSeconds', '>=', this.currentDate)
                                                                     .orderBy('dateInSeconds', 'asc')
                                                                     .limit(count))
                                                 .snapshotChanges()
                                                 .pipe(map(action => action.map(snap => {
                                                                   const turno = snap.payload.doc.data() as Turno;
                                                                   turno.id = snap.payload.doc.id;
                                                                   return {...turno}
                                                               }))
        )
    }

    getSingleTurno(especialistaId:string, turnoId:string) { 
       return this.stuffColl.doc(especialistaId).collection('turnos').doc(turnoId).valueChanges();
    }

    async addTurno(especialistaId:string, turno:Turno) { 
        const snap = await this.stuffColl.doc(especialistaId)
                                   .collection('turnos')
                                   .ref.where('dateInSeconds', '==', turno.dateInSeconds)
                                   .get();
        if(snap.empty) { 
            this.store.dispatch(activateLoading());
            this.store.dispatch(loadCloseDialog({close:true}));
            this.store.dispatch(  loadIncrementCounter({value:1}) );
            const docRef = await this.stuffColl.doc(especialistaId).collection('turnos').add(turno);
            await this.pacientsService.addPacient(turno);
            await this.stuffColl.doc(especialistaId).collection('turnos').doc(docRef.id).update({id: docRef.id});
            await this.turnosDocumentCounter(especialistaId, 'increment');
            await this.pacientsService.setTurno(turno, docRef.id);
        } else {
            Swal.fire({
                title: '¡Ese turno está ocupado!',
                text: `${snap.docs[0].data().nombre} ${snap.docs[0].data().apellido}: ${snap.docs[0].data().desde}`,
                icon: 'warning'
             });
             this.store.dispatch(loadCloseDialog({close:false}));
             this.store.dispatch(deactivateLoading());
        };
    };


    updateTurno(especialistaId:string, turno:Turno) { 
        this.store.dispatch(activateLoading());
        this.stuffColl.doc(especialistaId).collection('turnos').ref.where('dateInSeconds', '==', turno.dateInSeconds)
                      .get().then((snap) => {
                          if(snap.empty) { 
                              this.stuffColl.doc(especialistaId).collection('turnos').doc(turno.id).update(turno).then(()=>{
                                //   this.store.dispatch(loadUpdateSingleTurnoSuccess({turno: turno}) );
                                  this.pacientsService.updateTurnoFromTurnosSection(turno);
                              });
                              this.store.dispatch(loadCloseDialog({close:true}));
                          }else{
                              if(JSON.stringify(snap.docs[0].data()) != JSON.stringify(turno) && snap.docs[0].data().id == turno.id ){
                                this.stuffColl.doc(especialistaId).collection('turnos').doc(turno.id).update(turno).then(()=>{
                                    // this.store.dispatch(loadUpdateSingleTurnoSuccess({turno: turno}) );
                                    this.pacientsService.updatePacientInfoFromTurnosSection(snap.docs[0].data() as Turno, turno);
                                });
                                this.store.dispatch(loadCloseDialog({close:true}));
                              } else if((snap.docs[0].data().dateInSeconds == turno.dateInSeconds) && 
                                         JSON.stringify(snap.docs[0].data()) != JSON.stringify(turno) ) {
                                  Swal.fire({
                                    title: '¡Ese turno está ocupado!',
                                    text: `${snap.docs[0].data().nombre} ${snap.docs[0].data().apellido}: ${snap.docs[0].data().desde}`,
                                    icon: 'warning'
                                  });
                                  this.store.dispatch(loadCloseDialog({close:false}));
                                  this.store.dispatch(deactivateLoading());
                              } 
                          };
                      });
    }

    //delete Single Turno
    deleteSingleTurno(especialistaId:string ,turno:Turno) {
        this.stuffColl.doc(especialistaId).collection('turnos').doc(turno.id).delete().then(()=>{
            this.turnosDocumentCounter(especialistaId, 'decrement');
        }).then(() => this.pacientsService.deleteTurnoFromTurnosSection(turno));
    }

    //TURNOS COUNTER
    turnosDocumentCounter(especialistaId:string, action:'increment' | 'decrement') { 
        const counterRef = this.stuffColl.doc(especialistaId).collection<Counter>('turnos-counter');
        counterRef.get().subscribe((docRef)=> {
            if(docRef.empty){
                counterRef.doc('--counter--').set({
                    counter: 0
                })
            }

            if(action == 'increment') { 
                counterRef.doc('--counter--').update({
                    counter: firebase.firestore.FieldValue.increment(1)
                });
            }else{
                counterRef.doc('--counter--').update({
                    counter: firebase.firestore.FieldValue.increment(-1)
                });
            }
        })
        
    }
    //GET TURNOS COUNTER VALUE
    getTurnosCounterValue(especialistaId:string):Observable<Counter> { 
        const counterRef = this.stuffColl.doc(especialistaId).collection('turnos-counter').doc<Counter>('--counter--');
        return counterRef.valueChanges();
    }

    //GET TURNOS CONCRETADOS LENGTH
    getTurnosConcretadosLength(especialistaId:string) { 
        return this.stuffColl.doc(especialistaId)
                      .collection('turnos', ref => ref.where('dateInSeconds' , '<', this.currentDate))
                      .valueChanges()
    }

    //Search Turno By Pacient Name
    GetTurnoByPacientLastName(especialistaId:string,startValue:any, endValue:any, tableType: 'Especialistas' | 'Turnos Pasados') { 
       return this.stuffColl.doc(especialistaId)
                            .collection('turnos', ref => ref
                                                        .orderBy('apellido')
                                                        .startAt(startValue)
                                                        .endAt(endValue))
                                                        .valueChanges()
                                                        .pipe(map((turnos:Turno[])=> { 
                                                            if(tableType == 'Especialistas') { 
                                                                return turnos.filter((turno:Turno) => turno.dateInSeconds >= this.currentDate);
                                                            }else if(tableType == 'Turnos Pasados') { 
                                                                return turnos.filter((turno:Turno) => turno.dateInSeconds < this.currentDate)
                                                            }
                                                        }));
    }

    getOldTurnos(especialistaId:string, count:number) { 
        this.store.dispatch(activateLoading());
        return this.stuffColl.doc(especialistaId)
                             .collection('turnos', ref => ref.where('dateInSeconds', '<', this.currentDate)
                                                             .orderBy('dateInSeconds', 'asc')
                                                             .limit(count))
                                                             .snapshotChanges()
                                                             .pipe(map(action => action.map(snap => {
                                                                      const turno = snap.payload.doc.data() as Turno;
                                                                      turno.id = snap.payload.doc.id;
                                                                      return {...turno}
                                                                }))
                                                            )
    }

}

