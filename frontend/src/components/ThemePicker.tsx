import { THEMES } from "../lib/themes";
import { setSettings } from "../lib/sync";
import { useTravelStore } from "../store/travelStore";

export function ThemePicker({ labelsOption }: { labelsOption?: string }) {
  const themeId = useTravelStore((s) => s.theme);
  const showLabels = useTravelStore((s) => s.showLabels);

  return (
    <section>
      <fieldset className="m-0 border-0 p-0">
        <legend className="mb-2 p-0 text-base font-bold">Map colors</legend>
        <div className="flex flex-wrap gap-2">
          {THEMES.map((theme) => (
            <label key={theme.id} className="cursor-pointer text-center text-sm">
              <input
                type="radio"
                name="theme"
                className="peer sr-only"
                checked={theme.id === themeId}
                onChange={() => setSettings({ theme: theme.id })}
              />
              <span
                aria-hidden="true"
                className="mb-1 block h-10 w-14 rounded-md border-2 border-curb peer-checked:border-asphalt peer-focus-visible:outline-3 peer-focus-visible:outline-lane"
                style={{
                  background: `linear-gradient(135deg, ${theme.visited} 0 50%, ${theme.land} 50% 100%)`,
                  boxShadow: `inset 0 0 0 3px ${theme.background}`,
                }}
              />
              {theme.name}
            </label>
          ))}
        </div>
      </fieldset>
      {labelsOption && (
        <label className="mt-3 flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            className="size-4 accent-sign"
            checked={showLabels}
            onChange={(event) => setSettings({ showLabels: event.target.checked })}
          />
          {labelsOption}
        </label>
      )}
    </section>
  );
}
