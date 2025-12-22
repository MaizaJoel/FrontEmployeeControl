import axiosClient from '../api/axiosClient';

export interface Tasa {
    idTasa: number;
    codigoTasa: string;
    tasaMultiplicador: number;
    descripcion: string;
    activo: boolean;
}

export interface HorarioTasa {
    idHorarioTasa: number;
    idTasa: number;
    diasAplicacion: string; // "LUN,MAR" or "TODOS"
    horaInicio: string; // "00:00:00"
    horaFin: string; // "23:59:00"
    tasa?: Tasa;
}

export const tasasService = {
    getAllTasas: async () => {
        const response = await axiosClient.get<Tasa[]>('/Tasas');
        return response.data;
    },

    getAllHorarios: async () => {
        const response = await axiosClient.get<HorarioTasa[]>('/Tasas/Horarios');
        return response.data;
    },

    createHorario: async (data: any) => {
        const response = await axiosClient.post('/Tasas/Horarios', data);
        return response.data;
    },

    updateHorario: async (id: number, data: any) => {
        const response = await axiosClient.put(`/Tasas/Horarios/${id}`, data);
        return response.data;
    },

    deleteHorario: async (id: number) => {
        await axiosClient.delete(`/Tasas/Horarios/${id}`);
    }
};
