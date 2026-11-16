import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../src/app.js";
import { prisma } from "../src/db.js";

let app: FastifyInstance;
const runId = `${Date.now()}`;
const emailPrefix = `test-${runId}-`;
let nextUserId = 0;

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  token?: string;
  body?: Record<string, unknown>;
};

async function request(path: string, options: RequestOptions = {}) {
  const response = await app.inject({
    method: options.method ?? "GET",
    url: path,
    headers: options.token ? { authorization: `Bearer ${options.token}` } : {},
    payload: options.body,
  });
  return {
    status: response.statusCode,
    body: response.payload ? (JSON.parse(response.payload) as unknown) : null,
  };
}

function newEmail() {
  nextUserId += 1;
  return `${emailPrefix}${nextUserId}@bytehub.test`;
}

async function createStudent() {
  const email = newEmail();
  const response = await request("/auth/register", {
    method: "POST",
    body: { name: "Aluno de Teste", email, password: "senha-teste-123" },
  });
  assert.equal(response.status, 201, "a preparação do usuário de teste deve funcionar");
  return { email, token: (response.body as { token: string }).token };
}

async function presidentToken() {
  const response = await request("/auth/login", {
    method: "POST",
    body: { login: "presidencia", password: "0000" },
  });
  assert.equal(response.status, 200, "a conta de presidência de demonstração deve autenticar");
  return (response.body as { token: string }).token;
}

before(async () => {
  app = await buildApp();
});

after(async () => {
  await prisma.user.deleteMany({ where: { email: { startsWith: emailPrefix } } });
  await app.close();
  await prisma.$disconnect();
});

test("01 - API informa que está saudável", async () => {
  const response = await request("/health");
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { status: "ok" });
});

test("02 - perfil exige autenticação", async () => {
  assert.equal((await request("/auth/me")).status, 401);
});

test("03 - guildas do usuário exigem autenticação", async () => {
  assert.equal((await request("/me/guilds")).status, 401);
});

test("04 - inscrições em eventos do usuário exigem autenticação", async () => {
  assert.equal((await request("/me/event-registrations")).status, 401);
});

test("05 - consulta de ideias exige autenticação", async () => {
  assert.equal((await request("/ideas")).status, 401);
});

test("06 - consulta de certificados exige autenticação", async () => {
  assert.equal((await request("/certificates")).status, 401);
});

test("07 - login rejeita usuário inexistente", async () => {
  const response = await request("/auth/login", {
    method: "POST",
    body: { login: `nao-existe-${runId}@bytehub.test`, password: "senha-teste-123" },
  });
  assert.equal(response.status, 401);
});

test("08 - login rejeita senha incorreta", async () => {
  const response = await request("/auth/login", {
    method: "POST",
    body: { login: "aluno", password: "senha-incorreta" },
  });
  assert.equal(response.status, 401);
});

test("09 - login aceita credenciais válidas de demonstração", async () => {
  const response = await request("/auth/login", {
    method: "POST",
    body: { login: "aluno", password: "4321" },
  });
  assert.equal(response.status, 200);
  assert.equal((response.body as { user: { role: string } }).user.role, "student");
});

test("10 - cadastro cria um usuário", async () => {
  const email = newEmail();
  const response = await request("/auth/register", {
    method: "POST",
    body: { name: "Novo Aluno", email, password: "senha-teste-123" },
  });
  assert.equal(response.status, 201);
  assert.equal((response.body as { user: { email: string } }).user.email, email);
  assert.ok((response.body as { token: string }).token);
});

test("11 - cadastro rejeita e-mail já cadastrado", async () => {
  const user = await createStudent();
  const response = await request("/auth/register", {
    method: "POST",
    body: { name: "Duplicado", email: user.email, password: "senha-teste-123" },
  });
  assert.equal(response.status, 409);
});

test("12 - cadastro rejeita e-mail inválido", async () => {
  const response = await request("/auth/register", {
    method: "POST",
    body: { name: "Aluno Inválido", email: "email-invalido", password: "senha-teste-123" },
  });
  assert.equal(response.status, 400);
});

test("13 - cadastro rejeita senha abaixo do mínimo", async () => {
  const response = await request("/auth/register", {
    method: "POST",
    body: { name: "Aluno Inválido", email: newEmail(), password: "123" },
  });
  assert.equal(response.status, 400);
});

