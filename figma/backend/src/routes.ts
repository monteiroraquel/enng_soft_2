import type { FastifyInstance } from "fastify";
import { allowRoles, authClaims, authenticate, isPresident, isStudent } from "./auth.js";
import { prisma } from "./db.js";
import { hashPassword, verifyPassword } from "./security.js";

type LoginBody = { login: string; password: string };
type RegisterBody = { name: string; email: string; password: string };
type DirectorBody = { name: string; email: string; password: string; area: string };
type IdeaBody = { title: string; category: string; description: string };
type StatusBody = { status: "Pendente" | "Aprovada" | "Recusada" };
type CertificateBody = { name: string; size: string; mimeType?: string };
type IdParams = { id: string };
type GuildParams = { guildId: string };
type EventParams = { eventId: string };

const emailSchema = { type: "string", format: "email", maxLength: 254 } as const;
const passwordSchema = { type: "string", minLength: 8, maxLength: 128 } as const;

export async function registerRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({ status: "ok" }));

  app.post<{ Body: LoginBody }>(
    "/auth/login",
    {
      schema: {
        body: {
          type: "object",
          required: ["login", "password"],
          properties: {
            login: { type: "string", minLength: 1, maxLength: 254 },
            password: { type: "string", minLength: 1, maxLength: 128 },
          },
          additionalProperties: false,
        },
      },
    },
    async (request, reply) => {
      const identifier = request.body.login.trim().toLowerCase();
      const user = await prisma.user.findFirst({
        where: { OR: [{ email: identifier }, { login: identifier }] },
      });
      if (!user || !(await verifyPassword(request.body.password, user.passwordHash))) {
        return reply.code(401).send({ error: "Usuário ou senha incorretos." });
      }

      const token = await reply.jwtSign({ sub: user.id, role: user.role });
      return {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          area: user.area,
        },
      };
    },
  );

  app.post<{ Body: RegisterBody }>(
    "/auth/register",
    {
      schema: {
        body: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", minLength: 2, maxLength: 100 },
            email: emailSchema,
            password: passwordSchema,
          },
          additionalProperties: false,
        },
      },
    },
    async (request, reply) => {
      const email = request.body.email.trim().toLowerCase();
      const exists = await prisma.user.findUnique({ where: { email } });
      if (exists) return reply.code(409).send({ error: "Este e-mail já está cadastrado." });

      const user = await prisma.user.create({
        data: {
          name: request.body.name.trim(),
          email,
          login: email,
          passwordHash: await hashPassword(request.body.password),
          role: "student",
          area: "Portal do aluno",
        },
      });
      const token = await reply.jwtSign({ sub: user.id, role: user.role });
      return reply.code(201).send({
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, area: user.area },
      });
    },
  );

  app.get("/auth/me", { preHandler: authenticate }, async (request, reply) => {
    const user = await prisma.user.findUnique({ where: { id: authClaims(request).sub } });
    if (!user) return reply.code(404).send({ error: "Perfil não encontrado." });
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      area: user.area,
    };
  });

  app.post<{ Body: DirectorBody }>(
    "/users/directors",
    {
      preHandler: [authenticate, isPresident],
      schema: {
        body: {
          type: "object",
          required: ["name", "email", "password", "area"],
          properties: {
            name: { type: "string", minLength: 2, maxLength: 100 },
            email: emailSchema,
            password: passwordSchema,
            area: { type: "string", minLength: 2, maxLength: 80 },
          },
          additionalProperties: false,
        },
      },
    },
    async (request, reply) => {
      const email = request.body.email.trim().toLowerCase();
      const exists = await prisma.user.findUnique({ where: { email } });
      if (exists) return reply.code(409).send({ error: "Este e-mail já está cadastrado." });
      const user = await prisma.user.create({
        data: {
          name: request.body.name.trim(),
          email,
          login: email,
          passwordHash: await hashPassword(request.body.password),
          role: "admin",
          area: request.body.area.trim(),
        },
        select: { id: true, name: true, email: true, role: true, area: true, createdAt: true },
      });
      return reply.code(201).send(user);
    },
  );

  app.get(
    "/users/directors",
    { preHandler: [authenticate, isPresident] },
    async () =>
      prisma.user.findMany({
        where: { role: "admin" },
        select: { id: true, name: true, email: true, role: true, area: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
  );

  app.get("/guilds", async () => {
    const guildList = await prisma.guild.findMany({
      include: { _count: { select: { memberships: true } } },
      orderBy: { name: "asc" },
    });
    return guildList.map(({ _count, ...guild }) => ({
      ...guild,
      memberCount: guild.memberCount + _count.memberships,
    }));
  });

  app.get("/me/guilds", { preHandler: authenticate }, async (request) => {
    return prisma.guildMembership.findMany({
      where: { userId: authClaims(request).sub },
      include: { guild: true },
      orderBy: { createdAt: "desc" },
    });
  });

  app.post<{ Params: GuildParams }>(
    "/guilds/:guildId/membership",
    { preHandler: [authenticate, isStudent] },
    async (request, reply) => {
      const guild = await prisma.guild.findUnique({ where: { id: request.params.guildId } });
      if (!guild) return reply.code(404).send({ error: "Guilda não encontrada." });
      const membership = await prisma.guildMembership.upsert({
        where: { userId_guildId: { userId: authClaims(request).sub, guildId: guild.id } },
        create: { userId: authClaims(request).sub, guildId: guild.id },
        update: {},
        include: { guild: true },
      });
      return reply.code(201).send(membership);
    },
  );

  app.delete<{ Params: GuildParams }>(
    "/guilds/:guildId/membership",
    { preHandler: authenticate },
    async (request, reply) => {
      await prisma.guildMembership.deleteMany({
        where: { userId: authClaims(request).sub, guildId: request.params.guildId },
      });
      return reply.code(204).send();
    },
  );

  app.get("/events", async () => prisma.event.findMany({ orderBy: { startsAt: "asc" } }));

  app.get("/me/event-registrations", { preHandler: authenticate }, async (request) => {
    return prisma.eventRegistration.findMany({
      where: { userId: authClaims(request).sub },
      include: { event: true },
      orderBy: { createdAt: "desc" },
    });
  });

  app.post<{ Params: EventParams }>(
    "/events/:eventId/registrations",
    { preHandler: [authenticate, isStudent] },
    async (request, reply) => {
      const event = await prisma.event.findUnique({ where: { id: request.params.eventId } });
      if (!event) return reply.code(404).send({ error: "Evento não encontrado." });
      const registration = await prisma.eventRegistration.upsert({
        where: { userId_eventId: { userId: authClaims(request).sub, eventId: event.id } },
        create: { userId: authClaims(request).sub, eventId: event.id },
        update: {},
        include: { event: true },
      });
      return reply.code(201).send(registration);
    },
  );

  app.get("/ideas", { preHandler: authenticate }, async (request) => {
    const claims = authClaims(request);
    const management = ["admin", "president"].includes(claims.role);
    return prisma.idea.findMany({
      where: management ? undefined : { authorId: claims.sub },
      include: { author: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
  });

  app.post<{ Body: IdeaBody }>(
    "/ideas",
    {
      preHandler: [authenticate, isStudent],
      schema: {
        body: {
          type: "object",
          required: ["title", "category", "description"],
          properties: {
            title: { type: "string", minLength: 2, maxLength: 120 },
            category: { type: "string", minLength: 2, maxLength: 80 },
            description: { type: "string", minLength: 5, maxLength: 3000 },
          },
          additionalProperties: false,
        },
      },
    },
    async (request, reply) => {
      const idea = await prisma.idea.create({
        data: {
          title: request.body.title.trim(),
          category: request.body.category.trim(),
          description: request.body.description.trim(),
          authorId: authClaims(request).sub,
        },
        include: { author: { select: { id: true, name: true, email: true } } },
      });
      return reply.code(201).send(idea);
    },
  );

  app.patch<{ Params: IdParams; Body: StatusBody }>(
    "/ideas/:id/status",
    {
      preHandler: [authenticate, allowRoles("admin", "president")],
      schema: {
        body: {
          type: "object",
          required: ["status"],
          properties: { status: { type: "string", enum: ["Pendente", "Aprovada", "Recusada"] } },
          additionalProperties: false,
        },
      },
    },
    async (request, reply) => {
      const exists = await prisma.idea.findUnique({ where: { id: request.params.id } });
      if (!exists) return reply.code(404).send({ error: "Ideia não encontrada." });
      return prisma.idea.update({
        where: { id: request.params.id },
        data: { status: request.body.status },
        include: { author: { select: { id: true, name: true, email: true } } },
      });
    },
  );

  app.get("/certificates", { preHandler: authenticate }, async (request) => {
    return prisma.certificate.findMany({
      where: { userId: authClaims(request).sub },
      orderBy: { addedAt: "desc" },
    });
  });

  app.post<{ Body: CertificateBody }>(
    "/certificates",
    {
      preHandler: authenticate,
      schema: {
        body: {
          type: "object",
          required: ["name", "size"],
          properties: {
            name: { type: "string", minLength: 1, maxLength: 255 },
            size: { type: "string", minLength: 1, maxLength: 30 },
            mimeType: { type: "string", maxLength: 100 },
          },
          additionalProperties: false,
        },
      },
    },
    async (request, reply) => {
      const certificate = await prisma.certificate.create({
        data: { ...request.body, userId: authClaims(request).sub },
      });
      return reply.code(201).send(certificate);
    },
  );

  app.delete<{ Params: IdParams }>(
    "/certificates/:id",
    { preHandler: authenticate },
    async (request, reply) => {
      const deleted = await prisma.certificate.deleteMany({
        where: { id: request.params.id, userId: authClaims(request).sub },
      });
      if (!deleted.count) return reply.code(404).send({ error: "Certificado não encontrado." });
      return reply.code(204).send();
    },
  );
}
