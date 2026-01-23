import axiosClient from '../api/axiosClient';

export interface Nomina {
    idNomina: number;
    fechaInicio: string; // DateOnly string
    fechaFin: string;
    fechaGeneracion: string; // DateTime string
    totalPagado: number;
    estado: string;
    cantidadEmpleados?: number;
    detalles?: NominaDetalle[];
}

export interface NominaDetalle {
    idNominaDetalle: number;
    idNomina: number;
    idEmpleado: number;
    ingresosTotales: number;
    deduccionesTotales: number;
    netoPagado: number;
    empleadoNavigation?: {
        nombre: string;
        apellido: string;
    };
    detalleJson?: string;
}

export interface PayrollPreview {
    fechaInicio: string;
    fechaFin: string;
    detalles: PayrollPreviewDetail[];
}

export interface PayrollPreviewDetail {
    idEmpleado: number;
    nombreEmpleado: string;
    ingresos: number;
    deducciones: number;
    neto: number;
}

export const nominaService = {
    getAll: async () => {
        const response = await axiosClient.get<Nomina[]>('/Nominas');
        return response.data;
    },

    getDetail: async (id: number) => {
        const response = await axiosClient.get<Nomina>(`/Nominas/${id}`);
        return response.data;
    },

    checkPeriod: async (start: string, end: string) => {
        const response = await axiosClient.get<{ exists: boolean, nomina?: Nomina }>(`/Nominas/check-period?start=${start}&end=${end}`);
        return response.data;
    },

    preview: async (start: string, end: string, employeeIds?: number[]) => {
        const response = await axiosClient.post<PayrollPreview>('/Nominas/preview', {
            fechaInicio: start,
            fechaFin: end,
            empleadoIds: employeeIds
        });
        return response.data;
    },

    generar: async (start: string, end: string, employeeIds?: number[]) => {
        const response = await axiosClient.post('/Nominas', {
            fechaInicio: start,
            fechaFin: end,
            empleadoIds: employeeIds
        });
        return response.data;
    },

    delete: async (id: number) => {
        await axiosClient.delete(`/Nominas/${id}`);
    }
};
