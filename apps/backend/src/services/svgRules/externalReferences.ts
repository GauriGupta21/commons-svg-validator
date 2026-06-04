import type {
  ValidationIssue
} from "../svgValidator";

export function checkExternalReferences(
  content: string
): ValidationIssue[] {

  const issues: ValidationIssue[] = [];

  const regex =
    /(http:\/\/|https:\/\/)/gi;

  if (
    regex.test(content)
  ) {

    issues.push({

      category: "Security",

      severity: "warning",

      message:
        "External references detected"

    });

  }

  return issues;

}