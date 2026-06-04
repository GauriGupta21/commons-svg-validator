import type {
  ValidationIssue
} from "../svgValidator";

export function checkPathComplexity(
  content: string
): ValidationIssue[] {

  const issues: ValidationIssue[] = [];

  const pathCount =
    (content.match(/<path/gi) || [])
      .length;

  if (pathCount > 5000) {

    issues.push({

      category: "Optimization",

      severity: "warning",

      message:
        `Extremely complex SVG detected (${pathCount} paths)`

    });

  }

  return issues;

}