import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { PacientsService } from 'src/app/services/pacients.service';
import { loadGetPacientTurnos, loadGetPacientTurnosSuccess, loadGetPacientTurnosFailed, loadDeleteTurnoFromPacientSection, loadDeleteTurnoFromPacientSectionSuccess, loadDeleteTurnoFromPacientSectionFailed } from '../actions';
import { switchMap, map, catchError } from 'rxjs/operators';
import { Turno } from 'src/app/interfaces/turno.interface';
import { of } from 'rxjs';

@Injectable()
export class PacientTurnosEffect { 
    constructor(private action$: Actions, 
                private pacientsService:PacientsService) { }

    //get Pacient Turnos Effect
    getPacientTurnos$ = createEffect(() => this.action$.pipe(
        ofType(loadGetPacientTurnos),
        switchMap(({pacientId}) => this.pacientsService.getPacienteTurnos(pacientId).pipe(
            map((pacientTurnos:Turno[]) => loadGetPacientTurnosSuccess({pacient_turnos:pacientTurnos})),
            catchError((error:any) => of( loadGetPacientTurnosFailed(error) ))
        ))
    ));

    //Delete Turno From Pacient Section Effect
    deleteTurnoFromPacientSection$ = createEffect(() => this.action$.pipe(
        ofType(loadDeleteTurnoFromPacientSection),
        switchMap(({especialistaId, turno}) => of(this.pacientsService.deleteTurnoFromPacientSection(especialistaId, turno)).pipe(
            map(() => loadDeleteTurnoFromPacientSectionSuccess({turno:turno})),
            catchError((error:any) => of( loadDeleteTurnoFromPacientSectionFailed(error) ))
        ))
    ));

}