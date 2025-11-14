export interface IUser {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string; 
}

export interface UsersResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: IUser[];
  page: number;
  total: number;
  pages: number;
}