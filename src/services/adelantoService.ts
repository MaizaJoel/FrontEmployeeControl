import axiosClient from '../api/axiosClient';

export interface Adelanto {
    idAdelanto: number;
    idEmpleado: number;
    nombreEmpleado: string;
    fechaSolicitud: string; // Viene como DateOnly string "yyyy-MM-dd"
    monto: number;
    descripcion: string;
    estado: string; // Solicitado, Aprobado, Rechazado, Pagado
    fechaAprobacion?: string;
}

export interface CreateAdelanto {
    idEmpleado: number;
    monto: number;
    descripcion: string;
}

export const adelantoService = {
    // GET /api/Adelantos (Filtro opcional por empleado)
    getAll: async (idEmpleado?: number) => {
        const url = idEmpleado ? `/Adelantos?idEmpleado=${idEmpleado}` : '/Adelantos';
        const response = await axiosClient.get<Adelanto[]>(url);
        return response.data;
    },

    // POST /api/Adelantos
    create: async (data: CreateAdelanto) => {
        const response = await axiosClient.post('/Adelantos', data);
        return response.data;
    },

    // PUT /api/Adelantos/{id} (Editar Monto/Desc)
    update: async (id: number, data: CreateAdelanto) => {
        const response = await axiosClient.put(`/Adelantos/${id}`, data);
        return response.data;
    },

    // PUT /api/Adelantos/{id}/estado (Aprobar/Rechazar)
    cambiarEstado: async (id: number, nuevoEstado: string) => {
        const response = await axiosClient.put(`/Adelantos/${id}/estado`, { nuevoEstado });
        return response.data;
    },

    // DELETE /api/Adelantos/{id}
    delete: async (id: number) => {
        const response = await axiosClient.delete(`/Adelantos/${id}`);
        return response.data;
    }
};