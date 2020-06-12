import * as moment from 'moment/moment'

export interface Turno {
    nombre:string;
    apellido:string;
    obra_social: string;
    telefono?:string;
    desde: moment.Moment | string;
    hasta: moment.Moment | string;
    consulta?:string;
    especialista?:string;
    id?: string;
    dni:string;
    dateInSeconds: number;
    especialistaId?:string;
    nacimiento?: string;
    nacimiento_seconds?: number;
}