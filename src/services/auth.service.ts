import { apiService } from './api.service';
import { API_ENDPOINTS } from '@/config/api.config';

export interface User {
    fullName: string ;
    id: string;
    email: string;

    avatar_url?: string;
    created_at?: string;
}

export interface LoginCredentials {
    email: string;
    password: string | number; // ✅ allow number or string
}

export interface RegisterData {
    email: string;
    password: string | number;
    full_name: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface ApiResponse<T> {
    data?: T;
    error?: string;
    message?: string;
}

class AuthService {
    // 🔹 LOGIN
    async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
        const response = await apiService.post<AuthResponse>(
            API_ENDPOINTS.AUTH.LOGIN,
            credentials
        );

        if (response?.data) {
            localStorage.setItem('auth_token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }

        return response;
    }

    // 🔹 REGISTER
    async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
        const response = await apiService.post<AuthResponse>(
            API_ENDPOINTS.AUTH.REGISTER,
            data
        );

        if (response?.data) {
            localStorage.setItem('auth_token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }

        return response;
    }

    // 🔹 LOGOUT
    async logout(): Promise<void> {
        try {
            await apiService.post(API_ENDPOINTS.AUTH.LOGOUT);
        } catch (err) {
            console.warn('Logout API failed, continuing...', err);
        }

        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
    }

    // 🔹 RESET PASSWORD
    async resetPassword(email: string, newPassword: string | number): Promise<ApiResponse<{ message?: string }>> {
        return apiService.post<{ message?: string }>(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
            email,
            newPassword: String(newPassword),
        });
    }



    // 🔹 GET CURRENT USER
    async getCurrentUser(): Promise<ApiResponse<User>> {
        const response = await apiService.get<User>(API_ENDPOINTS.AUTH.ME);
        if (response?.data) {
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response;
    }

    // 🔹 LOCAL HELPERS
    getStoredUser(): User | null {
        const userStr = localStorage.getItem('user');
        try {
            return userStr ? (JSON.parse(userStr) as User) : null;
        } catch {
            return null;
        }
    }

    isAuthenticated(): boolean {
        return !!localStorage.getItem('auth_token');
    }
}

export const authService = new AuthService();
