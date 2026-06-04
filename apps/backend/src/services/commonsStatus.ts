export type CommonsStatusColor = "green" | "yellow" | "red";

export interface CommonsStatus {
  status: "Ready for Commons" | "Mostly Ready" | "Not Ready";
  color: CommonsStatusColor;
}

export function getCommonsStatus(score: number): CommonsStatus {
  if (score >= 90) {
    return {
      status: "Ready for Commons",
      color: "green",
    };
  } else if (score >= 70) {
    return {
      status: "Mostly Ready",
      color: "yellow",
    };
  } else {
    return {
      status: "Not Ready",
      color: "red",
    };
  }
}