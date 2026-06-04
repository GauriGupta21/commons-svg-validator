"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUnsupportedFeatures = checkUnsupportedFeatures;
function checkUnsupportedFeatures(content) {
    const issues = [];
    const unsupported = [
        "feGaussianBlur",
        "feDisplacementMap",
        "animateMotion"
    ];
    for (const feature of unsupported) {
        if (content.includes(feature)) {
            issues.push({
                category: "Compatibility",
                severity: "warning",
                message: `Potentially unsupported SVG feature: ${feature}`
            });
        }
    }
    return issues;
}
