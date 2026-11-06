import type { Theme } from "./themes";

export type ExportFormat = "png" | "jpg" | "pdf";

type ExportOptions = {
  format: ExportFormat;
  /** Big heading, e.g. "My United States". */
  title: string;
  /** Line under the heading, e.g. "12 of 50 states, 38 cities". */
  summary: string;
  theme: Theme;
  fileName: string;
};

const PADDING = 48;
const HEADER = 130;
const FOOTER = 56;
const PIXEL_RATIO = 2; // draw at double size so the image stays sharp when printed

/**
 * Turns the map on screen into a downloadable picture.
 *
 * The map is an <svg>, so it is copied as text, loaded as an image, and drawn
 * onto a <canvas> together with a heading. The canvas then becomes a PNG or
 * JPG, or is placed on a single-page PDF.
 */
export async function downloadMap(svg: SVGSVGElement, options: ExportOptions): Promise<void> {
  const { width: mapWidth, height: mapHeight } = svg.viewBox.baseVal;
  const width = mapWidth + PADDING * 2;
  const height = mapHeight + HEADER + FOOTER;

  const canvas = document.createElement("canvas");
  canvas.width = width * PIXEL_RATIO;
  canvas.height = height * PIXEL_RATIO;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser can't create images.");
  context.scale(PIXEL_RATIO, PIXEL_RATIO);

  const { theme } = options;
  context.fillStyle = theme.background;
  context.fillRect(0, 0, width, height);

  const fontFamily = getComputedStyle(document.body).fontFamily;
  await document.fonts.load(`800 44px ${fontFamily}`).catch(() => undefined);
  context.textBaseline = "alphabetic";
  context.fillStyle = theme.ink;
  context.font = `800 44px ${fontFamily}`;
  context.fillText(options.title, PADDING, 72);
  context.fillStyle = theme.mutedInk;
  context.font = `500 22px ${fontFamily}`;
  context.fillText(options.summary, PADDING, 108);

  context.drawImage(await svgToImage(svg, mapWidth, mapHeight), PADDING, HEADER, mapWidth, mapHeight);

  context.font = `500 14px ${fontFamily}`;
  context.fillText(window.location.host, PADDING, height - 24);

  if (options.format === "pdf") {
    const { jsPDF } = await import("jspdf"); // loaded only when someone asks for a PDF
    const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: [width, height] });
    pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, width, height);
    pdf.save(`${options.fileName}.pdf`);
    return;
  }

  const type = options.format === "png" ? "image/png" : "image/jpeg";
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.92));
  if (!blob) throw new Error("The image could not be created.");
  saveBlob(blob, `${options.fileName}.${options.format}`);
}

function svgToImage(svg: SVGSVGElement, width: number, height: number): Promise<HTMLImageElement> {
  const copy = svg.cloneNode(true) as SVGSVGElement;
  copy.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  copy.setAttribute("width", String(width));
  copy.setAttribute("height", String(height));
  const url = URL.createObjectURL(
    new Blob([new XMLSerializer().serializeToString(copy)], { type: "image/svg+xml;charset=utf-8" }),
  );
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("The map could not be turned into an image."));
    };
    image.src = url;
  });
}

function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
