"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkExternalReferences = checkExternalReferences;
function checkExternalReferences(content) {
    const issues = [];
    const regex = /(http:\/\/|https:\/\/)/gi;
    if (regex.test(content)) {
        issues.push({
            category: "Security",
            severity: "warning",
            message: "External references detected"
        });
    }
    return issues;
}
