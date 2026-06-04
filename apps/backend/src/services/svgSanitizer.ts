import { optimize } from "svgo";

export function sanitizeSVG(content: string): string {
  // Remove dangerous tags manually first
  let cleaned = content
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<foreignObject[\s\S]*?>[\s\S]*?<\/foreignObject>/gi, "")
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, "");

  // Run SVGO — if it fails (malformed SVG), return manually cleaned content
  try {
    const result = optimize(cleaned, {
      multipass: true,
      plugins: [
        "removeMetadata",
        "removeComments",
        "removeEditorsNSData",
        "cleanupAttrs",
        "removeUselessDefs",
        "removeEmptyAttrs",
        "removeHiddenElems",
        "removeUselessStrokeAndFill",
      ],
    });
    return result.data;
  } catch {
    return cleaned;
  }
}