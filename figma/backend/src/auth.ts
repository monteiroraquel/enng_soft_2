import type { FastifyReply, FastifyRequest } from "fastify";

export type AuthClaims = { sub: string; role: string };

export function authClaims(request: FastifyRequest): AuthClaims {
  return request.user as AuthClaims;
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch {
    return reply.code(401).send({ error: "Autenticação necessária." });
  }
}

export function allowRoles(...roles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!roles.includes(authClaims(request).role)) {
      return reply.code(403).send({ error: "Você não tem permissão para esta ação." });
    }
  };
}

export const isManagement = allowRoles("admin", "president");
export const isPresident = allowRoles("president");
export const isStudent = allowRoles("student");
