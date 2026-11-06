export type SignRow = { label: string; value: number; total?: number };

/** The totals, laid out like a highway distance sign: place on the left, number on the right. */
export function RoadSign({ rows }: { rows: SignRow[] }) {
  return (
    <div className="road-sign">
      <dl className="road-sign-face m-0 grid gap-1">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-4">
            <dt className="text-xl font-semibold">{row.label}</dt>
            <dd className="m-0 text-4xl font-extrabold tabular-nums leading-tight">
              {row.value}
              {row.total !== undefined && <span className="text-xl font-semibold"> of {row.total}</span>}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
