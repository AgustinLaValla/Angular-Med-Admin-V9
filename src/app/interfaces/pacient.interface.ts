import * as moment from 'moment/moment';

export interface Pacient {
    nombre?:string;
    apellido?:string;
    obra_social?: string;
    telefono?:string;
    id?: string;
    nacimiento?:moment.Moment | string;
    nacimiento_seconds?: number; 
}