import type {
  ValidationIssue
} from "../svgValidator";

export function checkStructureAnalysis(
  content: string
): ValidationIssue[] {

  const issues: ValidationIssue[] = [];

  // Check for missing width/height attributes
  if (
    !content.includes("width=") &&
    !content.includes("height=")
  ) {

    issues.push({

      category: "Structure",

      severity: "info",

      message:
        "No explicit width/height attributes found on <svg>"

    });

  }

  // Check for deeply nested groups
  const groupMatches =
    (content.match(/<g/gi) || [])
      .length;

  if (groupMatches > 100) {

    issues.push({

      category: "Structure",

      severity: "info",

      message:
        `High number of group elements detected (${groupMatches} <g> tags)`

    });

  }

  return issues;

}