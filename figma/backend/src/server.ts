import "dotenv/config";
import { buildApp } from "./app.js";

const app = await buildApp();
const port = Number(process.env.PORT ?? 3001);

try {
  await app.listen({ port, host: "127.0.0.1" });
} catch (error) {
  app.log.error(error);
  await app.close();
  process.exit(1);
}
