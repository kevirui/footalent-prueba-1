"use client";

import { useState } from "react";
import { registerUser } from "../lib/apiService";
import { IRegisterData, IApiResponse } from "../types/auth";

export const useRegister = () => {
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<IApiResponse | null>(null);

    const handleRegister = async (data: IRegisterData) => {
        setLoading(true);
        try {
            const result = await registerUser(data);
            setResponse(result);
            return result;
        } catch (error: unknown) {
            if (error instanceof Error) {
                const errorResponse = {
                    success: false,
                    statusCode: 500,
                    message: error.message || "Error desconocido",
                };
                setResponse(errorResponse);
            }
        } finally {
            setLoading(false);
        }
    };

    return { loading, response, handleRegister };
};
