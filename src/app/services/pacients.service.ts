import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Turno } from '../interfaces/turno.interface';
import { Pacient } from '../interfaces/pacient.interface';
import { Store } from '@ngrx/store';
import { AppState } from '../store/app.reducer';
import { loadDeleteSingleTurno, loadUpdateSingleTurno, activateLoading, loadUpdateSinglePacientInfoSuccess } from '../store/actions';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import Swal from 'sweetalert2';
import * as firebase from 'firebase';
import { PacientCounter } from '../interfaces/counter.interface';

@Injectable({
  providedIn: 'root'
})
export class PacientsService {

  private pacientsColl: AngularFirestoreCollection<Pacient>;

  private currentDate: number;

  constructor(private afs: AngularFirestore, private store: Store<AppState>) {
    this.pacientsColl = this.afs.collection<Pacient>('pacientes');
    this.currentDate = moment().startOf('day').unix();
  }

  addPacient(turno: Turno) {
    new Promise((resolve) => {
      this.pacientsColl.doc<Pacient>(turno.dni).get().subscribe((snap) => {
        if (!snap.exists) {
          this.pacientsColl.doc(turno.dni).set({
            nombre: turno.nombre,
            apellido: turno.apellido,
            id: turno.dni,
            nacimiento: turno.nacimiento,
            nacimiento_seconds: turno.nacimiento_seconds,
            obra_social: turno.obra_social,
            telefono: turno.telefono
          });
          this.incrementOrDecrementPacientCounter('increment');
        }
      });
    })
  }

  setTurno(turno: Turno, id: string) {
    const { dni } = turno
    this.pacientsColl.doc(dni).collection('turnos').doc(id).set(turno).then((docRef) => {
      this.pacientsColl.doc(dni).collection('turnos').doc(id).update({
        id: id
      });
    });
  }

  getPacientsColl(counter: number): Observable<Pacient[]> {
    return this.afs.collection<Pacient>('pacientes', ref => ref.orderBy('apellido', 'asc')
      .limit(counter))
      .valueChanges();
  }

  async incrementOrDecrementPacientCounter(action: 'increment' | 'decrement') {
    const docRef = await this.pacientsColl.doc('-- Pacient Counter --').get().toPromise();
    if (!docRef.exists) {
      await this.pacientsColl.doc('-- Pacient Counter --').set({
        pacient_counter: 0
      });
    };
    if (action == 'increment') {
      await this.pacientsColl.doc('-- Pacient Counter --').update({
        pacient_counter: firebase.firestore.FieldValue.increment(1)
      });
    } else if (action == 'decrement') {
      await this.pacientsColl.doc('-- Pacient Counter --').update({
        pacient_counter: firebase.firestore.FieldValue.increment(-1)
      })
    };

    // this.pacientsColl.doc('-- Pacient Counter --').get().toPromise().then(docRef => {
    //   if (!docRef.exists) {
    //     this.pacientsColl.doc('-- Pacient Counter --').set({
    //       pacient_counter: 0
    //     });
    //   }
    // }).then(() => {
    //   if (action == 'increment') {
    //     this.pacientsColl.doc('-- Pacient Counter --').update({
    //       pacient_counter: firebase.firestore.FieldValue.increment(1)
    //     })
    //   } else if (action == 'decrement') {
    //     this.pacientsColl.doc('-- Pacient Counter --').update({
    //       pacient_counter: firebase.firestore.FieldValue.increment(-1)
    //     })
    //   }
    // })
  }

  getPacientsCounter() {
    return this.pacientsColl.doc<PacientCounter>('-- Pacient Counter --').valueChanges();
  }

  getSinglePacient(pacientId: string): Observable<Pacient> {
    return this.pacientsColl.doc<Pacient>(pacientId).valueChanges();
  }

  updatePacient(oldPacientData: Pacient, newPacientData: Pacient) {

    if (oldPacientData.id != newPacientData.id) {
      this.pacientsColl.doc(newPacientData.id).get().subscribe((docRef) => {
        if (docRef.exists) {
          Swal.fire('Error!', 'Ya existe un usuario con ese DNI', 'error');
        } else {
          let turnosBackUp: Turno[];
          this.pacientsColl.doc(oldPacientData.id).collection<Turno>('turnos')
            .valueChanges().subscribe((turnos) => {
              if (turnos.length > 0) {
                turnosBackUp = turnos;
                this.pacientsColl.doc(oldPacientData.id).delete().then(() => {
                  turnosBackUp.forEach((oldTurno) => {
                    this.pacientsColl.doc(oldPacientData.id).collection('turnos').doc(oldTurno.id).delete();
                  })
                }).then(() => {
                  this.pacientsColl.doc(newPacientData.id).set(newPacientData).then(() => {
                    turnosBackUp.forEach((turno) => {
                      this.pacientsColl.doc(newPacientData.id).collection('turnos').doc(turno.id).set(turno);
                    });
                  }).then(() => window.location.reload());
                });
              };
            });
        };
      });
    }
    else {
      this.pacientsColl.doc(oldPacientData.id).update(newPacientData).then(() => {
        this.store.dispatch(loadUpdateSinglePacientInfoSuccess({ newPacientData: newPacientData }))
      });
    };
  }

