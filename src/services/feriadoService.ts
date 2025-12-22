import axiosClient from '../api/axiosClient';

export interface Feriado {
    idFeriado: number;
    fecha: string;
    descripcion: string;
}

export interface CreateFeriado {
    fecha: string;
    descripcion: string;
}

export const feriadoService = {
    getAll: async () => {
        const response = await axiosClient.get<Feriado[]>('/Feriados');
        return response.data;
    },

    create: async (data: CreateFeriado) => {
        const response = await axiosClient.post('/Feriados', data);
        return response.data;
    },

    update: async (id: number, data: Feriado) => {
        const response = await axiosClient.put(`/Feriados/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await axiosClient.delete(`/Feriados/${id}`);
        return response.data;
    }
};