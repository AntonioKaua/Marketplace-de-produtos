# 🛒 DTS Marketplace

Marketplace acadêmico para compra e venda de produtos usados.

O projeto tem como objetivo desenvolver uma plataforma web na qual usuários possam publicar, pesquisar e negociar produtos usados, contando com recursos de busca, filtros, localização, favoritos e comunicação entre compradores e vendedores.

> 🎓 Projeto desenvolvido para fins acadêmicos.

---

## 📌 Status do projeto

🚧 **Em desenvolvimento**

Atualmente, o projeto está na fase de configuração da estrutura inicial e desenvolvimento da API.

---

# 🧰 Tecnologias

## Frontend

- **React.js** — construção da interface
- **TypeScript** — tipagem estática
- **Tailwind CSS** — estilização e desenvolvimento da interface

## Backend

- **Node.js** — ambiente de execução JavaScript
- **TypeScript** — tipagem estática
- **Express.js** — criação da API REST

## Banco de dados

- **PostgreSQL** — banco de dados relacional

---

# 🏗️ Arquitetura

O projeto será dividido em duas aplicações principais:

```text
DTS-Marketplace/
│
├── frontend/
│   └── React + TypeScript + Tailwind
│
├── backend/
│   └── Node.js + Express + TypeScript
│
├── .gitignore
└── README.md
```

O frontend e o backend serão executados separadamente e irão se comunicar através de uma **API REST**.

```text
┌─────────────────────────────┐
│          FRONTEND           │
│                             │
│ React + TypeScript          │
│ Tailwind CSS                │
└──────────────┬──────────────┘
               │
               │ HTTP / REST
               ▼
┌─────────────────────────────┐
│           BACKEND           │
│                             │
│ Node.js + Express           │
│ TypeScript                  │
└──────────────┬──────────────┘
               │
               │ SQL
               ▼
┌─────────────────────────────┐
│         PostgreSQL          │
│                             │
│     Banco de dados          │
│        relacional           │
└─────────────────────────────┘
```

---

# 💻 Pré-requisitos

Antes de executar o projeto, é necessário instalar:

- [Node.js](https://nodejs.org/)
- npm — instalado junto com o Node.js
- PostgreSQL
- Git

Para verificar a instalação do Node.js:

```bash
node --version
```

Para verificar o npm:

```bash
npm --version
```

Para verificar o Git:

```bash
git --version
```

---

# 📥 Clonando o projeto

Clone o repositório:

```bash
git clone URL_DO_REPOSITORIO
```

Entre na pasta:

```bash
cd DTS-Marketplace
```

---

# ⚙️ Configuração do Backend

Entre na pasta do backend:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

O backend utiliza:

- Node.js
- Express
- TypeScript
- TSX

---

## 📦 Dependências principais

### Express

O Express é utilizado para facilitar a criação da API HTTP.

Exemplo:

```typescript
app.get("/", (req, res) => {
  res.json({
    message: "API do Marketplace funcionando!"
  });
});
```

### TypeScript

O TypeScript adiciona tipagem estática ao JavaScript e ajuda a identificar erros durante o desenvolvimento.

### TSX

O `tsx` permite executar arquivos TypeScript diretamente durante o desenvolvimento.

---

# ▶️ Executando o Backend

Dentro da pasta `backend`:

```bash
npm run dev
```

O comando utiliza o script definido no `package.json`:

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts"
  }
}
```

O `watch` faz com que o servidor seja reiniciado automaticamente quando os arquivos forem modificados.

Após iniciar, a API estará disponível em:

```text
http://localhost:3000
```

---

# 📁 Estrutura inicial do Backend

```text
backend/
│
├── src/
│   └── server.ts
│
├── node_modules/
├── package.json
├── package-lock.json
└── tsconfig.json
```

Conforme o projeto crescer, a estrutura será organizada em módulos:

```text
backend/
│
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── models/
│   ├── middlewares/
│   ├── database/
│   └── server.ts
│
├── package.json
├── package-lock.json
└── tsconfig.json
```

### Responsabilidade das pastas

| Pasta | Responsabilidade |
|---|---|
| `controllers/` | Receber requisições e retornar respostas |
| `routes/` | Definir as rotas da API |
| `services/` | Concentrar regras de negócio |
| `models/` | Representar entidades e dados |
| `middlewares/` | Processamentos intermediários |
| `database/` | Configurações e acesso ao banco |
| `server.ts` | Inicialização do servidor |

---

# 📝 TypeScript

O projeto utiliza o arquivo:

```text
tsconfig.json
```

Esse arquivo define as configurações utilizadas pelo TypeScript.

Exemplo de configuração:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

O projeto utiliza **ES Modules**, permitindo utilizar:

```typescript
import express from "express";
```

Por isso o `package.json` possui:

```json
{
  "type": "module"
}
```

---

# 🗄️ Banco de Dados

O banco utilizado pelo projeto será o **PostgreSQL**.

A aplicação terá entidades relacionadas a:

```text
Usuários
    │
    ├── Anúncios
    │      ├── Fotos
    │      ├── Categoria
    │      └── Localização
    │
    ├── Favoritos
    │
    ├── Conversas
    │      └── Mensagens
    │
    └── Avaliações
