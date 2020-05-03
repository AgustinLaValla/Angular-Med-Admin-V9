import { Component, OnInit, ViewChild, OnDestroy, ElementRef, AfterViewChecked, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Turno } from 'src/app/interfaces/turno.interface';
import { Store } from '@ngrx/store';
import { AppState, getTurnos, getIsLoading, getId, getCounter, getTurnosCounter, getTurnosConcretadosLength, getTableType, getMiembro, getUnsubsLoading } from 'src/app/store/app.reducer';
import { Subscription, Subject, combineLatest } from 'rxjs';
import {
  deactivateLoading, loadGetTurnos, loadDeleteSingleTurno, loadCloseTable, loadGetTurnosCounter, loadGetTurnoByPacientLastname,
  loadGetTurnosConcretadosLength,
  loadResetTurnoList,
  loadGetTurnosPasados,
  loadGetMiembro,
  unsubscribeLoading
} from 'src/app/store/actions';
import { TurnosDialogComponent } from '../turnos-dialog/turnos-dialog.component';
import Swal from 'sweetalert2';
import { take } from 'rxjs/operators';
import { Miembro } from 'src/app/interfaces/miembro.interface';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-turnos-table',
  templateUrl: './turnos-table.component.html',
  styleUrls: ['./turnos-table.component.css']
})
export class TurnosTableComponent implements OnInit, OnDestroy {

  private idSubs$ = new Subscription();
  private especialistaId: string;

  private tableTypeSubs$ = new Subscription();
  public tableType: 'Especialistas' | 'Turnos Pasados';

  private turnosSubs$ = new Subscription();
  public turnos: Turno[] = [];

  private counterSubs$ = new Subscription();
  private counter: number;

  private turnosCounterSubs$ = new Subscription();
  private totalTurnos: number;

  private turnosConcretadosLengthSubs$ = new Subscription();
  public turnosConcretadosLength: number;

  private loadingSubs$ = new Subscription();
  private loadingSubsHandler$ = new Subscription();
  public loading: boolean = false;

  private miembroSubs$ = new Subscription();
  public miembro: Miembro;

  public displayedColumns: string[] = ['apellido_y_nombre', 'fecha', 'desde', 'hasta', 'consulta', 'obra_social', 'opciones'];
  public dataSource = new MatTableDataSource<Turno>();
  // @ViewChild(MatSort, { static: true }) public sort: MatSort;
  @ViewChild('tableScroll', { static: true }) public tableScroll: ElementRef

  public backgroundLayer: boolean = false;

  public startAt = new Subject();
  public endAt = new Subject();

  constructor(private store: Store<AppState>, private dialog: MatDialog) {
    this.initTable();
  }

  initTable() {
    // SUBCRIPTIONS
    this.tableTypeSubs$ = this.store.select(getTableType).subscribe((tableTyle) => {
      if (tableTyle) {
        this.tableType = tableTyle;

        //Turnos concretados length
        this.turnosConcretadosLengthSubs$ = this.store.select(getTurnosConcretadosLength).subscribe((turnosConcretadosLength) => {
          console.log(turnosConcretadosLength)
          if (turnosConcretadosLength >= 0) {
            this.turnosConcretadosLength = turnosConcretadosLength;
          }
        })


        //Turnos Counter
        this.turnosCounterSubs$ = this.store.select(getTurnosCounter).subscribe((totalTurnos: number) => {
          if (totalTurnos && this.tableType == 'Especialistas') {
            this.totalTurnos = totalTurnos - this.turnosConcretadosLength;
          } else if (totalTurnos && this.tableType == 'Turnos Pasados') {
            this.totalTurnos = this.turnosConcretadosLength;
          }
        })
      }
    });

    //counter subscription
    this.counterSubs$ = this.store.select(getCounter).subscribe((counter: number) => this.counter = counter);
    //Especialista Id Subscription
    this.idSubs$ = this.store.select(getId).subscribe((id: string) => {

      if (id && this.tableType == 'Especialistas') {
        this.store.dispatch(loadGetTurnos({ id: id, counter: this.counter }));
      } else if (id && this.tableType == 'Turnos Pasados') {
        this.store.dispatch(loadGetTurnosPasados({ especialistaId: id, counter: this.counter }));
      };
      this.especialistaId = id;
    })

    this.turnosSubs$ = this.store.select(getTurnos).subscribe((turnos: Turno[]) => {
      this.store.dispatch(deactivateLoading());
      if (turnos) {
        this.store.dispatch(loadGetTurnosConcretadosLength({ especialistaId: this.especialistaId }));
        this.store.dispatch(loadGetTurnosCounter({ especialistaId: this.especialistaId }));
        this.turnos = turnos;
        this.dataSource.data = this.turnos;
        // this.dataSource.sort = this.sort;
      };

      if (isNullOrUndefined(turnos) || turnos.length == 0) {
        this.store.dispatch(loadGetMiembro({ id: this.especialistaId }));
      };

    });


    //Miembro Subscription
    this.miembroSubs$ = this.store.select(getMiembro).subscribe((miembro: Miembro) => {
      this.miembro = miembro;
    });

    //Loading Subs
    this.loadingSubsHandler$ = this.store.select(getUnsubsLoading).subscribe(unsubscribe => {
      if (unsubscribe) {
        this.loadingSubs$.unsubscribe()
      } else {
        this.getLoadingSubs();
      }
    })

  }

