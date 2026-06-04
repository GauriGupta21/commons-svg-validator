"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkEmbeddedImages = checkEmbeddedImages;
function checkEmbeddedImages(content) {
    const issues = [];
    if (content.includes("<image")) {
        issues.push({
            category: "Compatibility",
            severity: "warning",
            message: "Embedded raster image detected"
        });
    }
    return issues;
}