```

A estrutura definitiva do banco será definida durante a etapa de modelagem.

---

# 🔐 Variáveis de ambiente

Informações sensíveis não devem ser armazenadas diretamente no código ou enviadas para o GitHub.

Será utilizado um arquivo:

```text
.env
```

Exemplo:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=dts_marketplace
DB_USER=postgres
DB_PASSWORD=sua_senha
```

> ⚠️ Nunca envie o arquivo `.env` para o GitHub.

O `.gitignore` deve conter:

```gitignore
node_modules/
.env
.env.*
dist/
*.log
```

---

# 🛍️ Funcionalidades planejadas

## 👤 Usuários

- Cadastro
- Login
- Autenticação
- Perfil do usuário
- Perfil do vendedor

## 🏷️ Produtos e anúncios

- Criar anúncio
- Editar anúncio
- Excluir anúncio
- Visualizar anúncio
- Adicionar fotos
- Definir preço
- Adicionar descrição
- Selecionar categoria
- Informar localização
- Alterar status do anúncio

## 🔎 Busca

- Buscar produtos
- Filtrar por categoria
- Filtrar por preço
- Filtrar por localização
- Ordenar resultados

## ❤️ Interações

- Favoritar produtos
- Entrar em contato com vendedor
- Chat entre usuários
- Avaliar vendedor
- Avaliar produto

## 🛡️ Administração

- Painel administrativo
- Gerenciamento de usuários
- Gerenciamento de anúncios
- Gerenciamento de categorias
- Moderação de conteúdo

---

# 🌐 API REST

O backend será responsável por disponibilizar uma API REST para o frontend.

Exemplos de endpoints planejados:

```text
GET    /products
GET    /products/:id
POST   /products
PUT    /products/:id
DELETE /products/:id

GET    /categories
POST   /categories

POST   /users
POST   /auth/login

GET    /favorites
POST   /favorites
DELETE /favorites/:id

GET    /conversations
POST   /conversations
GET    /messages
POST   /messages
```

Os endpoints ainda poderão ser modificados conforme a definição dos requisitos e da modelagem do sistema.

---

# 🔄 Fluxo básico

Um fluxo esperado para o usuário será:

```text
Usuário
   │
   ▼
Cadastro / Login
   │
   ▼
Página inicial
   │
   ├───────────────┐
   ▼               ▼
Pesquisar       Publicar
produtos        produto
   │               │
   ▼               ▼
Filtros          Anúncio
   │
   ▼
Produto
   │
   ├── Favoritar
   │
   └── Contatar vendedor
```

---

# 🧪 Desenvolvimento

Durante o desenvolvimento, recomenda-se trabalhar com branches:

```text
main
│
├── feature/login
├── feature/products
├── feature/search
└── feature/chat
```

Exemplo:

```bash
git checkout -b feature/products
```

Após concluir uma funcionalidade:

```bash
git add .
git commit -m "feat: adiciona cadastro de produtos"
git push origin feature/products
```

---

# 📋 Convenção de commits

Recomenda-se utilizar commits seguindo um padrão simples:

```text
feat: nova funcionalidade

fix: correção de erro

refactor: alteração estrutural

docs: documentação

style: alterações de formatação

test: criação ou alteração de testes

chore: configuração ou manutenção
```

Exemplos:

```text
feat: adiciona cadastro de usuários
feat: cria endpoint de produtos
fix: corrige validação de preço
docs: atualiza README
```

---

# 👥 Equipe

Adicione os integrantes do projeto:

- Nome — Responsabilidade
- Nome — Responsabilidade
- Nome — Responsabilidade
- Nome — Responsabilidade

---

# 🎓 Objetivos acadêmicos

O projeto busca aplicar conhecimentos relacionados a:

- Engenharia de Software
- Desenvolvimento Web
- Arquitetura Cliente-Servidor
- APIs REST
- Banco de Dados
- Modelagem Relacional
- Desenvolvimento Frontend
- Desenvolvimento Backend
- Autenticação e autorização
- CRUD
- Requisitos de software
- Versionamento com Git
- Trabalho colaborativo

---

# 📌 Roadmap

- [x] Configuração inicial do repositório
- [x] Definição da stack
- [x] Configuração inicial do Backend
- [ ] Configuração do Frontend
- [ ] Configuração do PostgreSQL
- [ ] Modelagem do banco
- [ ] Sistema de usuários
- [ ] Sistema de autenticação
- [ ] CRUD de produtos
- [ ] Sistema de categorias
- [ ] Busca e filtros
- [ ] Localização
- [ ] Favoritos
- [ ] Chat
- [ ] Avaliações
- [ ] Painel administrativo
- [ ] Testes
- [ ] Documentação final

---

<div align="center">

### 🛒 DTS Marketplace

Projeto acadêmico de marketplace de produtos usados.

</div>
