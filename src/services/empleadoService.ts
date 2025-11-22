import axiosClient from '../api/axiosClient';
import { Empleado } from '../types';

export const empleadoService = {
    getAll: async () => {
        const response = await axiosClient.get<Empleado[]>('/Empleados');
        return response.data;
    },

    getById: async (id: number) => {
        const response = await axiosClient.get<Empleado>(`/Empleados/${id}`);
        return response.data;
    },

    create: async (empleado: Omit<Empleado, 'idEmpleado'>) => {
        const response = await axiosClient.post<Empleado>('/Empleados', empleado);
        return response.data;
    },

    update: async (id: number, empleado: Omit<Empleado, 'idEmpleado'>) => {
        const response = await axiosClient.put<Empleado>(`/Empleados/${id}`, empleado);
        return response.data;
    },

    delete: async (id: number) => {
        await axiosClient.delete(`/Empleados/${id}`);
    }
};
