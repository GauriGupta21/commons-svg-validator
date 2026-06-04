"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processPNG = processPNG;
async function processPNG(buffer) {
    const issues = [];
    if (buffer.length >
        15 * 1024 * 1024) {
        issues.push({
            severity: "warning",
            message: "Large PNG files may be inefficient on Commons"
        });
    }
    return {
        type: "png",
        originalSize: buffer.length,
        validation: {
            valid: true,
            issues
        }
    };
}
