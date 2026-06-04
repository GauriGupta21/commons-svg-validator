import { FastifyInstance } from "fastify";
import { MultipartFile } from "@fastify/multipart";
import path from "path";
import fs from "fs/promises";
import fsSync from "fs";
import { processSVG } from "../engines/svg";
import { processPNG } from "../engines/png";
import { processGIF } from "../engines/gif";

const TEMP_DIR = path.join(process.cwd(), "temp");

export async function uploadRoutes(app: FastifyInstance) {
  await fs.mkdir(TEMP_DIR, { recursive: true });

  // ── Upload Route ─────────────────────────────────────────────────────────
  app.post("/upload", async (request, reply) => {
    const data = await request.file() as MultipartFile;

    if (!data) {
      return reply.status(400).send({ error: "No file uploaded" });
    }

    const buffer = await data.toBuffer();
    const originalName = data.filename;
    const ext = path.extname(originalName).toLowerCase();

    let result: Record<string, any>;

    if (ext === ".svg") {
      result = await processSVG(buffer);

      const sanitizedName = `sanitized_${originalName}`;
      await fs.writeFile(
        path.join(TEMP_DIR, sanitizedName),
        result.sanitizedContent,
        "utf-8"
      );

      const repairedName = `repaired_${originalName}`;
      await fs.writeFile(
        path.join(TEMP_DIR, repairedName),
        result.repairedContent,
        "utf-8"
      );

      result.filename         = sanitizedName;
      result.repairedFilename = repairedName;

    } else if (ext === ".png") {
      result = await processPNG(buffer);
      result.filename = originalName;

    } else if (ext === ".gif") {
      result = await processGIF(buffer);
      result.filename = originalName;

    } else {
      return reply.status(400).send({ error: "Unsupported file type" });
    }

    return reply.send(result);
  });

  // ── Download Route ────────────────────────────────────────────────────────
  // Content-Disposition: attachment force karta hai browser ko download karne pe
  app.get("/download/:filename", async (request, reply) => {
    const { filename } = request.params as { filename: string };

    // Path traversal attack se bachao (e.g. "../../etc/passwd")
    const safeName = path.basename(filename);
    const filePath = path.join(TEMP_DIR, safeName);

    // File exist karti hai?
    try {
      await fs.access(filePath);
    } catch {
      return reply.status(404).send({ error: "File not found" });
    }

    reply.header("Content-Disposition", `attachment; filename="${safeName}"`);
    reply.header("Content-Type", "image/svg+xml");

    return reply.send(fsSync.createReadStream(filePath));
  });
}