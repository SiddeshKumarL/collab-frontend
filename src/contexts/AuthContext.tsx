// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
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

    // helper type guards
    const isAuthResponse = (obj: unknown): obj is AuthResponse =>
        typeof obj === "object" && obj != null && "user" in (obj as any) && "token" in (obj as any);

    const isUser = (obj: unknown): obj is User =>
        typeof obj === "object" && obj != null && "id" in (obj as any) && "email" in (obj as any);

    useEffect(() => {
        const init = async () => {
            try {
                const token = localStorage.getItem("auth_token");
                if (token) {
                    const res = await authService.getCurrentUser();
                    console.log("[AuthProvider] getCurrentUser:", res);
                    if (res?.data && isUser(res.data)) {
                        setUser(res.data);
                        setLoading(false);
                        return;
                    }
                }
                // fallback to stored user (localStorage)
                setUser(authService.getStoredUser());
            } catch (err) {
                console.warn("[AuthProvider] init error:", err);
                setUser(null);
                localStorage.removeItem("auth_token");
                localStorage.removeItem("user");
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const login = async (email: string, password: string | number): Promise<void> => {
        const payload: LoginCredentials = { email, password: password.toString() };
        const response: ApiResponse<AuthResponse> = await authService.login(payload);

        console.log("[AuthContext] login response:", response);

        // 1) if data exists and has user
        if (response.data && isAuthResponse(response.data)) {
            setUser(response.data.user);
            return;
        }

        // 2) some backends return user directly in data (User)
        if (response.data && isUser(response.data)) {
            setUser(response.data);
            return;
        }

        // 3) maybe response contains error
        if (response.error) {
            throw new Error(response.error);
        }

        // 4) fallback: try to fetch current user if token was stored by authService
        const me = await authService.getCurrentUser();
        if (me.data && isUser(me.data)) {
            setUser(me.data);
            return;
        }

        throw new Error("Login failed: unexpected server response");
    };

    const register = async (email: string, password: string | number, fullName: string): Promise<void> => {
        const payload: RegisterData = { email, password: password.toString(), full_name: fullName } as any;
        const response: ApiResponse<AuthResponse> = await authService.register(payload);

        console.log("[AuthContext] register response:", response);

        if (response.data && isAuthResponse(response.data)) {
            setUser(response.data.user);
            return;
        }
        if (response.data && isUser(response.data)) {
            setUser(response.data);
            return;
        }
        if (response.error) {
            throw new Error(response.error);
        }

        // attempt to fetch user after register if token set
        const me = await authService.getCurrentUser();
        if (me.data && isUser(me.data)) {
            setUser(me.data);
            return;
        }

        throw new Error("Register failed: unexpected server response");
    };

    const logout = async (): Promise<void> => {
        try {
            await authService.logout();
        } catch (e) {
            console.warn("[AuthContext] logout warning:", e);
        } finally {
            setUser(null);
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user");
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
