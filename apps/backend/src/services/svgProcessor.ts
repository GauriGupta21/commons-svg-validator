import { validateSVG } from "./svgValidator";
import { sanitizeSVG } from "./svgSanitizer";
import { repairSVG } from "./repairEngine";
import { generateSanitizationReport } from "./sanitizationReport";
import { getCommonsStatus } from "./commonsStatus";
import { generateOptimizationReport } from "./optimizationReport";

export async function processSVG(buffer: Buffer) {
  const content = buffer.toString("utf-8");

  // Validate original content
  const validation = validateSVG(content);

  // Sanitize (existing pipeline — SVGO-based)
  const sanitized = sanitizeSVG(content);

  // Auto-repair (new — deterministic regex + safe SVGO plugins)
  const { content: repairedContent, report: repairReport } = repairSVG(content);

  const report = generateSanitizationReport(content, sanitized);
  const commonsStatus = getCommonsStatus(validation.score);
  const optimizationReport = generateOptimizationReport(sanitized);

  return {
    type: "svg",
    originalSize: buffer.length,
    sanitizedSize: Buffer.byteLength(sanitized),
    repairedSize: Buffer.byteLength(repairedContent),
    validation,           // { valid, score, issues, suggestions }
    compatibility: {
      score: validation.score,
    },
    commonsStatus,
    report,
    repairReport,         // { repaired, fixesApplied }
    optimizationReport,
    originalContent: content,
    sanitizedContent: sanitized,
    repairedContent,      // ready for download
    output: sanitized,
  };
}