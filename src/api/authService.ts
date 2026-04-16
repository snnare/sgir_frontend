import api from './client';
import { LoginResponseSchema, UserResponseSchema } from './types';
import type { LoginInput, LoginResponse, RegisterInput, UserResponse, UserUpdateInput } from './types';

export const login = async (credentials: LoginInput): Promise<LoginResponse> => {
    // FastAPI OAuth2PasswordRequestForm requiere x-www-form-urlencoded
    const formData = new URLSearchParams();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);

    const { data } = await api.post('/users/login', formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });

    return LoginResponseSchema.parse(data);
};

export const register = async (userData: RegisterInput): Promise<UserResponse> => {
    const { data } = await api.post('/users/', userData);
    return UserResponseSchema.parse(data);
};

export const getMe = async (): Promise<UserResponse> => {
    const { data } = await api.get('/users/me');
    return UserResponseSchema.parse(data);
};

export const logout = async (): Promise<void> => {
    await api.post('/users/logout');
};

export const updateUser = async (userId: number, userData: UserUpdateInput): Promise<UserResponse> => {
    const { data } = await api.put(`/users/${userId}`, userData);
    return UserResponseSchema.parse(data);
};
