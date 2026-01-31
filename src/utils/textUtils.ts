import { AppRoles } from '../constants/roles';

/**
 * Returns the localized display name for a given system role.
 * Used to show "Empleado" instead of "Employee" in the UI.
 */
export const getRoleDisplayName = (roleName: string): string => {
    if (!roleName) return '';
    
    // Normalize comparison
    if (roleName === AppRoles.Employee) return 'Empleado';
    if (roleName === AppRoles.Manager) return 'Gerente'; 
    if (roleName === AppRoles.Asistente) return 'Asistente';
    // Admin usually stays Admin, but can be translated if desired
    
    return roleName;
};
