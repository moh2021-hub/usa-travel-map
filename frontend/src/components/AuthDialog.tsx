import { useEffect, useRef, useState, type FormEvent } from "react";
import { api, ApiError } from "../api/client";
import type { AuthResponse } from "../api/types";
import { syncAfterLogin } from "../lib/sync";
import { useAuthStore } from "../store/authStore";

type Mode = "login" | "register";

export function AuthDialog() {
  const open = useAuthStore((s) => s.dialogOpen);
  const closeDialog = useAuthStore((s) => s.closeDialog);
  const logIn = useAuthStore((s) => s.logIn);

  const dialog = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<Mode>("login");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
    if (!open && dialog.current?.open) dialog.current.close();
  }, [open]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);
    try {
      const response = await api<AuthResponse>(`/api/auth/${mode}`, {
        method: "POST",
        body: Object.fromEntries(form),
      });
      logIn(response.token, response.user);
      await syncAfterLogin(mode === "register");
    } catch (problem) {
      setError(problem instanceof ApiError ? problem.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  const isRegister = mode === "register";

  return (
    <dialog
      ref={dialog}
      onClose={closeDialog}
      className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-xl border-0 p-0 backdrop:bg-asphalt/60"
    >
      <form onSubmit={submit} className="grid gap-3 p-6">
        <h2 className="m-0 text-2xl font-extrabold">{isRegister ? "Create your account" : "Log in"}</h2>
        <p className="m-0 text-sm text-gravel">
          {isRegister
            ? "The places you've already marked are saved to your new account."
            : "Places you've marked on this device are added to your account."}
        </p>

        {isRegister && (
          <label className="grid gap-1 font-semibold">
            Name shown on your map
            <input name="displayName" className="field font-normal" required maxLength={60} autoComplete="name" />
          </label>
        )}
        <label className="grid gap-1 font-semibold">
          Email
          <input name="email" type="email" className="field font-normal" required autoComplete="email" />
        </label>
        <label className="grid gap-1 font-semibold">
          Password
          <input
            name="password"
            type="password"
            className="field font-normal"
            required
            minLength={isRegister ? 8 : undefined}
            maxLength={72}
            autoComplete={isRegister ? "new-password" : "current-password"}
          />
          {isRegister && <span className="text-sm font-normal text-gravel">At least 8 characters.</span>}
        </label>

        {error && (
          <p role="alert" className="m-0 text-sm text-red-800">
            {error}
          </p>
        )}

        <div className="mt-1 flex gap-2">
          <button type="submit" className="button button-primary flex-1" disabled={busy}>
            {busy ? "One moment…" : isRegister ? "Create account" : "Log in"}
          </button>
          <button type="button" className="button" onClick={closeDialog}>
            Cancel
          </button>
        </div>

        <button
          type="button"
          className="cursor-pointer border-0 bg-transparent p-0 text-left text-sm font-semibold text-sign underline"
          onClick={() => {
            setMode(isRegister ? "login" : "register");
            setError(null);
          }}
        >
          {isRegister ? "I already have an account" : "I don't have an account yet"}
        </button>
      </form>
    </dialog>
  );
}
