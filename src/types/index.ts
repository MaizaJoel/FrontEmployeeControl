// Basado en tu DTO de C# (CargoDto.cs)
export interface Cargo {
    idCargo: number;
    nombreCargo: string;
    descripcion?: string;
    salarioBase: number;
}

// Basado en tu DTO de C# (EmpleadoDto.cs) - Lo usaremos pronto
export interface Empleado {
    idEmpleado: number;
    nombre: string;
    apellido: string;
    cedula: string;
    telefono?: string;
    email: string;
    activo?: boolean;
    nombreCargo?: string; // Solo lectura (viene del GET)
    idCargo: number;      // Requerido para crear/editar (POST/PUT)
}