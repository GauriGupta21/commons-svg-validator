"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkTextElements = checkTextElements;
function checkTextElements(content) {
    const issues = [];
    const count = (content.match(/<text/gi) || [])
        .length;
    if (count > 0) {
        issues.push({
            category: "Compatibility",
            severity: "info",
            message: `${count} text element(s) found — fonts may not render correctly on Commons`
        });
    }
    return issues;
}