test("14 - cadastro rejeita campos obrigatórios ausentes", async () => {
  const response = await request("/auth/register", {
    method: "POST",
    body: { email: newEmail(), password: "senha-teste-123" },
  });
  assert.equal(response.status, 400);
});

test("15 - usuário recém-cadastrado consegue fazer login por e-mail", async () => {
  const user = await createStudent();
  const response = await request("/auth/login", {
    method: "POST",
    body: { login: user.email, password: "senha-teste-123" },
  });
  assert.equal(response.status, 200);
  assert.equal((response.body as { user: { email: string } }).user.email, user.email);
});

test("16 - usuário autenticado consulta o próprio perfil", async () => {
  const user = await createStudent();
  const response = await request("/auth/me", { token: user.token });
  assert.equal(response.status, 200);
  assert.equal((response.body as { email: string }).email, user.email);
});

test("17 - perfil não expõe o hash da senha", async () => {
  const user = await createStudent();
  const response = await request("/auth/me", { token: user.token });
  assert.equal(response.status, 200);
  assert.equal("passwordHash" in (response.body as object), false);
});

test("18 - sistema lista guildas", async () => {
  const response = await request("/guilds");
  assert.equal(response.status, 200);
  assert.ok((response.body as unknown[]).length > 0);
});

test("19 - aluno consegue entrar em uma guilda existente", async () => {
  const user = await createStudent();
  const guilds = await request("/guilds");
  const guildId = (guilds.body as Array<{ id: string }>)[0].id;
  const response = await request(`/guilds/${guildId}/membership`, { method: "POST", token: user.token });
  assert.equal(response.status, 201);
});

test("20 - entrar duas vezes na mesma guilda não duplica a associação", async () => {
  const user = await createStudent();
  const guilds = await request("/guilds");
  const guildId = (guilds.body as Array<{ id: string }>)[0].id;
  await request(`/guilds/${guildId}/membership`, { method: "POST", token: user.token });
  const repeated = await request(`/guilds/${guildId}/membership`, { method: "POST", token: user.token });
  const memberships = await request("/me/guilds", { token: user.token });
  assert.equal(repeated.status, 201);
  assert.equal((memberships.body as Array<{ guild: { id: string } }>).filter((item) => item.guild.id === guildId).length, 1);
});

test("21 - entrada em guilda inexistente retorna não encontrado", async () => {
  const user = await createStudent();
  const response = await request("/guilds/id-inexistente/membership", { method: "POST", token: user.token });
  assert.equal(response.status, 404);
});

test("22 - sistema lista eventos", async () => {
  const response = await request("/events");
  assert.equal(response.status, 200);
  assert.ok((response.body as unknown[]).length > 0);
});

test("23 - aluno consegue se inscrever em evento existente", async () => {
  const user = await createStudent();
  const events = await request("/events");
  const eventId = (events.body as Array<{ id: string }>)[0].id;
  const response = await request(`/events/${eventId}/registrations`, { method: "POST", token: user.token });
  assert.equal(response.status, 201);
});

test("24 - inscrição repetida em evento não duplica o registro", async () => {
  const user = await createStudent();
  const events = await request("/events");
  const eventId = (events.body as Array<{ id: string }>)[0].id;
  await request(`/events/${eventId}/registrations`, { method: "POST", token: user.token });
  const repeated = await request(`/events/${eventId}/registrations`, { method: "POST", token: user.token });
  const registrations = await request("/me/event-registrations", { token: user.token });
  assert.equal(repeated.status, 201);
  assert.equal((registrations.body as Array<{ event: { id: string } }>).filter((item) => item.event.id === eventId).length, 1);
});

test("25 - inscrição em evento inexistente retorna não encontrado", async () => {
  const user = await createStudent();
  const response = await request("/events/id-inexistente/registrations", { method: "POST", token: user.token });
  assert.equal(response.status, 404);
});

test("26 - aluno consegue criar uma ideia", async () => {
  const user = await createStudent();
  const response = await request("/ideas", {
    method: "POST",
    token: user.token,
    body: { title: "Ideia de Teste", category: "Projeto", description: "Descrição válida para a ideia de teste." },
  });
  assert.equal(response.status, 201);
});

test("27 - aluno não pode alterar o status de uma ideia", async () => {
  const user = await createStudent();
  const created = await request("/ideas", {
    method: "POST",
    token: user.token,
    body: { title: "Ideia Privada", category: "Projeto", description: "Descrição válida para a ideia de teste." },
  });
  const response = await request(`/ideas/${(created.body as { id: string }).id}/status`, {
    method: "PATCH", token: user.token, body: { status: "Aprovada" },
  });
  assert.equal(response.status, 403);
});

