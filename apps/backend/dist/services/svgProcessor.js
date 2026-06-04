"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processSVG = processSVG;
const svgValidator_1 = require("./svgValidator");
const svgSanitizer_1 = require("./svgSanitizer");
const repairEngine_1 = require("./repairEngine");
const sanitizationReport_1 = require("./sanitizationReport");
const commonsStatus_1 = require("./commonsStatus");
const optimizationReport_1 = require("./optimizationReport");
async function processSVG(buffer) {
    const content = buffer.toString("utf-8");
    // Validate original content
    const validation = (0, svgValidator_1.validateSVG)(content);
    // Sanitize (existing pipeline — SVGO-based)
    const sanitized = (0, svgSanitizer_1.sanitizeSVG)(content);
    // Auto-repair (new — deterministic regex + safe SVGO plugins)
    const { content: repairedContent, report: repairReport } = (0, repairEngine_1.repairSVG)(content);
    const report = (0, sanitizationReport_1.generateSanitizationReport)(content, sanitized);
    const commonsStatus = (0, commonsStatus_1.getCommonsStatus)(validation.score);
    const optimizationReport = (0, optimizationReport_1.generateOptimizationReport)(sanitized);
    return {
        type: "svg",
        originalSize: buffer.length,
        sanitizedSize: Buffer.byteLength(sanitized),
        repairedSize: Buffer.byteLength(repairedContent),
        validation, // { valid, score, issues, suggestions }
        compatibility: {
            score: validation.score,
        },
        commonsStatus,
        report,
        repairReport, // { repaired, fixesApplied }
        optimizationReport,
        originalContent: content,
        sanitizedContent: sanitized,
        repairedContent, // ready for download
        output: sanitized,
    };
}
