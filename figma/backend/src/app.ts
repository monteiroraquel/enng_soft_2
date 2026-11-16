import "dotenv/config";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import Fastify from "fastify";
import { prisma } from "./db.js";
import { registerRoutes } from "./routes.js";

export async function buildApp() {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error("Defina JWT_SECRET com pelo menos 32 caracteres no arquivo backend/.env.");
  }

  const app = Fastify({ logger: process.env.NODE_ENV !== "test" });
  const allowedOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:8443,http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  await app.register(cors, { origin: allowedOrigins });
  await app.register(jwt, { secret: jwtSecret, sign: { expiresIn: "8h" } });
  await registerRoutes(app);
  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });

  return app;
}
