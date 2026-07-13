import { create } from "zustand";
import type { User } from "@spandan/shared-types";

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem("spandan_token"),
  setAuth: (user, token) => {
    localStorage.setItem("spandan_token", token);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem("spandan_token");
    set({ user: null, token: null });
  },
}));
