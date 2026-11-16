# Testes automatizados da API

Execute na pasta `figma/backend`:

```powershell
corepack pnpm test
```

O script cria um banco SQLite temporário em `tests/data/`, aplica as migrações, carrega os perfis/eventos de demonstração, executa `api.test.ts` e remove o banco temporário ao terminar. O banco normal `prisma/dev.db` não é usado nem alterado pelos testes.

Os casos cobrem health check, login e senha inválida, cadastro duplicado, perfil protegido, autorização por papel, associação a guildas, inscrição em eventos, envio e revisão de ideias e ciclo de metadados de certificados.
