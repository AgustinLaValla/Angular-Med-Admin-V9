import { Action, createReducer, on } from '@ngrx/store';
import * as fromTurnosData from '../actions/turnos-data.action';

export interface TurnosDataState {
    show:boolean;
    pacientId:string;
};

const initialState: TurnosDataState = {
    show:false,
    pacientId:null
};

const reducer = createReducer(
    initialState,
    on(fromTurnosData.ShowTurnosData, (state,action) => {
        return {
            show:true,
            pacientId: action.especialistaId
        }
    }),
    on(fromTurnosData.HideTurnosData, (state,action) => {
        return {
            show:false,
            pacientId:null
        }
    })
);

export function tableDataReducer(state:TurnosDataState | undefined, action:Action): TurnosDataState { 
    return reducer(state, action);
};