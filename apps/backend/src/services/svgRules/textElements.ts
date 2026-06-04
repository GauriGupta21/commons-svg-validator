import type {
  ValidationIssue
} from "../svgValidator";

export function checkTextElements(
  content: string
): ValidationIssue[] {

  const issues: ValidationIssue[] = [];

  const count =
    (content.match(/<text/gi) || [])
      .length;

  if (count > 0) {

    issues.push({

      category: "Compatibility",

      severity: "info",

      message:
        `${count} text element(s) found — fonts may not render correctly on Commons`

    });

  }

  return issues;

}