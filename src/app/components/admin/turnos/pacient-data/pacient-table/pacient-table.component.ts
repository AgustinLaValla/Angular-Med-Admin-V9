import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState, getIsLoading, getPacienteTurnos } from 'src/app/store/app.reducer';
import { Turno } from 'src/app/interfaces/turno.interface';
import { deactivateLoading, loadDeleteTurnoFromPacientSection } from 'src/app/store/actions';
import { TurnosDialogComponent } from '../../turnos-dialog/turnos-dialog.component';
import * as moment from 'moment/moment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pacient-table',
  templateUrl: './pacient-table.component.html',
  styleUrls: ['./pacient-table.component.css']
})
export class PacientTableComponent implements OnInit, OnDestroy {

  private loadingSubs$ = new Subscription();
  public loading: boolean = false;

  private pacientTurnosSubs$ = new Subscription();

  public currentDate:number;

  dataSource = new MatTableDataSource<Turno>();
  displayedColumns: string[] = ['especialista', 'consulta', 'fecha' ,'desde', 'hasta', 'estado' ,'opciones']

  @ViewChild('tableScroll', { static: true }) public tableScroll: ElementRef

  constructor(private store:Store<AppState>,
              private dialog:MatDialog) {
    this.loadingSubs$ = this.store.select( getIsLoading ).subscribe((isLoading:boolean) => this.loading = isLoading );

    this.pacientTurnosSubs$ = this.store.select(getPacienteTurnos).subscribe((turnos:Turno[]) => {
      if(turnos) { 
        this.store.dispatch(  deactivateLoading())
        this.dataSource.data = turnos;
      }
    });

    
    this.currentDate = moment().startOf('day').unix();

   }

  ngOnInit() {
  }


  openDialog(action: string, turno: Turno) {
    this.dialog.open(TurnosDialogComponent, {
      data: { action: action, especialistaId: turno.especialistaId, turno: turno, fromPacientTable:true }
    }); 
  };

  deletePacient(turno:Turno) { 
    const {especialistaId} = turno;

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
        this.store.dispatch( loadDeleteTurnoFromPacientSection({especialistaId:especialistaId, turno:turno}) )
        Swal.fire(
          'Turno eliminado ;)',
          'El turno ha sido eliminado de la lista',
          'success'
        )
      }
    })
  }

  ngOnDestroy(): void {
    this.loadingSubs$.unsubscribe();
    this.pacientTurnosSubs$.unsubscribe();
  }
}
