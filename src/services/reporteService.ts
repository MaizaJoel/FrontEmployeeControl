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
    pagoNetoDia: number;
    logCalculo: string;
}

export interface ReporteNomina {
    idEmpleado: number;
    fechaInicio: string;
    fechaFin: string;
    totalIngresos: number;
    totalDescuentosAdelantos: number;
    netoAPagar: number;
    detallesDiarios: DetalleDiario[];
}

export const reporteService = {
    getCalculo: async (req: ReporteRequest) => {
        const response = await axiosClient.post<ReporteNomina>('/Reportes/CalculoSemanal', req);
        return response.data;
    }
};