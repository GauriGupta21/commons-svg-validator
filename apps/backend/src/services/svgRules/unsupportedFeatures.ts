import type {
  ValidationIssue
} from "../svgValidator";

export function checkUnsupportedFeatures(
  content: string
): ValidationIssue[] {

  const issues: ValidationIssue[] = [];

  const unsupported = [
    "feGaussianBlur",
    "feDisplacementMap",
    "animateMotion"
  ];

  for (const feature of unsupported) {

    if (
      content.includes(feature)
    ) {

      issues.push({

        category: "Compatibility",

        severity: "warning",

        message:
          `Potentially unsupported SVG feature: ${feature}`

      });

    }

  }

  return issues;

}