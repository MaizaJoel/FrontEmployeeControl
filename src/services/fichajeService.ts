import axiosClient from '../api/axiosClient';

export interface KioscoResponse {
    message: string;
    timestamp: string;
    empleado: string;
}

export const fichajeService = {
    marcar: async (cedula: string) => {
        const response = await axiosClient.post<KioscoResponse>('/Fichajes/Marcar', { cedula });
        return response.data;
    }
};