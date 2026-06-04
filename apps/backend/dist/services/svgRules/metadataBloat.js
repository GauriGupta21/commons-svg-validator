"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkMetadataBloat = checkMetadataBloat;
function checkMetadataBloat(content) {
    const issues = [];
    const bloatedTags = [
        "metadata",
        "sodipodi",
        "inkscape",
        "adobe"
    ];
    for (const item of bloatedTags) {
        if (content
            .toLowerCase()
            .includes(item)) {
            issues.push({
                category: "Metadata",
                severity: "warning",
                message: `Editor metadata detected: ${item}`
            });
        }
    }
    return issues;
}
