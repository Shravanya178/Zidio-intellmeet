import type { User } from "./user";

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password?: string; // Optionnel si on utilise uniquement Google par exemple
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
}