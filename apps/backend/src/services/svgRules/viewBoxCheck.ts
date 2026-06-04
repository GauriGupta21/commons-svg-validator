import type {
  ValidationIssue
} from "../svgValidator";

export function checkViewBox(
  content: string
): ValidationIssue[] {

  const issues: ValidationIssue[] = [];

  if (
    !content.includes("viewBox")
  ) {

    issues.push({

      category: "Structure",

      severity: "warning",

      message:
        "Missing viewBox attribute — SVG may not scale correctly"

    });

  }

  return issues;

}