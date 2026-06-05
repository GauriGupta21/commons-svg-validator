"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const dotenv_1 = __importDefault(require("dotenv"));
const multipart_1 = __importDefault(require("@fastify/multipart"));
const cors_1 = __importDefault(require("@fastify/cors"));
const static_1 = __importDefault(require("@fastify/static"));
const path_1 = __importDefault(require("path"));
const upload_1 = require("./routes/upload");
dotenv_1.default.config();
const server = (0, fastify_1.default)({
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
server.register(multipart_1.default, {
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});
server.register(cors_1.default, {
    origin: true,
});
// /temp/ — sanitized/repaired files serve karta hai
server.register(static_1.default, {
    root: path_1.default.join(process.cwd(), "temp"),
    prefix: "/temp/",
});
// Vue frontend — production build serve karta hai
// local dev me ye folder nahi hoga, isliye check karte hain
const fs_1 = __importDefault(require("fs"));
const frontendDist = path_1.default.join(process.cwd(), "public");
if (fs_1.default.existsSync(frontendDist)) {
    server.register(static_1.default, {
        root: frontendDist,
        prefix: "/",
        decorateReply: false, // pehle se registered hai upar
    });
    // Vue Router ke liye — sab unknown routes index.html pe bhejo
    server.setNotFoundHandler(async (_, reply) => {
        return reply.sendFile("index.html", frontendDist);
    });
}
server.register(upload_1.uploadRoutes);
const start = async () => {
    try {
        await server.listen({
            port: Number(process.env.PORT) || 3000,
            host: "0.0.0.0",
        });
        console.log(`Server running on port ${process.env.PORT || 3000}`);
    }
    catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};
start();
