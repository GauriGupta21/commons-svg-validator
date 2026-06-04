export type SuggestionPriority = "high" | "medium" | "low";

export interface Suggestion {
  title: string;
  description: string;
  priority: SuggestionPriority;
}

export type IssueCategory =
  | "Security"
  | "Structure"
  | "Compatibility"
  | "Metadata"
  | "Optimization";

export type IssueSeverity = "error" | "warning" | "info";

export interface ValidationIssue {
  category: IssueCategory;
  severity: IssueSeverity;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  score: number;
  issues: ValidationIssue[];
  suggestions: Suggestion[];
}

// ─── Repair Types ─────────────────────────────────────────────────────────────

export interface RepairReport {
  repaired: boolean;
  fixesApplied: string[];
}