// src/api/index.ts

const API_BASE = "http://localhost:8080"; // Spring Boot backend

// Generic response type
export async function apiGet<T>(path: string): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    if (!response.ok) throw new Error(`GET ${path} failed: ${response.statusText}`);
    return (await response.json()) as T;
}

export async function apiPost<T, B>(path: string, body: B): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`POST ${path} failed: ${response.statusText}`);
    return (await response.json()) as T;
}

export async function apiPut<T, B>(path: string, body: B): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`PUT ${path} failed: ${response.statusText}`);
    return (await response.json()) as T;
}

export async function apiDelete<T>(path: string): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });
    if (!response.ok) throw new Error(`DELETE ${path} failed: ${response.statusText}`);
    return (await response.json()) as T;
}
