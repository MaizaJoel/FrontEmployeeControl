import axiosClient from '../api/axiosClient';

export interface Role {
    id: string;
    name: string;
}

export interface CreateRole {
    name: string;
}

export const roleService = {
    getAll: async () => {
        const response = await axiosClient.get<Role[]>('/Roles');
        return response.data;
    },

    create: async (data: CreateRole) => {
        const response = await axiosClient.post('/Roles', data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await axiosClient.delete(/Roles/);
        return response.data;
    }
};