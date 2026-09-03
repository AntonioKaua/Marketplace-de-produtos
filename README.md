# 🛒 DTS Marketplace

Marketplace acadêmico para compra e venda de produtos usados.

O projeto tem como objetivo desenvolver uma plataforma web na qual usuários possam publicar, pesquisar e negociar produtos usados, contando com recursos de busca, filtros, localização, favoritos e comunicação entre compradores e vendedores.

> 🎓 Projeto desenvolvido para fins acadêmicos.

---

## 📌 Status

🚧 **Em desenvolvimento**

O projeto encontra-se em fase inicial de desenvolvimento.

---

# 🧰 Stack

## Frontend

- React.js
- TypeScript
- Tailwind CSS

## Backend

- Node.js
- TypeScript
- Express.js

## Banco de Dados

- PostgreSQL

## Ferramentas

- Git
- GitHub
- npm

---

# 🏗️ Arquitetura

O projeto é dividido em duas aplicações:

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

O frontend e o backend funcionam separadamente e se comunicam através de uma **API REST**.

```text
┌──────────────────────────┐
│        FRONTEND          │
│                          │
│ React + TypeScript       │
│ Tailwind CSS             │
└────────────┬─────────────┘
             │
             │ HTTP / REST
             ▼
┌──────────────────────────┐
│         BACKEND          │
│                          │
│ Node.js + Express        │
│ TypeScript               │
└────────────┬─────────────┘
             │
             │ SQL
             ▼
┌──────────────────────────┐
│       PostgreSQL         │
│                          │
│    Banco Relacional      │
└──────────────────────────┘
```

---

# 💻 Pré-requisitos

Antes de começar, instale:

- Node.js
- npm
- Git
- PostgreSQL

Verifique se estão instalados:

```bash
node --version
npm --version
git --version
psql --version
```

---

# 📥 Configuração para colaboradores

## 1. Clone o repositório

Escolha uma pasta onde deseja armazenar o projeto e execute:

```bash
git clone URL_DO_REPOSITORIO
```

Entre na pasta:

```bash
cd DTS-Marketplace
```

---

# ⚙️ Configuração do Backend

Entre na pasta:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

O `npm install` utiliza o `package.json` e o `package-lock.json` para instalar as dependências necessárias.

---

## 🔐 Configuração das variáveis de ambiente

O projeto utiliza variáveis de ambiente para armazenar configurações que não devem ser diretamente incluídas no código.

Dentro da pasta `backend`, crie:

```text
.env
```

Utilize o arquivo `.env.example` como referência.

Exemplo:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=dts_marketplace
DB_USER=postgres
DB_PASSWORD=
```

> ⚠️ O arquivo `.env` não deve ser enviado para o GitHub.

O `.env.example` deve ser mantido no repositório para servir como modelo para os colaboradores.

---

# ▶️ Executando o Backend

Dentro da pasta `backend`:

```bash
npm run dev
```

O servidor será iniciado utilizando:

```text
http://localhost:3000
```

Durante o desenvolvimento, o `tsx watch` reinicia automaticamente o servidor quando os arquivos forem alterados.

---

# 🎨 Configuração do Frontend

Abra outro terminal.

A partir da raiz do projeto:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Execute o projeto:

```bash
npm run dev
```

O endereço será exibido no terminal.

Normalmente:

```text
http://localhost:5173
```

---

# 🗄️ Banco de Dados

O projeto utiliza PostgreSQL.

Cada colaborador deverá possuir uma instalação local do PostgreSQL para desenvolvimento.

Banco inicialmente esperado:

```text
Nome: dts_marketplace
Porta: 5432
Usuário: postgres
```

As configurações devem ser informadas no arquivo `.env`.

> A estrutura definitiva do banco será definida durante a etapa de modelagem.

---

# 🌿 Fluxo de desenvolvimento com Git

Não trabalhe diretamente na branch `main`.

Para desenvolver uma nova funcionalidade, crie uma branch:

```bash
git checkout -b feature/nome-da-funcionalidade
```

Exemplos:

```bash
git checkout -b feature/login
git checkout -b feature/products
git checkout -b feature/search
```

Depois de implementar a funcionalidade:

```bash
git add .
```

Crie um commit:

```bash
git commit -m "feat: adiciona cadastro de produtos"
```

Envie a branch para o GitHub:

```bash
git push -u origin feature/nome-da-funcionalidade
```

Depois, abra um **Pull Request** para a branch `main`.

---

# 🔄 Antes de começar uma nova tarefa

Sempre atualize sua cópia local do projeto:

```bash
git checkout main
git pull origin main
```

Depois crie sua nova branch:

```bash
git checkout -b feature/nome-da-funcionalidade
```

---

# 📝 Convenção de branches

Utilizaremos os seguintes padrões:

```text
feature/    → nova funcionalidade
fix/        → correção de problema
refactor/   → alteração estrutural
docs/       → documentação
test/       → testes
chore/      → manutenção/configuração
```

Exemplos:

```text
feature/user-login
feature/product-crud
feature/search-filter
fix/login-validation
docs/api-documentation
test/product-service
```

---

# 📝 Convenção de commits

Os commits devem utilizar uma descrição curta e objetiva.

### Tipos

```text
feat:      nova funcionalidade
fix:       correção de problema
refactor:  alteração estrutural
docs:      documentação
test:      testes
style:     formatação
chore:     configuração/manutenção
```

### Exemplos

```bash
git commit -m "feat: adiciona cadastro de usuários"

