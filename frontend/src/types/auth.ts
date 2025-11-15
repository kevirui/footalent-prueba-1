export interface IRegisterData {
    name: string;
    email: string;
    password: string;
}

export interface IApiResponse {
    [x: string]: any;
    success: boolean;
    message: string;
    statusCode?: number;
    errors?: string[];
}

export interface ILoginData {
    email: string;
    password: string;
}

export interface ILoginResponse {
    success: boolean;
    message: string;
    data: {
        token: string;
        user: { id: string | number; email: string; name?: string; role?: string };
    };
}

export interface ApiError extends Error {
    statusCode?: number;
    success?: boolean;
    errors?: string[];
}