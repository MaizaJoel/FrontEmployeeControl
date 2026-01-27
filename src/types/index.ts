export interface Cargo {
    idCargo: number;
    nombreCargo: string;
    descripcion?: string;
    salarioBase: number;
}

export interface Empleado {
    idEmpleado: number;
    nombre: string;
    apellido: string;
    cedula: string;
    telefono?: string;
    email: string;
    activo?: boolean;
    nombreCargo?: string;
    idCargo: number;
}

export interface DashboardSummary {
    totalEmpleados: number;
    asistenciasHoy: number;
    solicitudesPendientes: number;
    isAdminView: boolean;
    ultimoFichaje?: string;
    misSolicitudesPendientes?: number;
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

export interface KioscoResponse {
    message: string;
    timestamp: string;
    empleado: string;
}

export interface FichajeManual {
    idEmpleado: number;
    fechaHoraLocal: string; // ISO string
    tipoEvento: string;
}