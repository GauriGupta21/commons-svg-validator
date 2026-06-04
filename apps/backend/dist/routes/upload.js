"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRoutes = uploadRoutes;
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const fs_1 = __importDefault(require("fs"));
const svg_1 = require("../engines/svg");
const png_1 = require("../engines/png");
const gif_1 = require("../engines/gif");
const TEMP_DIR = path_1.default.join(process.cwd(), "temp");
async function uploadRoutes(app) {
    await promises_1.default.mkdir(TEMP_DIR, { recursive: true });
    // ── Upload Route ─────────────────────────────────────────────────────────
    app.post("/upload", async (request, reply) => {
        const data = await request.file();
        if (!data) {
            return reply.status(400).send({ error: "No file uploaded" });
        }
        const buffer = await data.toBuffer();
        const originalName = data.filename;
        const ext = path_1.default.extname(originalName).toLowerCase();
        let result;
        if (ext === ".svg") {
            result = await (0, svg_1.processSVG)(buffer);
            const sanitizedName = `sanitized_${originalName}`;
            await promises_1.default.writeFile(path_1.default.join(TEMP_DIR, sanitizedName), result.sanitizedContent, "utf-8");
            const repairedName = `repaired_${originalName}`;
            await promises_1.default.writeFile(path_1.default.join(TEMP_DIR, repairedName), result.repairedContent, "utf-8");
            result.filename = sanitizedName;
            result.repairedFilename = repairedName;
        }
        else if (ext === ".png") {
            result = await (0, png_1.processPNG)(buffer);
            result.filename = originalName;
        }
        else if (ext === ".gif") {
            result = await (0, gif_1.processGIF)(buffer);
            result.filename = originalName;
        }
        else {
            return reply.status(400).send({ error: "Unsupported file type" });
        }
        return reply.send(result);
    });
    // ── Download Route ────────────────────────────────────────────────────────
    // Content-Disposition: attachment force karta hai browser ko download karne pe
    app.get("/download/:filename", async (request, reply) => {
        const { filename } = request.params;
        // Path traversal attack se bachao (e.g. "../../etc/passwd")
        const safeName = path_1.default.basename(filename);
        const filePath = path_1.default.join(TEMP_DIR, safeName);
        // File exist karti hai?
        try {
            await promises_1.default.access(filePath);
        }
        catch {
            return reply.status(404).send({ error: "File not found" });
        }
        reply.header("Content-Disposition", `attachment; filename="${safeName}"`);
        reply.header("Content-Type", "image/svg+xml");
        return reply.send(fs_1.default.createReadStream(filePath));
    });
}
