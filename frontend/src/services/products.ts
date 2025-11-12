import { API_BASE_URL } from "../lib/constants";

interface Product {
    id: number;
    title: string;
    price: number;
    category: string;
    image: string;
}


export async function getAllProducts(page: number, limit: number): Promise<Product[]> {
    // Realiza la solicitud a la API incluyendo los parámetros de paginación
    const response = await fetch(`${API_BASE_URL}/products?page=${page}&limit=${limit}`);

    const data = await response.json();
    
    return data;
}