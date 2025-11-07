// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import {
    authService,
    User,
    LoginCredentials,
    RegisterData,
    AuthResponse,
    ApiResponse,
} from "@/services/auth.service";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string | number) => Promise<void>;
    register: (email: string, password: string | number, fullName: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(authService.getStoredUser());
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const init = async () => {
            try {
                const token = localStorage.getItem("auth_token");
                if (token) {
                    const res = await authService.getCurrentUser();
                    if (res?.data) {
                        setUser(res.data);
                        return;
                    }
                }
                // fallback to stored user if available
                setUser(authService.getStoredUser());
            } catch (err) {
                console.warn("[AuthProvider] init error:", err);
                localStorage.removeItem("auth_token");
                localStorage.removeItem("user");
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        void init();
    }, []);

    const handleAuthSuccess = (response: ApiResponse<AuthResponse>) => {
        if (!response || !response.data) throw new Error("Invalid auth response");

        const { token, user } = response.data;
        if (!token || !user) throw new Error("Incomplete auth response");

        localStorage.setItem("auth_token", token);
        localStorage.setItem("user", JSON.stringify(user));
        setUser(user);
    };

    const login = async (email: string, password: string | number): Promise<void> => {
        const payload: LoginCredentials = { email, password: password.toString() };
        const response = await authService.login(payload);
        console.log("[AuthContext] login response:", response);
        handleAuthSuccess(response);
    };

    const register = async (email: string, password: string | number, fullName: string): Promise<void> => {
        const payload: RegisterData = {
            email,
            password: password.toString(),
            full_name: fullName,
        };
        const response = await authService.register(payload);
        console.log("[AuthContext] register response:", response);
        handleAuthSuccess(response);
    };

    const logout = async (): Promise<void> => {
        try {
            await authService.logout();
        } catch (e) {
            console.warn("[AuthContext] logout warning:", e);
        } finally {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user");
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
    return ctx;
};
