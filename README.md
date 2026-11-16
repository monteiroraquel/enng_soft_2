# ByteHub — Byte Builders

Protótipo web para centralizar a comunicação, as atividades e os materiais da liga acadêmica Byte Builders.

## Executar localmente

Pré-requisitos: Node.js 24 e pnpm via Corepack. Inicie o backend e o front-end em terminais separados.

### Terminal 1 — backend e banco SQLite

```powershell
cd figma/backend
if (!(Test-Path .env)) { Copy-Item .env.example .env }
corepack pnpm install
corepack pnpm db:migrate
corepack pnpm db:seed
corepack pnpm dev
```

No backend, `pnpm install` gera automaticamente o Prisma Client. Se scripts de instalação estiverem desativados, execute `corepack pnpm db:generate` em `figma/backend`.

Na primeira execução, substitua o `JWT_SECRET` em `figma/backend/.env` por uma chave aleatória com pelo menos 32 caracteres.

### Terminal 2 — interface web

```bash
cd figma
corepack pnpm install
corepack pnpm dev
```

Abra o endereço mostrado pelo Vite (no ambiente do projeto, `http://localhost:8443`).

Para gerar a versão de produção da interface:

```bash
corepack pnpm build
corepack pnpm preview
```

## Acessos de demonstração

| Perfil | Usuário | Senha |
| --- | --- | --- |
| Aluno | `aluno` | `4321` |
| Diretoria | `admin` | `1234` |
| Presidência | `presidencia` | `0000` |

Essas credenciais, guildas e eventos iniciais são dados de demonstração. Perfis, associações a guildas, inscrições, propostas e metadados de certificados são salvos no arquivo SQLite do backend. O token de sessão fica no `sessionStorage` do navegador. Aulas, diretoria e parte dos indicadores ainda usam conteúdo de exemplo. Certificados guardam metadados; o arquivo original não é enviado. Não use dados pessoais ou senhas reais.

## Documentação do trabalho

- [Backend local e rotas da API](figma/backend/README.md)
- [Relatório técnico em construção](docs/relatorio-trabalho-final.md)
- [Roteiro sugerido para os slides](docs/roteiro-apresentacao.md)

Preencha os campos marcados antes de entregar. Resultados de testes, integrantes e contribuições precisam refletir o que o grupo realmente fez.
