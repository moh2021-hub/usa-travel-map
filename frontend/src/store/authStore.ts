import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../api/types";

type AuthState = {
  token: string | null;
  user: User | null;
  dialogOpen: boolean;
  logIn: (token: string, user: User) => void;
  logOut: () => void;
  openDialog: () => void;
  closeDialog: () => void;
};

/** Who is logged in. The token is kept in the browser so a refresh doesn't log you out. */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      dialogOpen: false,
      logIn: (token, user) => set({ token, user, dialogOpen: false }),
      logOut: () => set({ token: null, user: null }),
      openDialog: () => set({ dialogOpen: true }),
      closeDialog: () => set({ dialogOpen: false }),
    }),
    {
      name: "travelmap-auth",
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
);
