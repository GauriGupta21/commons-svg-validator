import type { ValidationIssue } from "../types/suggestion";

/**
 * Checks structural integrity issues that xmldom silently ignores.
 * These are hard errors for Commons upload.
 */
export function checkStructuralIntegrity(content: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // 1. Missing </svg> closing tag
  if (/<svg[\s>]/i.test(content) && !/<\/svg\s*>/i.test(content)) {
    issues.push({
      category: "Structure",
      severity: "error",
      message: "Missing </svg> closing tag — file is malformed and will be rejected by Commons",
    });
  }

  // 2. SVG tag opened but never closed (self-closing svg not valid)
  const openCount  = (content.match(/<svg[\s>]/gi) ?? []).length;
  const closeCount = (content.match(/<\/svg\s*>/gi) ?? []).length;
  if (openCount > 0 && closeCount > 0 && openCount !== closeCount) {
    issues.push({
      category: "Structure",
      severity: "error",
      message: `Mismatched <svg> tags — ${openCount} opening vs ${closeCount} closing`,
    });
  }

  // 3. Unclosed common tags (g, defs, symbol, clipPath)
  const blockTags = ["g", "defs", "symbol", "clipPath", "mask", "pattern"];
  for (const tag of blockTags) {
    const open  = (content.match(new RegExp(`<${tag}[\\s>]`, "gi")) ?? []).length;
    const close = (content.match(new RegExp(`<\\/${tag}\\s*>`, "gi")) ?? []).length;
    if (open !== close) {
      issues.push({
        category: "Structure",
        severity: "warning",
        message: `Mismatched <${tag}> tags — ${open} opening vs ${close} closing`,
      });
    }
  }

  // 4. Empty file
  if (content.trim().length === 0) {
    issues.push({
      category: "Structure",
      severity: "error",
      message: "File is empty",
    });
  }

  // 5. File is too small to be a valid SVG (< 20 chars)
  if (content.trim().length > 0 && content.trim().length < 20) {
    issues.push({
      category: "Structure",
      severity: "error",
      message: "File is too small to be a valid SVG",
    });
  }

  return issues;
}