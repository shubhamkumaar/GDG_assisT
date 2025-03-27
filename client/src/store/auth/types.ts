export interface User {
  // username: string;
  name: string;
  email: string;
  token: string;
}

export interface AuthState {
  user: User | null;
  error: string | null;
  token: string | null;
}
