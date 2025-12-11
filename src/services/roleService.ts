import axiosClient from '../api/axiosClient';

export interface Role {
    id: string;
    name: string;
}

// Nuevo: Interfaz para usuario con roles
export interface UserWithRoles {
    id: string;
    userName: string;
    email: string;
    roles: string[];
}

export interface CreateRole {
    name: string;
    template?: string;
}

export interface PermissionCheckbox {
    value: string;
    isSelected: boolean;
}
export interface RolePermissions {
    roleId: string;
    roleName: string;
    permissions: PermissionCheckbox[];
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
        const response = await axiosClient.delete(`/Roles/${id}`);
        return response.data;
    },

    getUsers: async () => {
        const response = await axiosClient.get<UserWithRoles[]>('/Roles/Users');
        return response.data;
    },

    assignRole: async (userId: string, roleName: string) => {
        const response = await axiosClient.post('/Roles/Assign', { userId, roleName });
        return response.data;
    },

    removeRole: async (userId: string, roleName: string) => {
        const response = await axiosClient.post('/Roles/Remove', { userId, roleName });
        return response.data;
    },

    getPermissions: async (roleId: string) => {
        const response = await axiosClient.get<RolePermissions>(`/Roles/${roleId}/Permissions`);
        return response.data;
    },

    updatePermissions: async (roleId: string, selectedPermissions: string[]) => {
        const response = await axiosClient.put(`/Roles/${roleId}/Permissions`, { selectedPermissions });
        return response.data;
    }
};