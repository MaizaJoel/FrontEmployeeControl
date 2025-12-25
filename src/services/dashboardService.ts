import axiosClient from '../api/axiosClient';

export interface DashboardSummary {
    totalEmpleados: number;
    asistenciasHoy: number;
    solicitudesPendientes: number;
    isAdminView: boolean;
    ultimoFichaje?: string;
    misSolicitudesPendientes?: number;
}

export const dashboardService = {
    getSummary: async () => {
        const response = await axiosClient.get<DashboardSummary>('/Dashboard/Summary');
        return response.data;
    }
};