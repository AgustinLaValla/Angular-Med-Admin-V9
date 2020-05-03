import { Actions, createEffect, ofType } from '@ngrx/effects';

import { Injectable } from '@angular/core';
import {loadGetTurnosSuccess, loadGetTurnosFailed, loadGetTurnos, loadDeleteSingleTurno, loadDeleteSingleTurnoSuccess, 
    loadDeleteSingleTurnoFailed, loadGetTurnoByPacientLastname, loadGetTurnoByPacientLastnameSuccess, 
    loadGetTurnoByPacientLastnameFailed, 
    loadAddTurno,
    loadAddTurnoFailed,
    loadUpdateSingleTurno,
    loadUpdateSingleTurnoFailed,
    loadGetTurnosPasados,
    loadGetTurnosPasadosSuccess,
    loadGetTurnosPasadosFailed
} from '../actions';
import { switchMap, map, catchError, tap } from 'rxjs/operators';
import { TurnosService } from 'src/app/services/turnos.service';
import { Turno } from 'src/app/interfaces/turno.interface';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TurnosEffect {
    constructor(private actions$: Actions, private turnosService: TurnosService) { }

    //GetTurnos Effect
    loadGetTurnos$ = createEffect(() => this.actions$.pipe(
        ofType(loadGetTurnos),
        switchMap(({id, counter}) => this.turnosService.getMiembroTurnos(id,counter).pipe(
            map((turnos: Turno[]) => loadGetTurnosSuccess({turnos: turnos})),
            catchError((error: any) => of(loadGetTurnosFailed(error)))
        ))
    ));

    //AddTurno Effect 
    loadAddTurno$ = createEffect(() => this.actions$.pipe(
        ofType(loadAddTurno),
        switchMap(({especialistaId, turno})=> of(this.turnosService.addTurno(especialistaId, turno)).pipe(
            catchError((error:any) => of( loadAddTurnoFailed(error) ))
        ))
    ), {dispatch:false});

    //UpdateSingleTurno Effect
    loadUpdateSingleTurno$ = createEffect(() => this.actions$.pipe(
        ofType(loadUpdateSingleTurno),
        switchMap(({especialistaId, turno}) => of(this.turnosService.updateTurno(especialistaId, turno)).pipe(
            catchError((error:any) => of( loadUpdateSingleTurnoFailed(error) ))
        ))
    ), {dispatch:false})

    //DeleteSingleTurnoEffect
    loadDeleteSingleTurno$ = createEffect(() => this.actions$.pipe(
        ofType(loadDeleteSingleTurno),
        switchMap(({especialistaId, turno}) => of(this.turnosService.deleteSingleTurno(especialistaId, turno)).pipe(
            map(() => loadDeleteSingleTurnoSuccess({turnoId: turno.id})),
            catchError((error: any) => of(loadDeleteSingleTurnoFailed(error)))
        ))
    ));

    //Get Turnos By Pacient Lastname
    loadGetTurnosByPacientLastName$ = createEffect(() => this.actions$.pipe(
        ofType(loadGetTurnoByPacientLastname),
        switchMap(({especialistaId, startValue, endValue, tableType}) => {
            return this.turnosService.GetTurnoByPacientLastName(especialistaId, startValue, endValue, tableType).pipe(
                map((turnos: Turno[]) => loadGetTurnoByPacientLastnameSuccess({turnos:turnos})),
                catchError((error: any) => of(loadGetTurnoByPacientLastnameFailed(error)))
            )
        })
    ));

    //loadGetTurnosPasados Effect
    loadGetTurnosPasados$ = createEffect(() => this.actions$.pipe(
        ofType(loadGetTurnosPasados),
        switchMap(({especialistaId, counter}) => this.turnosService.getOldTurnos(especialistaId, counter).pipe(
            map((turnos:Turno[]) => loadGetTurnosPasadosSuccess({turnos:turnos})),
            catchError((error:any) => of( loadGetTurnosPasadosFailed(error) ))
        ))
    ));

}
