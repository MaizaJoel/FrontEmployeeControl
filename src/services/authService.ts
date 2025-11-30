import axiosClient from '../api/axiosClient';

export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
}

export const authService = {
    changePassword: async (data: ChangePasswordData) => {
        const response = await axiosClient.post('/Auth/change-password', data);
        return response.data;
    }
};