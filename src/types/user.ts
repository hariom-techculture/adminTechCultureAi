export interface User {
  name: string;
  email: string;
  role: string;
  profilePicture?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  signOut: () => void;
  loading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
}
