export interface User {
  id: number;
  username: string;
  password: string;
  role: 'admin' | 'user';
  model?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: Omit<User, 'password'>;
}