  deletePacient(pacient: Pacient) {
    const { id } = pacient;
    this.pacientsColl.doc(id).delete().then(() =>
      this.pacientsColl.doc(id).collection('turnos').valueChanges().subscribe((turnosColl: Turno[]) => {
        if (turnosColl.length > 0) {
          turnosColl.forEach((turno) => {
            this.pacientsColl.doc(id).collection('turnos').doc(turno.id).delete();
          });
        }
      })).then(() => this.incrementOrDecrementPacientCounter('decrement'));
  }

  updateTurnoFromPacientSection(turno: Turno) {
    const { dni, id, especialistaId } = turno
    this.pacientsColl.doc(dni).collection('turnos').doc(id).update(turno).then(() => {
      this.store.dispatch(loadUpdateSingleTurno({ especialistaId: especialistaId, turno: turno }))
    });
  }

  updateTurnoFromTurnosSection(turno: Turno) {
    const { dni, id } = turno;
    this.pacientsColl.doc(dni).collection('turnos').doc(id).update(turno);
  }

  updatePacientInfoFromTurnosSection(oldTurno: Turno, newTurno: Turno) {
    this.pacientsColl.doc(oldTurno.dni).get().subscribe((pacient: Pacient) => {
      if (pacient.id != newTurno.dni) {
        this.pacientsColl.doc(oldTurno.dni).collection<Turno>('turnos').valueChanges().subscribe((collRef) => {
          let pacientTurnos: Turno[];
          if (collRef.length > 0) {
            pacientTurnos = collRef;
            console.log(collRef, pacientTurnos);
          };
          this.pacientsColl.doc(pacient.id).delete().then(() => {
            this.pacientsColl.doc(newTurno.dni).set({
              nombre: newTurno.nombre,
              apellido: newTurno.apellido,
              id: newTurno.dni,
              obra_social: newTurno.obra_social,
              telefono: newTurno.telefono
            }).then(() => {
              if (pacientTurnos) {
                pacientTurnos.forEach((pacientTurno: Turno) => {
                  this.pacientsColl.doc(newTurno.dni).collection('turnos').doc(pacientTurno.id).set(newTurno);
                });
              }
            }).then(() => {
              if (pacientTurnos) {
                pacientTurnos.forEach((old_turno => {
                  this.pacientsColl.doc(old_turno.dni).collection('turnos').doc(old_turno.id).delete();
                }));
              };
            }).then(() => window.location.reload());
          });
        });
      } else {
        this.pacientsColl.doc(oldTurno.dni).update({
          nombre: newTurno.nombre,
          apellido: newTurno.apellido,
          obra_social: newTurno.obra_social,
          telefono: newTurno.telefono
        }).then(() => this.pacientsColl.doc(oldTurno.dni).collection('turnos').doc(oldTurno.id).update(newTurno))
      }
    })
  }

  deleteTurnoFromTurnosSection(turno: Turno) {
    this.pacientsColl.doc(turno.dni).collection('turnos').doc(turno.id).delete();
  }

  deleteTurnoFromPacientSection(especialistaId: string, turno: Turno) {
    const { dni, id } = turno;
    this.pacientsColl.doc(dni).collection('turnos').doc(id).delete().then(() => {
      this.store.dispatch(loadDeleteSingleTurno({ especialistaId, turno }))
    })
  }


  getPacienteTurnos(pacienteId: string) {
    this.store.dispatch(activateLoading());
    return this.pacientsColl.doc(pacienteId).collection('turnos', ref => ref.orderBy('dateInSeconds', 'asc')).valueChanges();
  }

  getPacientByLastname(startValue: any, endValue: any) {
    return this.afs.collection<Pacient>('pacientes', ref => ref.orderBy('apellido')
      .startAt(startValue)
      .endAt(endValue))
      .valueChanges();
  }

  getPacientByDNI(dni:string) { 
    return this.afs.collection<Pacient>('pacientes', ref => ref.where('id', '==', dni)).valueChanges();
  }

}
