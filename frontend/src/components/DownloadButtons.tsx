import { useState } from "react";
import { downloadMap, type ExportFormat } from "../lib/exportMap";
import { getTheme } from "../lib/themes";
import { useTravelStore } from "../store/travelStore";

type Props = {
  getSvg: () => SVGSVGElement | null;
  title: string;
  summary: string;
  fileName: string;
};

const FORMATS: { format: ExportFormat; label: string }[] = [
  { format: "png", label: "PNG" },
  { format: "jpg", label: "JPG" },
  { format: "pdf", label: "PDF" },
];

export function DownloadButtons({ getSvg, title, summary, fileName }: Props) {
  const themeId = useTravelStore((s) => s.theme);
  const [busy, setBusy] = useState<ExportFormat | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function download(format: ExportFormat) {
    const svg = getSvg();
    if (!svg) return;
    setBusy(format);
    setError(null);
    try {
      await downloadMap(svg, { format, title, summary, fileName, theme: getTheme(themeId) });
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "The download failed. Try another format.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section>
      <h2 className="mb-2 mt-0 text-base font-bold">Download your map</h2>
      <div className="flex gap-2">
        {FORMATS.map(({ format, label }) => (
          <button
            key={format}
            type="button"
            className="button flex-1"
            disabled={busy !== null}
            onClick={() => download(format)}
          >
            {busy === format ? "Saving…" : label}
          </button>
        ))}
      </div>
      {error && (
        <p role="alert" className="mb-0 mt-2 text-sm text-red-800">
          {error}
        </p>
      )}
    </section>
  );
}
