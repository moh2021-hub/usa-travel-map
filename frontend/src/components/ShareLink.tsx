import { useState } from "react";
import { api, ApiError } from "../api/client";
import type { ShareLink as ShareLinkResponse } from "../api/types";
import { useAuthStore } from "../store/authStore";

/** Gives a logged-in user a public link to their map. */
export function ShareLink() {
  const loggedIn = useAuthStore((s) => s.token !== null);
  const openDialog = useAuthStore((s) => s.openDialog);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function getLink() {
    setError(null);
    try {
      const { slug } = await api<ShareLinkResponse>("/api/share", { method: "POST" });
      const url = `${window.location.origin}/share/${slug}`;
      setLink(url);
      // Copying can be refused by the browser; the link is still shown so it can be copied by hand.
      setCopied(await navigator.clipboard.writeText(url).then(() => true, () => false));
    } catch (problem) {
      setError(problem instanceof ApiError ? problem.message : "The link could not be created.");
    }
  }

  return (
    <section>
      <h2 className="mb-2 mt-0 text-base font-bold">Share your map</h2>
      {!loggedIn ? (
        <>
          <p className="mb-2 mt-0 text-sm text-gravel">
            Log in to save your map to your account and get a link you can send to friends.
          </p>
          <button type="button" className="button w-full" onClick={openDialog}>
            Log in or create an account
          </button>
        </>
      ) : (
        <>
          <button type="button" className="button w-full" onClick={getLink}>
            Copy share link
          </button>
          {link && (
            <div className="mt-2">
              <input
                className="field text-sm"
                readOnly
                value={link}
                aria-label="Your share link"
                onFocus={(event) => event.target.select()}
              />
              <p className="mb-0 mt-1 text-sm text-gravel" role="status">
                {copied ? "Link copied." : "Select the link and copy it."}
              </p>
            </div>
          )}
        </>
      )}
      {error && (
        <p role="alert" className="mb-0 mt-2 text-sm text-red-800">
          {error}
        </p>
      )}
    </section>
  );
}
