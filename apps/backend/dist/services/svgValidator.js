"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSVG = validateSVG;
const xmldom_1 = require("xmldom");
const dangerousTags_1 = require("./svgRules/dangerousTags");
const metadataBloat_1 = require("./svgRules/metadataBloat");
const pathComplexity_1 = require("./svgRules/pathComplexity");
const unsupportedFeatures_1 = require("./svgRules/unsupportedFeatures");
const structureAnalysis_1 = require("./svgRules/structureAnalysis");
const externalReferences_1 = require("./svgRules/externalReferences");
const embeddedImages_1 = require("./svgRules/embeddedImages");
const viewBoxCheck_1 = require("./svgRules/viewBoxCheck");
const textElements_1 = require("./svgRules/textElements");
const structuralIntegrity_1 = require("./structuralIntegrity");
const suggestionEngine_1 = require("./suggestionEngine");
function validateSVG(content) {
    const issues = [];
    // ── Structural integrity first (catches what xmldom misses) ───────────────
    issues.push(...(0, structuralIntegrity_1.checkStructuralIntegrity)(content));
    // ── XML Parsing ───────────────────────────────────────────────────────────
    try {
        const parser = new xmldom_1.DOMParser({
            errorHandler: {
                warning() { },
                error(message) {
                    issues.push({
                        category: "Structure",
                        severity: "error",
                        message: `XML Error: ${message}`,
                    });
                },
                fatalError(message) {
                    issues.push({
                        category: "Structure",
                        severity: "error",
                        message: `Fatal XML Error: ${message}`,
                    });
                },
            },
        });
        parser.parseFromString(content, "image/svg+xml");
    }
    catch {
        issues.push({
            category: "Structure",
            severity: "error",
            message: "Failed to parse SVG XML",
        });
    }
    // ── Rule-based checks ─────────────────────────────────────────────────────
    issues.push(...(0, dangerousTags_1.checkDangerousTags)(content), ...(0, metadataBloat_1.checkMetadataBloat)(content), ...(0, pathComplexity_1.checkPathComplexity)(content), ...(0, unsupportedFeatures_1.checkUnsupportedFeatures)(content), ...(0, structureAnalysis_1.checkStructureAnalysis)(content), ...(0, externalReferences_1.checkExternalReferences)(content), ...(0, embeddedImages_1.checkEmbeddedImages)(content), ...(0, viewBoxCheck_1.checkViewBox)(content), ...(0, textElements_1.checkTextElements)(content));
    // ── SVG root check ────────────────────────────────────────────────────────
    if (!content.includes("<svg")) {
        issues.push({
            category: "Structure",
            severity: "error",
            message: "Missing <svg> root element",
        });
    }
    // ── Size check ────────────────────────────────────────────────────────────
    if (content.length > 5 * 1024 * 1024) {
        issues.push({
            category: "Optimization",
            severity: "warning",
            message: "Very large SVG file detected",
        });
    }
    // ── Compatibility score ───────────────────────────────────────────────────
    let score = 100;
    for (const issue of issues) {
        if (issue.severity === "error")
            score -= 25;
        else if (issue.severity === "warning")
            score -= 10;
        else if (issue.severity === "info")
            score -= 3;
    }
    if (score < 0)
        score = 0;
    // ── Suggestions ───────────────────────────────────────────────────────────
    const suggestions = (0, suggestionEngine_1.generateSuggestions)(issues);
    return {
        valid: issues.filter((i) => i.severity === "error").length === 0,
        score,
        issues,
        suggestions,
    };
}
