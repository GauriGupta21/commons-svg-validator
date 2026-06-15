import Fastify from "fastify";
import dotenv from "dotenv";
import multipart from "@fastify/multipart";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import path from "path";
import { uploadRoutes } from "./routes/upload";

dotenv.config();

const server = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || "info",
    // pino-pretty
    transport: process.env.NODE_ENV !== "production"
      ? { target: "pino-pretty" }
      : undefined,
  },
});

server.get("/health", async () => {
  return { status: "ok" };
});

server.register(multipart, {
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

server.register(cors, {
  origin: true,
});

// /temp/ — sanitized/repaired files serve karta hai
server.register(fastifyStatic, {
  root: path.join(process.cwd(), "temp"),
  prefix: "/temp/",
});

// Vue frontend — production build serve karta hai
// local dev me ye folder nahi hoga, isliye check karte hain
import fs from "fs";
const frontendDist = path.join(process.cwd(), "public");

if (fs.existsSync(frontendDist)) {
  server.register(fastifyStatic, {
    root: frontendDist,
    prefix: "/",
    decorateReply: false, // pehle se registered hai upar
  });

  // Vue Router ke liye — sab unknown routes index.html pe bhejo
  server.setNotFoundHandler(async (_, reply) => {
    return reply.sendFile("index.html", frontendDist);
  });
}

server.register(uploadRoutes);

const start = async () => {
  try {
    await server.listen({
      port: Number(process.env.PORT) || 3000,
      host: "0.0.0.0",
    });
    console.log(`Server running on port ${process.env.PORT || 3000}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();