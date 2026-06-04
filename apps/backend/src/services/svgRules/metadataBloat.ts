import type {
  ValidationIssue
} from "../svgValidator";

export function checkMetadataBloat(
  content: string
): ValidationIssue[] {

  const issues: ValidationIssue[] = [];

  const bloatedTags = [
    "metadata",
    "sodipodi",
    "inkscape",
    "adobe"
  ];

  for (const item of bloatedTags) {

    if (
      content
        .toLowerCase()
        .includes(item)
    ) {

      issues.push({

        category: "Metadata",

        severity: "warning",

        message:
          `Editor metadata detected: ${item}`

      });

    }

  }

  return issues;
}