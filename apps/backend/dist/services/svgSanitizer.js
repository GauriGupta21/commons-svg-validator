"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeSVG = sanitizeSVG;
const svgo_1 = require("svgo");
function sanitizeSVG(content) {
    // Remove dangerous tags manually first
    let cleaned = content
        .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
        .replace(/<foreignObject[\s\S]*?>[\s\S]*?<\/foreignObject>/gi, "")
        .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, "");
    // Run SVGO — if it fails (malformed SVG), return manually cleaned content
    try {
        const result = (0, svgo_1.optimize)(cleaned, {
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
    }
    catch {
        return cleaned;
    }
}