test("28 - presidência pode alterar o status de uma ideia", async () => {
  const user = await createStudent();
  const created = await request("/ideas", {
    method: "POST",
    token: user.token,
    body: { title: "Ideia para Revisão", category: "Projeto", description: "Descrição válida para a ideia de teste." },
  });
  const response = await request(`/ideas/${(created.body as { id: string }).id}/status`, {
    method: "PATCH", token: await presidentToken(), body: { status: "Aprovada" },
  });
  assert.equal(response.status, 200);
  assert.equal((response.body as { status: string }).status, "Aprovada");
});

test("29 - alterar ideia inexistente retorna não encontrado", async () => {
  const response = await request("/ideas/id-inexistente/status", {
    method: "PATCH", token: await presidentToken(), body: { status: "Aprovada" },
  });
  assert.equal(response.status, 404);
});

test("30 - aluno consegue adicionar certificado", async () => {
  const user = await createStudent();
  const response = await request("/certificates", {
    method: "POST", token: user.token,
    body: { name: "certificado-teste.pdf", size: "12 KB", mimeType: "application/pdf" },
  });
  assert.equal(response.status, 201);
});

test("31 - usuário não visualiza certificados de outra conta", async () => {
  const owner = await createStudent();
  const otherUser = await createStudent();
  const created = await request("/certificates", {
    method: "POST", token: owner.token, body: { name: "privado.pdf", size: "12 KB" },
  });
  const response = await request("/certificates", { token: otherUser.token });
  assert.equal((response.body as Array<{ id: string }>).some((item) => item.id === (created.body as { id: string }).id), false);
});

test("32 - usuário não pode excluir certificado de outra conta", async () => {
  const owner = await createStudent();
  const otherUser = await createStudent();
  const created = await request("/certificates", {
    method: "POST", token: owner.token, body: { name: "privado.pdf", size: "12 KB" },
  });
  const response = await request(`/certificates/${(created.body as { id: string }).id}`, {
    method: "DELETE", token: otherUser.token,
  });
  assert.equal(response.status, 404);
});

test("33 - dono pode excluir o próprio certificado", async () => {
  const user = await createStudent();
  const created = await request("/certificates", {
    method: "POST", token: user.token, body: { name: "meu-certificado.pdf", size: "12 KB" },
  });
  const response = await request(`/certificates/${(created.body as { id: string }).id}`, {
    method: "DELETE", token: user.token,
  });
  assert.equal(response.status, 204);
});

test("34 - excluir certificado inexistente retorna não encontrado", async () => {
  const user = await createStudent();
  const response = await request("/certificates/id-inexistente", { method: "DELETE", token: user.token });
  assert.equal(response.status, 404);
});

test("35 - aluno não pode listar membros da diretoria", async () => {
  const user = await createStudent();
  const response = await request("/users/directors", { token: user.token });
  assert.equal(response.status, 403);
});

test("36 - aluno não pode cadastrar membro da diretoria", async () => {
  const user = await createStudent();
  const response = await request("/users/directors", {
    method: "POST", token: user.token,
    body: { name: "Diretor Indevido", email: newEmail(), password: "senha-teste-123", area: "Acadêmico" },
  });
  assert.equal(response.status, 403);
});

test("37 - presidência pode listar membros da diretoria", async () => {
  const response = await request("/users/directors", { token: await presidentToken() });
  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body));
});

test("38 - presidência consegue cadastrar membro da diretoria", async () => {
  const email = newEmail();
  const response = await request("/users/directors", {
    method: "POST", token: await presidentToken(),
    body: { name: "Diretoria de Teste", email, password: "senha-teste-123", area: "Acadêmico" },
  });
  assert.equal(response.status, 201);
  assert.equal((response.body as { role: string }).role, "admin");
});

test("39 - resposta do cadastro da diretoria não expõe hash da senha", async () => {
  const response = await request("/users/directors", {
    method: "POST", token: await presidentToken(),
    body: { name: "Diretoria Segura", email: newEmail(), password: "senha-teste-123", area: "Acadêmico" },
  });
  assert.equal(response.status, 201);
  assert.equal("passwordHash" in (response.body as object), false);
});
