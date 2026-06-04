import { DOMParser } from "xmldom";
import { checkDangerousTags } from "./svgRules/dangerousTags";
import { checkMetadataBloat } from "./svgRules/metadataBloat";
import { checkPathComplexity } from "./svgRules/pathComplexity";
import { checkUnsupportedFeatures } from "./svgRules/unsupportedFeatures";
import { checkStructureAnalysis } from "./svgRules/structureAnalysis";
import { checkExternalReferences } from "./svgRules/externalReferences";
import { checkEmbeddedImages } from "./svgRules/embeddedImages";
import { checkViewBox } from "./svgRules/viewBoxCheck";
import { checkTextElements } from "./svgRules/textElements";
import { checkStructuralIntegrity } from "./structuralIntegrity";
import { generateSuggestions } from "./suggestionEngine";
import type { ValidationIssue, ValidationResult } from "../types/suggestion";

export type { ValidationIssue, ValidationResult };

export function validateSVG(content: string): ValidationResult {
  const issues: ValidationIssue[] = [];

  // ── Structural integrity first (catches what xmldom misses) ───────────────
  issues.push(...checkStructuralIntegrity(content));

  // ── XML Parsing ───────────────────────────────────────────────────────────
  try {
    const parser = new DOMParser({
      errorHandler: {
        warning() {},
        error(message: any) {
          issues.push({
            category: "Structure",
            severity: "error",
            message: `XML Error: ${message}`,
          });
        },
        fatalError(message: any) {
          issues.push({
            category: "Structure",
            severity: "error",
            message: `Fatal XML Error: ${message}`,
          });
        },
      },
    });
    parser.parseFromString(content, "image/svg+xml");
  } catch {
    issues.push({
      category: "Structure",
      severity: "error",
      message: "Failed to parse SVG XML",
    });
  }

  // ── Rule-based checks ─────────────────────────────────────────────────────
  issues.push(
    ...checkDangerousTags(content),
    ...checkMetadataBloat(content),
    ...checkPathComplexity(content),
    ...checkUnsupportedFeatures(content),
    ...checkStructureAnalysis(content),
    ...checkExternalReferences(content),
    ...checkEmbeddedImages(content),
    ...checkViewBox(content),
    ...checkTextElements(content)
  );

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
    if (issue.severity === "error")        score -= 25;
    else if (issue.severity === "warning") score -= 10;
    else if (issue.severity === "info")    score -= 3;
  }
  if (score < 0) score = 0;

  // ── Suggestions ───────────────────────────────────────────────────────────
  const suggestions = generateSuggestions(issues);

  return {
    valid: issues.filter((i) => i.severity === "error").length === 0,
    score,
    issues,
    suggestions,
  };
}