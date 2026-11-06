import { Link, NavLink } from "react-router";
import { useAuthStore } from "../store/authStore";
import { logOut } from "../lib/sync";
import { useTravelStore } from "../store/travelStore";

const navLink = ({ isActive }: { isActive: boolean }) =>
  `rounded px-3 py-1.5 font-semibold text-white no-underline ${isActive ? "bg-white/20" : "hover:bg-white/10"}`;

export function Header() {
  const user = useAuthStore((s) => s.user);
  const openDialog = useAuthStore((s) => s.openDialog);
  const syncError = useTravelStore((s) => s.syncError);
  const setSyncError = useTravelStore((s) => s.setSyncError);

  return (
    <header>
      <div className="bg-sign text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link to="/" className="text-xl font-extrabold tracking-tight text-white no-underline">
            Where I've Been
          </Link>
          <nav className="flex gap-1" aria-label="Maps">
            <NavLink to="/" end className={navLink}>
              United States
            </NavLink>
            <NavLink to="/world" className={navLink}>
              World
            </NavLink>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            {user ? (
              <>
                <span className="font-semibold">{user.displayName}</span>
                <button
                  type="button"
                  className="cursor-pointer rounded border-2 border-white bg-transparent px-3 py-1 font-semibold text-white hover:bg-white/10"
                  onClick={logOut}
                >
                  Log out
                </button>
              </>
            ) : (
              <button
                type="button"
                className="cursor-pointer rounded border-2 border-white bg-transparent px-3 py-1 font-semibold text-white hover:bg-white/10"
                onClick={openDialog}
              >
                Log in
              </button>
            )}
          </div>
        </div>
      </div>
      {syncError && (
        <div role="alert" className="bg-lane text-asphalt">
          <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2">
            <p className="m-0 flex-1 font-semibold">Not saved to your account: {syncError}</p>
            <button
              type="button"
              className="cursor-pointer border-0 bg-transparent font-semibold underline"
              onClick={() => setSyncError(null)}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
