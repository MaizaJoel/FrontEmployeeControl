import axiosClient from '../api/axiosClient';

export interface ReporteRequest {
    idEmpleado: number;
    fechaInicio: string; // "yyyy-mm-dd"
    fechaFin: string;    // "yyyy-mm-dd"
}

export interface DetalleDiario {
    fecha: string;
    diaSemana: string;
    horaEntrada: string | null;
    horaSalida: string | null;
    minutosJornadaTotal: number;
    minutosExtrasDiurnas: number;
    minutosExtrasNocturnas: number;
    minutosDeficit: number;
    pagoDiarioBase: number;
    pagoNetoDia: number;
    logCalculo: string;
    observacion: string;
}

export interface AdelantoDetalle {
    idAdelanto: number;
    idEmpleado: number;
    nombreEmpleado: string;
    fechaSolicitud: string;
    monto: number;
    descripcion: string;
    estado: string;
    fechaAprobacion: string | null;
}

export interface ReporteNomina {
    idEmpleado: number;
    fechaInicio: string;
    fechaFin: string;
    totalIngresos: number;
    totalDescuentosAdelantos: number;
    netoAPagar: number;
    detallesDiarios: DetalleDiario[];
    adelantos: AdelantoDetalle[];
}

export const reporteService = {
    getCalculo: async (req: ReporteRequest) => {
        const response = await axiosClient.post<ReporteNomina>('/Reportes/CalculoSemanal', req);
        return response.data;
    }
};