import type {
  ValidationIssue
} from "../svgValidator";

export function checkEmbeddedImages(
  content: string
): ValidationIssue[] {

  const issues: ValidationIssue[] = [];

  if (
    content.includes("<image")
  ) {

    issues.push({

      category: "Compatibility",

      severity: "warning",

      message:
        "Embedded raster image detected"

    });

  }

  return issues;

}