import { validateSVG } from "../../services/svgValidator";
import { sanitizeSVG } from "../../services/svgSanitizer";
import { repairSVG } from "../../services/repairEngine";
import { generateSanitizationReport } from "../../services/sanitizationReport";
import { getCommonsStatus } from "../../services/commonsStatus";
import { generateOptimizationReport } from "../../services/optimizationReport";

export async function processSVG(buffer: Buffer) {
  const content = buffer.toString("utf-8");

  const validation = validateSVG(content);
  const sanitized = sanitizeSVG(content);
  const { content: repairedContent, report: repairReport } = repairSVG(content);

  const report = generateSanitizationReport(content, sanitized);
  const commonsStatus = getCommonsStatus(validation.score);
  const optimizationReport = generateOptimizationReport(sanitized);


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