  ngOnInit() { }

  openDialog(action: string, turno: Turno = null) {
    this.dialog.open(TurnosDialogComponent, {
      data: { action: action, especialistaId: this.especialistaId, turno: turno }
    })
  }

  applyFilter(event: KeyboardEvent) {
    const query = (event.target as HTMLInputElement).value;
    const { keyCode } = event;
    const keyCodeQuery = keyCode != 16 && keyCode != 17 && keyCode != 20 && keyCode != 18 && keyCode != 91 && keyCode != 93 && 220;

    if (query != '' && keyCodeQuery) {
      this.startAt.next(query);
      this.endAt.next(query + '\uf8ff');
      combineLatest(this.startAt, this.endAt).pipe(take(1)).subscribe((value) => {
        this.store.dispatch(loadGetTurnoByPacientLastname({
          especialistaId: this.especialistaId,
          startValue: value[0],
          endValue: value[1],
          tableType: this.tableType
        }))
      })
    } else if (query == '' && keyCodeQuery) {
      if (this.tableType == 'Especialistas') {
        this.store.dispatch(loadGetTurnos({ id: this.especialistaId, counter: this.counter }));
      } else {
        this.store.dispatch(loadGetTurnosPasados({ especialistaId: this.especialistaId, counter: this.counter }))
      }
    }
  }

  deleteTurno(turno: Turno) {
    Swal.fire({
      title: '¿Seguro quieres borrar el turno?',
      text: "¡Los datos eliminados no se pueden recuperar! ",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e91e63',
      cancelButtonColor: '#6a0080',
      confirmButtonText: '¡SÍ, QUIERO BORRARLO!',
      cancelButtonText: 'CANCELAR'
    }).then((result) => {
      if (result.value) {
        this.store.dispatch(loadDeleteSingleTurno({
          especialistaId: this.especialistaId,
          turno: turno
        }));
        Swal.fire(
          'Turno eliminado ;)',
          'El turno ha sido eliminado de la lista',
          'success'
        )
      }
    })
  }


  scrollHandler(event) {
    console.table([this.totalTurnos, this.counter])
    if (event == 'bottom' && this.counter < this.totalTurnos) {
      this.counter += 5;
      if (this.tableType == 'Especialistas') {
        this.store.dispatch(loadGetTurnos({ id: this.especialistaId, counter: this.counter }))
      } else {
        this.store.dispatch(loadGetTurnosPasados({ especialistaId: this.especialistaId, counter: this.counter }))
      }
      this.backgroundLayer = true;
    }
  }


  getLoadingSubs() {
    this.loadingSubs$ = this.store.select(getIsLoading).subscribe((loading: boolean) => {
      this.loading = loading;
      if (!loading) {
        this.backgroundLayer = false;
      }
    });

  }

  closeTalbe() {
    this.store.dispatch(loadCloseTable())
  }

  ngOnDestroy(): void {
    this.turnosSubs$.unsubscribe();
    this.loadingSubs$.unsubscribe();
    this.idSubs$.unsubscribe();
    this.counterSubs$.unsubscribe();
    this.turnosCounterSubs$.unsubscribe();
    this.turnosConcretadosLengthSubs$.unsubscribe();
    this.tableTypeSubs$.unsubscribe();
    this.miembroSubs$.unsubscribe();
    this.loadingSubsHandler$.unsubscribe();
    this.store.dispatch(loadCloseTable());
    this.store.dispatch(loadResetTurnoList());
  }

}
