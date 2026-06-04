"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDangerousTags = checkDangerousTags;
function checkDangerousTags(content) {
    const issues = [];
    const dangerousTags = [
        "script",
        "foreignObject",
        "iframe",
        "embed",
        "object"
    ];
    for (const tag of dangerousTags) {
        const regex = new RegExp(`<${tag}`, "gi");
        if (regex.test(content)) {
            issues.push({
                category: "Security",
                severity: "error",
                message: `Dangerous tag detected: <${tag}>`
            });
        }
    }
    return issues;
}
