"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPathComplexity = checkPathComplexity;
function checkPathComplexity(content) {
    const issues = [];
    const pathCount = (content.match(/<path/gi) || [])
        .length;
    if (pathCount > 5000) {
        issues.push({
            category: "Optimization",
            severity: "warning",
            message: `Extremely complex SVG detected (${pathCount} paths)`
        });
    }
    return issues;
}