git commit -m "feat: cria endpoint de produtos"

git commit -m "fix: corrige validação de preço"

git commit -m "docs: atualiza instruções de instalação"

git commit -m "chore: configura TypeScript"
```

---

# 🔀 Pull Requests

Antes de abrir um Pull Request:

1. Verifique se o código funciona.
2. Verifique se não existem erros no console.
3. Verifique se os arquivos desnecessários não estão sendo enviados.
4. Atualize a documentação caso necessário.
5. Faça commits organizados.
6. Atualize sua branch com a `main`, caso necessário.

O Pull Request deve explicar brevemente:

- O que foi implementado?
- Qual problema foi resolvido?
- Como testar?
- Existe alguma alteração importante?

---

# 🚫 Arquivos que não devem ser enviados

Nunca faça commit de:

```text
node_modules/
.env
dist/
build/
*.log
```

O `.gitignore` do projeto já está configurado para ignorar esses arquivos.

---

# 📁 Estrutura do projeto

Estrutura inicial:

```text
DTS-Marketplace/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── src/
│   │   └── server.ts
│   ├── package.json
│   ├── package-lock.json
│   └── tsconfig.json
│
├── .gitignore
└── README.md
```

Conforme o backend evoluir:

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

---

# 🛍️ Funcionalidades planejadas

## 👤 Usuários

- [ ] Cadastro
- [ ] Login
- [ ] Autenticação
- [ ] Perfil do usuário
- [ ] Perfil do vendedor

## 🏷️ Produtos

- [ ] Criar anúncio
- [ ] Editar anúncio
- [ ] Excluir anúncio
- [ ] Visualizar anúncio
- [ ] Adicionar fotos
- [ ] Definir preço
- [ ] Adicionar descrição
- [ ] Selecionar categoria
- [ ] Informar localização

## 🔎 Busca

- [ ] Buscar produtos
- [ ] Filtrar por categoria
- [ ] Filtrar por preço
- [ ] Filtrar por localização
- [ ] Ordenar resultados

## ❤️ Interações

- [ ] Favoritar produtos
- [ ] Chat entre usuários
- [ ] Avaliar vendedor
- [ ] Avaliar produto

## 🛡️ Administração

- [ ] Painel administrativo
- [ ] Gerenciar usuários
- [ ] Gerenciar anúncios
- [ ] Gerenciar categorias
- [ ] Moderar conteúdo

---

# 🌐 API

O backend disponibilizará uma API REST.

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

> Os endpoints ainda poderão sofrer alterações durante o desenvolvimento.

---

# 👥 Equipe

| Integrante | Responsabilidade |
|---|---|
| Nome | Frontend |
| Nome | Backend |
| Nome | Banco de Dados |
| Nome | Documentação |

---

# 🎓 Objetivos acadêmicos

O projeto busca aplicar conhecimentos de:

- Engenharia de Software
- Desenvolvimento Web
- APIs REST
- Banco de Dados
- Modelagem Relacional
- Arquitetura Cliente-Servidor
- Git e GitHub
- Desenvolvimento Frontend
- Desenvolvimento Backend
- Autenticação
- CRUD
- Trabalho colaborativo

---

# 📌 Roadmap

- [x] Criar repositório
- [x] Definir stack
- [x] Configurar Backend
- [x] Configurar TypeScript
- [x] Configurar Express
- [ ] Configurar Frontend
- [ ] Configurar PostgreSQL
- [ ] Modelar banco de dados
- [ ] Implementar usuários
- [ ] Implementar autenticação
- [ ] Implementar CRUD de produtos
- [ ] Implementar categorias
- [ ] Implementar busca
- [ ] Implementar filtros
- [ ] Implementar localização
- [ ] Implementar favoritos
- [ ] Implementar chat
- [ ] Implementar avaliações
- [ ] Implementar painel administrativo
- [ ] Realizar testes
- [ ] Finalizar documentação

---

<div align="center">

## 🛒 DTS Marketplace

Projeto acadêmico de marketplace de produtos usados.

</div>
