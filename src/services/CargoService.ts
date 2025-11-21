import axiosClient from '../api/axiosClient';
import { Cargo } from '../types';

export const cargoService = {
    // Obtener todos los cargos
    getAll: async () => {
        const response = await axiosClient.get<Cargo[]>('/Cargos');
        return response.data;
    },

    // Obtener un cargo por ID
    getById: async (id: number) => {
        const response = await axiosClient.get<Cargo>(`/Cargos/${id}`);
        return response.data;
    },

    // Crear nuevo cargo (Omitimos idCargo porque lo genera la BD)
    create: async (cargo: Omit<Cargo, 'idCargo'>) => {
        const response = await axiosClient.post('/Cargos', cargo);
        return response.data;
    },

    // Actualizar cargo existente
    update: async (id: number, cargo: Omit<Cargo, 'idCargo'>) => {
        const response = await axiosClient.put(`/Cargos/${id}`, cargo);
        return response.data;
    },

    // Eliminar cargo
    delete: async (id: number) => {
        const response = await axiosClient.delete(`/Cargos/${id}`);
        return response.data;
    }
};