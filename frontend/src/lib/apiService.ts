import { IRegisterData, ILoginData, ILoginResponse, IApiResponse, ApiError } from "../types/auth";

export async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
        const token = typeof window !== "undefined" ? localStorage.getItem("auth") : null;
        let authHeader = {};
        if (token) {
            try {
                const parsed = JSON.parse(token);
                if (parsed?.token) authHeader = { Authorization: `Bearer ${parsed.token}` };
            } catch { }
        }

        const response = await fetch(endpoint, {
            headers: {
                "Content-Type": "application/json",
                ...(options?.headers || {}),
                ...authHeader,
            },
            ...options,
        });

        const body = await response.json().catch(() => null);

        return body as T;

    } catch (error: unknown) {
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error(`API request failed with unknown error`);
        }
    }
}

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

export const registerUser = async (data: IRegisterData): Promise<IApiResponse> => {
    try {
        const result = await apiRequest<IApiResponse>(`${API_URL}/users/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        console.log("📦 Respuesta del backend (registerUser):", result);
        return result;
    } catch (error: unknown) {
        const errorResponse = error as ApiError;
        console.error("❌ Error en registerUser:", error);
        
        return {
            success: false,
            statusCode: errorResponse.statusCode || 500,
            message: errorResponse.message || "Error al registrarse",
            errors: errorResponse?.errors,
        };
    }
};

export const loginUser = async (data: ILoginData): Promise<ILoginResponse> => {
    // reusa apiRequest que ya parsea JSON y arroja cuando response.ok === false
    const result = await apiRequest<ILoginResponse>(`${API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    // result expected: { success: true, message: "...", data: { token, user } }
    if (!result.success) {
        throw new Error(result.message || "Error en login");
    }

    return result;
};