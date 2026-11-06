type Props = { onZoomIn: () => void; onZoomOut: () => void; onReset: () => void };

export function ZoomControls({ onZoomIn, onZoomOut, onReset }: Props) {
  return (
    <div className="absolute right-3 top-3 flex gap-1">
      <button type="button" className="button !px-3" onClick={onZoomIn} aria-label="Zoom in">
        +
      </button>
      <button type="button" className="button !px-3" onClick={onZoomOut} aria-label="Zoom out">
        −
      </button>
      <button type="button" className="button" onClick={onReset}>
        Reset
      </button>
    </div>
  );
}
