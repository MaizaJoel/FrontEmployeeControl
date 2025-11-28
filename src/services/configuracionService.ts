import axiosClient from '../api/axiosClient';

export interface Configuracion {
    idConfiguracion: number;
    clave: string;
    valor: string;
    descripcion?: string;
    fechaModificacion?: string;
}

export interface CreateConfiguracion {
    clave: string;
    valor: string;
    descripcion?: string;
}

export const configuracionService = {
    getAll: async () => {
        const response = await axiosClient.get<Configuracion[]>('/Configuraciones');
        return response.data;
    },

    create: async (data: CreateConfiguracion) => {
        const response = await axiosClient.post('/Configuraciones', data);
        return response.data;
    },

    update: async (id: number, data: Configuracion) => {
        const response = await axiosClient.put(/Configuraciones/, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await axiosClient.delete(/Configuraciones/);
        return response.data;
    }
};