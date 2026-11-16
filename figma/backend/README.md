# ByteHub API local

API REST local usada pelo front-end ByteHub. Perfis, inscrições, ideias e metadados de certificados são guardados no arquivo SQLite `prisma/dev.db`.

## Requisitos

- Node.js 24 LTS (já instalado no computador usado no desenvolvimento);
- pnpm via Corepack.

## Preparar o backend

No primeiro terminal, dentro de `figma/backend`:

```powershell
if (!(Test-Path .env)) { Copy-Item .env.example .env }
# Substitua o JWT_SECRET de exemplo por um valor aleatório com pelo menos 32 caracteres.
corepack pnpm install
corepack pnpm db:migrate
corepack pnpm db:seed
corepack pnpm dev
```

O servidor fica em `http://127.0.0.1:3001`. No segundo terminal, inicie o front-end conforme o README principal. O Vite usa a porta 8443; essa origem já está liberada em `CORS_ORIGINS`.

## Perfis locais de demonstração

| Perfil | Login | Senha |
| --- | --- | --- |
| Aluno | `aluno` | `4321` |
| Diretoria | `admin` | `1234` |
| Presidência | `presidencia` | `0000` |

As senhas da demonstração são fracas de propósito para facilitar o uso em sala. O backend guarda hashes com salt e nunca devolve o hash pela API. Não use estas credenciais fora da demonstração.

## Rotas iniciais

| Método | Rota | Acesso |
| --- | --- | --- |
| GET | `/health` | público |
| POST | `/auth/login` | público |
| POST | `/auth/register` | público; cria aluno |
| GET | `/auth/me` | autenticado |
| GET | `/users/directors` | presidência |
| POST | `/users/directors` | presidência |
| GET | `/guilds` | público |
| POST / DELETE | `/guilds/:guildId/membership` | aluno para entrar; usuário para sair |
| GET | `/me/guilds` | autenticado |
| GET | `/events` | público |
| POST | `/events/:eventId/registrations` | aluno |
| GET | `/me/event-registrations` | autenticado |
| GET / POST | `/ideas` | autenticado para consultar; aluno para enviar |
| PATCH | `/ideas/:id/status` | diretoria ou presidência |
| GET / POST | `/certificates` | autenticado; guarda apenas metadados |
| DELETE | `/certificates/:id` | dono do registro |

Para rotas protegidas, envie `Authorization: Bearer <token>`. O token é obtido em `POST /auth/login` ou `POST /auth/register`.

## Testes automatizados

Na pasta `figma/backend`, execute `corepack pnpm test`. A suíte cria um banco SQLite temporário separado de `prisma/dev.db`, aplica migrações e seed, executa os testes de API e remove o arquivo temporário.

## Observações

- A interface React já usa a API para login, guildas, eventos, propostas e certificados. O token JWT fica no `sessionStorage` e expira em 8 horas.
- Os dados de eventos e guildas incluídos pelo seed são exemplos para a demonstração. Edite-os para refletir o projeto real.
- Certificados guardam nome, tamanho e tipo do arquivo; o arquivo binário ainda não é enviado nem armazenado.
- Aulas, diretoria e parte dos indicadores continuam como conteúdo demonstrativo no front-end.
- Para recriar o banco durante desenvolvimento, pare o servidor e remova `prisma/dev.db`, depois execute novamente as migrações e o seed.
