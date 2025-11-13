import { API_BASE_URL } from "../lib/constants";
import { IUser, UsersResponse } from "../types/users";


export async function getUserById(id: string): Promise<IUser>{
    const response = await fetch(`${API_BASE_URL}/users/${id}`);
    const dataUser = await response.json();
    return dataUser;
}

export async function getAllUsers(page: number, limit: number): Promise<UsersResponse> {
  // Realiza la solicitud a la API incluyendo los parámetros de paginación
  const response = await fetch(`${API_BASE_URL}/users?page=${page}&limit=${limit}`);

  if (!response.ok) {
    throw new Error(`Error al obtener usuarios: ${response.status}`);
  }

  const data: UsersResponse = await response.json();
  return data;
}