"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processGIF = processGIF;
async function processGIF(buffer) {
    const issues = [];
    if (buffer.length >
        10 * 1024 * 1024) {
        issues.push({
            severity: "warning",
            message: "Large GIF files may perform poorly on Commons"
        });
    }
    return {
        type: "gif",
        originalSize: buffer.length,
        validation: {
            valid: true,
            issues
        }
    };
}
