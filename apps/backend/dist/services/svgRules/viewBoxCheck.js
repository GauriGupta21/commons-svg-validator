"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkViewBox = checkViewBox;
function checkViewBox(content) {
    const issues = [];
    if (!content.includes("viewBox")) {
        issues.push({
            category: "Structure",
            severity: "warning",
            message: "Missing viewBox attribute — SVG may not scale correctly"
        });
    }
    return issues;
}
