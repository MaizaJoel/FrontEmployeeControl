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