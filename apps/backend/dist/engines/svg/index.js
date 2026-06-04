"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processSVG = processSVG;
const svgValidator_1 = require("../../services/svgValidator");
const svgSanitizer_1 = require("../../services/svgSanitizer");
const repairEngine_1 = require("../../services/repairEngine");
const sanitizationReport_1 = require("../../services/sanitizationReport");
const commonsStatus_1 = require("../../services/commonsStatus");
const optimizationReport_1 = require("../../services/optimizationReport");
async function processSVG(buffer) {
    const content = buffer.toString("utf-8");
    const validation = (0, svgValidator_1.validateSVG)(content);
    const sanitized = (0, svgSanitizer_1.sanitizeSVG)(content);
    const { content: repairedContent, report: repairReport } = (0, repairEngine_1.repairSVG)(content);
    const report = (0, sanitizationReport_1.generateSanitizationReport)(content, sanitized);
    const commonsStatus = (0, commonsStatus_1.getCommonsStatus)(validation.score);
    const optimizationReport = (0, optimizationReport_1.generateOptimizationReport)(sanitized);
    console.log("1 validate");
    console.log("2 sanitize");
    console.log("3 repair");
    console.log("4 sanitization report");
    console.log("5 commons status");
    console.log("6 optimization");
    console.log("7 return");
    return {
        type: "svg",
        originalSize: buffer.length,
        sanitizedSize: Buffer.byteLength(sanitized),
        repairedSize: Buffer.byteLength(repairedContent),
        validation,
        compatibility: {
            score: validation.score,
        },
        commonsStatus,
        report,
        repairReport,
        optimizationReport,
        originalContent: content,
        sanitizedContent: sanitized,
        repairedContent,
        output: sanitized,
    };
}
