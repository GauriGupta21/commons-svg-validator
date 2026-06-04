"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommonsStatus = getCommonsStatus;
function getCommonsStatus(score) {
    if (score >= 90) {
        return {
            status: "Ready for Commons",
            color: "green",
        };
    }
    else if (score >= 70) {
        return {
            status: "Mostly Ready",
            color: "yellow",
        };
    }
    else {
        return {
            status: "Not Ready",
            color: "red",
        };
    }
}
