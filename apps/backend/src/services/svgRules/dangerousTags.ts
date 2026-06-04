import type {
  ValidationIssue
} from "../svgValidator";

export function checkDangerousTags(
  content: string
): ValidationIssue[] {

  const issues: ValidationIssue[] = [];

  const dangerousTags = [
    "script",
    "foreignObject",
    "iframe",
    "embed",
    "object"
  ];

  for (const tag of dangerousTags) {

    const regex =
      new RegExp(
        `<${tag}`,
        "gi"
      );

    if (regex.test(content)) {

      issues.push({

        category: "Security",

        severity: "error",

        message:
          `Dangerous tag detected: <${tag}>`

      });

    }

  }

  return issues;
}