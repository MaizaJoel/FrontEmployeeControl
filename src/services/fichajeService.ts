import axiosClient from '../api/axiosClient';

export interface KioscoResponse {
    message: string;
    timestamp: string;
    empleado: string;
}

export interface FichajeLog {
    idFichaje: number;
    idEmpleado: number;
    nombreEmpleado: string;
    timestampUtc: string;
    tipoEvento: string;
    origen: string;
    esCorregido: boolean;
}

export interface FichajeManual {
    idEmpleado: number;
    fechaHoraLocal: string; // ISO string
    tipoEvento: string;
}

export const fichajeService = {
    marcar: async (cedula: string) => {
        const response = await axiosClient.post<KioscoResponse>('/Fichajes/Marcar', { cedula });
        return response.data;
    },

    // Ahora soporta filtros
    getAll: async (idEmpleado?: number, fechaInicio?: string, fechaFin?: string) => {
        const params = new URLSearchParams();
        if (idEmpleado) params.append('idEmpleado', idEmpleado.toString());
        if (fechaInicio) params.append('fechaInicio', fechaInicio);
        if (fechaFin) params.append('fechaFin', fechaFin);

        const response = await axiosClient.get<FichajeLog[]>(`/Fichajes?${params.toString()}`);
        return response.data;
    },

    createManual: async (data: FichajeManual) => {
        const response = await axiosClient.post('/Fichajes/Manual', data);
        return response.data;
    },

    update: async (id: number, data: FichajeManual) => {
        const response = await axiosClient.put(`/Fichajes/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await axiosClient.delete(`/Fichajes/${id}`);
        return response.data;
    }
};