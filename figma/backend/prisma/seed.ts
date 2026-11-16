import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { hashPassword } from "../src/security.js";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const demoUsers = [
    {
      name: "Aluno Byte",
      email: "aluno@bytehub.local",
      login: "aluno",
      password: "4321",
      role: "student",
      area: "Portal do aluno",
    },
    {
      name: "Maria Eduarda",
      email: "admin@bytehub.local",
      login: "admin",
      password: "1234",
      role: "admin",
      area: "Setor Acadêmico",
    },
    {
      name: "Matheus Neri",
      email: "presidencia@bytehub.local",
      login: "presidencia",
      password: "0000",
      role: "president",
      area: "Presidência",
    },
  ];

  for (const demoUser of demoUsers) {
    const { password, ...user } = demoUser;
    await prisma.user.upsert({
      where: { login: user.login },
      update: {},
      create: { ...user, passwordHash: await hashPassword(password) },
    });
  }

  const demoGuilds = [
    { name: "Inteligência Artificial", short: "IA", level: "Intermediário", color: "#1769e8", memberCount: 18 },
    { name: "Modelagem 3D", short: "3D", level: "Iniciante", color: "#7b5de8", memberCount: 12 },
    { name: "Introdução à Programação Concorrente", short: "PC", level: "Introdução", color: "#e05472", memberCount: 10 },
    { name: "Informática", short: "INF", level: "Fundamentos", color: "#16a375", memberCount: 22 },
    { name: "Python", short: "PY", level: "Todos os níveis", color: "#e68b35", memberCount: 26 },
    { name: "Time de Programação", short: "CODE", level: "Competitivo", color: "#2a9db0", memberCount: 14 },
  ];

  for (const guild of demoGuilds) {
    await prisma.guild.upsert({ where: { name: guild.name }, update: guild, create: guild });
  }

  const demoEvents = [
    {
      title: "Noite de Jogos",
      category: "Integração",
      startsAt: new Date("2026-12-05T19:00:00-03:00"),
      location: "Campus JK",
      description: "Evento de demonstração: uma noite para jogar, conversar e aproximar a comunidade.",
    },
    {
      title: "Dev Weekend",
      category: "Tecnologia",
      startsAt: new Date("2026-12-12T09:00:00-03:00"),
      location: "Lab 04",
      description: "Evento de demonstração: oficinas, código e desafios em equipe.",
    },
    {
      title: "Byte Academy",
      category: "Extensão",
      startsAt: new Date("2027-01-16T14:00:00-03:00"),
      location: "Auditório",
      description: "Evento de demonstração: conhecimento em tecnologia compartilhado com a comunidade.",
    },
  ];

  for (const event of demoEvents) {
    await prisma.event.upsert({
      where: { title: event.title },
      update: event,
      create: event,
    });
  }

  const student = await prisma.user.findUniqueOrThrow({ where: { login: "aluno" } });
  const initialGuildNames = ["Python", "Informática"];
  for (const name of initialGuildNames) {
    const guild = await prisma.guild.findUniqueOrThrow({ where: { name } });
    await prisma.guildMembership.upsert({
      where: { userId_guildId: { userId: student.id, guildId: guild.id } },
      update: {},
      create: { userId: student.id, guildId: guild.id },
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exitCode = 1;
  });
