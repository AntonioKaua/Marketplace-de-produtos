# 🛒 DTS Marketplace

**DTS — Digital Trading & Selling** é um marketplace acadêmico para compra e venda de produtos, com foco em usados. A plataforma permite publicar anúncios, pesquisar produtos, conversar com vendedores, favoritar itens, registrar avaliações e realizar pedidos com pagamento pelo Mercado Pago.

> Em desenvolvimento. Os recursos descritos como implementados estão presentes no código; sua execução depende do banco e dos serviços externos configurados. Ainda há fluxos incompletos e não existe uma suíte de testes automatizados.

## Stack

| Camada | Tecnologias |
| --- | --- |
| Frontend | React 19, JavaScript/JSX, Vite 7, React Router 7, Tailwind CSS 3 e Lucide React |
| Backend | Node.js, Express 5 e TypeScript 5 com modo estrito |
| Banco de dados | PostgreSQL no Supabase, acessado por `@supabase/supabase-js` |
| Imagens | Supabase Storage e uploads com Multer |
| Autenticação | JWT próprio com `jose`, bcrypt e cookies HttpOnly |
| Pagamentos | SDK do Mercado Pago, checkout externo e webhook |
| Assistente | Chatbase com identificação assinada pelo backend |
| Implantação | Frontend e backend configurados separadamente para Vercel |

O frontend utiliza JavaScript/JSX. TypeScript está configurado no backend. A autenticação é própria e não utiliza o Supabase Auth.

## Arquitetura

```text
Navegador: React
    |
    | /api/* — fetch com cookies
    v
Proxy do Vite (local) / rewrite da Vercel (implantação)
    |
    v
Express: rotas → middlewares → controladores → serviços
    |                         |
    v                         v
Supabase                 Mercado Pago
PostgreSQL + Storage     Checkout + notificações
```

O frontend também carrega o widget do Chatbase. Quando há usuário autenticado, solicita ao backend um token para identificá-lo no assistente.

### Estrutura do repositório

```text
Marketplace-de-produtos/
├── backend/
│   ├── api/index.ts          # Entrada serverless da Vercel
│   ├── src/
│   │   ├── config/          # Clientes Supabase e Mercado Pago
│   │   ├── controllers/     # Validação HTTP e respostas
│   │   ├── middlewares/     # Autenticação e autorização
│   │   ├── routes/          # Rotas da API
│   │   ├── services/        # Regras de negócio e persistência
│   │   ├── utils/           # Validação de dados de usuário
│   │   ├── app.ts           # Aplicação Express compartilhada
│   │   └── server.ts        # Servidor local
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── vercel.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── context/         # Sessão e carrinho
│   │   ├── pages/           # Páginas públicas, conta, vendedor e admin
│   │   ├── services/        # Cliente HTTP e chamadas à API
│   │   ├── utils/           # Validação e formatação monetária
│   │   ├── App.jsx          # Rotas da interface
│   │   ├── main.jsx         # Inicialização e providers
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json
├── .gitignore
└── README.md
```

## Funcionalidades implementadas

| Área | Recursos presentes |
| --- | --- |
| Usuários | Cadastro com validação de CPF, telefone e e-mail; login; logout; consulta da sessão; edição de nome e telefone |
| Produtos | Criação, edição, exclusão, detalhes, categoria, preço, quantidade, descrição, condição novo/usado, ano e modelo opcionais |
| Imagens | Upload e exclusão, com limite de oito imagens por anúncio e 5 MB por arquivo na API |
| Catálogo | Busca por título/descrição, filtros por categoria e preço e ordenação fixa por anúncios mais recentes |
| Vendedores | Perfil público, anúncios, painel com indicadores e consulta de vendas |
| Carrinho | Quantidades e persistência em `localStorage`, separada por usuário |
| Pedidos | Endereço de entrega, criação, histórico de compras e vendas e nova tentativa de checkout para pedidos pendentes |
| Pagamentos | Link do Mercado Pago, webhook e consulta do estado do pagamento |
| Interações | Favoritos, avaliações de produtos e vendedores e conversas vinculadas opcionalmente a um produto |
| Chat | Mensagens entre participantes, consultadas pela interface a cada três segundos |
| Suporte | Abertura de chamados, histórico e mensagens; endpoints administrativos de resposta e alteração de status |
| Administração | Gestão de usuários e papéis, exclusão de anúncios e gestão de categorias |
| Assistente | Widget Chatbase com identificação do usuário autenticado |

### Acesso e sessão

- Os papéis tratados pela aplicação são `user` e `admin`. Qualquer usuário autenticado pode anunciar e vender.
- O JWT expira em uma hora e é enviado pelo cookie `dts_access_token`, com `HttpOnly`, `SameSite=Lax` e `Secure` quando `NODE_ENV=production`.
- Alterações em anúncios exigem propriedade do anúncio ou acesso administrativo. Conversas e chamados têm verificações de participação/propriedade.
- O backend recalcula os valores dos itens a partir do banco ao criar um pedido.

## Executar localmente

### Pré-requisitos

- Node.js **22.12 ou superior**, atendendo aos requisitos registrados nos lockfiles do Vite e do cliente Supabase.
- npm e Git.
- Projeto Supabase com a estrutura de banco esperada e o bucket de imagens configurados.
- Credenciais do Mercado Pago para testar pedidos com checkout.
- Configuração do Chatbase para identificar usuários no assistente.

Não é necessário instalar PostgreSQL local para usar um projeto Supabase remoto. As antigas variáveis `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` e `DB_PASSWORD` não são utilizadas pela aplicação atual.

Verifique as ferramentas:

```bash
node --version
npm --version
git --version
```

### Backend

A partir da raiz do repositório:

```bash
cd backend
npm ci
```

Copie `backend/.env.example` para `backend/.env` e preencha as configurações. No PowerShell, dentro de `backend`:

```powershell
Copy-Item .env.example .env
```

| Variável | Uso |
| --- | --- |
| `PORT` | Porta local do backend; padrão `3000` |
| `SUPABASE_URL` | URL do projeto Supabase; obrigatória para iniciar a API |
| `SUPABASE_SECRET_KEY` | Chave secreta de serviço do Supabase; obrigatória e exclusiva do backend |
| `JWT_SECRET` | Segredo de assinatura da sessão com pelo menos 32 caracteres; necessário para autenticação |
| `FRONTEND_URL` | URL usada nos retornos do checkout; em desenvolvimento, `http://localhost:5173` |
| `BACKEND_URL` | URL usada para o webhook; precisa ser pública para receber notificações do Mercado Pago |
| `MP_ACCESS_TOKEN` | Credencial do Mercado Pago usada para gerar checkout e consultar pagamentos |
| `MP_WEBHOOK_SECRET` | Segredo para validar a assinatura do webhook; o código atual dispensa essa validação quando está ausente |
| `CHATBOT_IDENTITY_SECRET` | Segredo de identificação no Chatbase; sem ele, o endpoint de identificação retorna 503 |

O exemplo também contém `SUPABASE_PUBLISHABLE_KEY` e `SUPABASE_JWKS_URL`, que não são usadas pela autenticação atual. `PRODUCT_IMPORT_IMAGE_HOSTS` está relacionado ao importador, cujo script não está versionado neste checkout.

Para gerar um segredo de sessão:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Inicie o servidor:

```bash
npm run dev
```

A API fica disponível em [http://localhost:3000](http://localhost:3000). `GET /` retorna uma mensagem de funcionamento da API; essa rota não verifica a disponibilidade do banco ou das integrações.

### Frontend

Em outro terminal, a partir da raiz do repositório:

```bash
cd frontend
npm ci
npm run dev
```

Abra [http://localhost:5173](http://localhost:5173), ou a porta informada pelo Vite. O frontend utiliza `/api` como prefixo fixo. O proxy em `frontend/vite.config.js` remove esse prefixo e encaminha as chamadas para `http://localhost:3000`.

Se mudar a porta do backend, atualize também o destino do proxy. O fluxo atual não exige um arquivo `.env` do frontend. Nunca coloque chaves secretas do Supabase, JWT, Mercado Pago ou Chatbase no cliente.

### Banco de dados e imagens

Os serviços esperam as seguintes tabelas:

- `users`, `category`, `products` e `product_images`;
- `favorites`, `product_reviews` e `seller_reviews`;
- `orders`, `order_items` e `payments`;
- `conversations` e `messages`;
- `support_tickets` e `support_messages`.

A baixa de estoque chama a função SQL `decrement_product_stock`, com os parâmetros `product_id` e `amount`. As imagens são enviadas ao bucket `product-images`, e a interface utiliza URLs públicas geradas pelo Storage.

Antes de publicar as correções do carrinho, aplique `backend/migrations/20261109_cart_stock.sql` no SQL Editor do Supabase. Essa migração adiciona `restock_product` (incremento atômico) e `transition_order_status` (cancelamento e reposição numa única transação, com bloqueio contra webhooks duplicados). O backend depende dessas funções. A migração não altera pedidos existentes: cancelamentos antigos cuja reposição falhou precisam de reconciliação com o estoque real; não some automaticamente todos os itens cancelados, pois alguns já foram repostos.

Validação do carrinho: `node --test --test-isolation=none frontend/src/utils/cart.test.js`. Em ambiente de homologação, confira: cancelamento de um pedido pendente devolve o estoque; repetição e concorrência do mesmo webhook não duplicam a reposição; falha na reposição mantém o pedido pendente e retorna HTTP 500 para nova tentativa; falha na criação do link cancela o pedido e libera o estoque; ao retornar à aba, o carrinho atualiza estoque e preço. Pagamentos pendentes continuam reservando estoque até a confirmação ou cancelamento informado pelo provedor.

**O repositório ainda não inclui migrations nem o esquema SQL completo.** Criar apenas as tabelas pelos nomes não é suficiente: relações, constraints, valores padrão e a função de estoque precisam corresponder às consultas dos serviços. Solicite à equipe responsável pelo banco a estrutura compatível antes de executar os fluxos. A aplicação não provisiona esses recursos automaticamente.

### Testar a integração de pagamentos

1. Configure as credenciais de teste do Mercado Pago no backend.
2. Defina `FRONTEND_URL` para a interface utilizada no teste.
3. Para receber webhooks durante o desenvolvimento local, exponha o backend por um túnel HTTPS e use essa URL em `BACKEND_URL`.
4. Configure `MP_WEBHOOK_SECRET` para validar a assinatura das notificações.
5. Crie um pedido com uma conta autenticada e produtos com estoque, conclua o checkout de teste e acompanhe a atualização do pedido.

Os retornos são `/checkout/success`, `/checkout/failure` e `/checkout/pending`. A tela consulta o backend a cada quatro segundos quando recebe `external_reference`; o redirecionamento por si só não confirma pagamento. O carrinho é esvaziado nessa tela quando a API informa que o pedido está pago.

Sem `MP_ACCESS_TOKEN`, a geração do checkout falha. Como a reserva de estoque acontece antes dessa etapa, consulte as limitações abaixo antes de testar esse cenário.

## Scripts e verificações

Execute os comandos dentro da pasta indicada:

| Pasta | Comando | Finalidade |
| --- | --- | --- |
| `backend` | `npm run dev` | Iniciar o servidor com recarga usando `tsx watch` |
| `backend` | `npm run typecheck` | Verificar tipos sem emitir arquivos |
| `backend` | `npm run build` | Compilar `src` para `dist` |
| `frontend` | `npm run dev` | Iniciar o Vite com proxy para a API |
| `frontend` | `npm run build` | Gerar a interface em `dist` |
| `frontend` | `npm run preview` | Pré-visualizar o build da interface |

O preview do frontend não substitui a implantação integrada com a API; o proxy local está configurado em `server.proxy` para desenvolvimento.

O `npm test` do backend é um placeholder que termina com erro. Não há script de testes no frontend nem configuração de lint ou CI versionada. O comando `npm run import:products` existe no backend, mas referencia `src/scripts/import-products.ts`, ausente do repositório e abrangido pelas regras do `.gitignore`.

## API

Os caminhos abaixo são relativos ao backend. Pelo frontend, acrescente `/api` — por exemplo, `/api/users/login`. As rotas privadas utilizam o cookie de sessão; não exigem um token Bearer no cliente atual.

| Grupo | Rotas |
| --- | --- |
| Sessão e perfil | `POST /users`, `POST /users/login`, `POST /users/logout`, `GET /users/me`, `PATCH /users/me`, `GET /users/chatbot-token` |
| Categorias | `GET /categories`, `POST /categories`, `PUT /categories/:id`, `DELETE /categories/:id` |
| Produtos | `GET /products`, `GET /products/mine`, `GET /products/:id`, `POST /products`, `PUT /products/:id`, `DELETE /products/:id` |
| Imagens | `POST /products/:id/images`, `DELETE /products/:id/images/:imageId` |
| Vendedores | `GET /sellers/:id` |
| Avaliações | `GET` e `POST /products/:id/reviews`; `GET` e `POST /sellers/:id/reviews` |
| Favoritos | `GET /favorites`; `GET`, `POST` e `DELETE /favorites/:productId` |
| Pedidos | `GET /orders/mine`, `GET /orders/selling`, `GET /orders/:id`, `POST /orders`, `POST /orders/:id/checkout` |
| Pagamentos | `POST /payments/webhook`, `GET /payments/order/:orderId` |
| Conversas | `GET` e `POST /conversations`; `GET` e `POST /conversations/:id/messages` |
| Suporte | `GET` e `POST /support/tickets`; `GET /support/tickets/:id`; `GET` e `POST /support/tickets/:id/messages` |
| Administração de usuários | `GET /admin/users`, `PATCH /admin/users/:id/role`, `DELETE /admin/users/:id` |
| Administração de anúncios | `GET /admin/products`, `DELETE /admin/products/:id` |
| Administração de suporte | `GET /admin/support/tickets`; `GET` e `POST /admin/support/tickets/:id/messages`; `PATCH /admin/support/tickets/:id/status` |

A leitura do catálogo, das categorias, dos perfis de vendedores e das avaliações é pública. Alterações em categorias e todas as rotas `/admin` exigem papel administrativo. O webhook é chamado pelo Mercado Pago e usa sua própria validação de assinatura.

`GET /products` aceita `q`, `categoryId`, `minPrice`, `maxPrice`, `page` e `limit`. A API usa 24 itens por padrão e permite até 60 por página. O upload utiliza `multipart/form-data` com o campo `images`.

## Implantação na Vercel

As configurações existentes separam a aplicação em dois projetos:

- **Backend:** diretório raiz `backend`, entrada `api/index.ts` e rewrite de todas as rotas para `/api/index`. Essa entrada exporta o Express sem chamar `listen()`.
- **Frontend:** diretório raiz `frontend`, framework Vite, build `npm run build` e saída `dist`. As rotas da interface retornam `index.html` para permitir navegação pelo React Router.

O rewrite `/api/:path*` do frontend aponta atualmente para `https://marketplace-de-produtos-nu.vercel.app/:path*`. Atualize `frontend/vercel.json` se mudar o endereço da API.

Configure as variáveis de ambiente no projeto do backend, com `FRONTEND_URL` e `BACKEND_URL` correspondentes aos endereços públicos. A configuração de pagamentos possui URLs de fallback no código; definir as variáveis evita redirecionar para outro ambiente. A existência desses endereços na configuração não garante que a implantação esteja online.

## Limitações atuais e próximos passos

- **Recuperação de senha:** a página existe, mas não envia instruções nem possui fluxo de redefinição no backend.
- **Catálogo:** localização do anúncio, filtro por localização e seleção de ordenação não estão implementados. O endereço do checkout é apenas o endereço de entrega do pedido.
- **Paginação:** a busca mostra os primeiros 24 resultados sem navegação entre páginas. As listagens de anúncios do vendedor e do administrador carregam até 60 itens.
- **Suporte administrativo:** endpoints e funções de cliente existem, mas ainda falta a página administrativa correspondente.
- **Pedidos e estoque:** falhas na criação do checkout podem deixar pedidos pendentes e estoque reservado. Não há rotina de expiração de pedidos abandonados, e a reposição de estoque precisa de tratamento atômico e recuperação de falhas.
- **Pagamentos:** o tratamento de notificações precisa cobrir concorrência, múltiplas tentativas e alterações posteriores, como reembolso de pedido pago. O webhook atualmente retorna HTTP 200 mesmo em caso de erro no processamento.
- **Permissões:** alterações de papel e exclusões de usuário não revogam imediatamente tokens já emitidos. Não há limitação de tentativas de login implementada na aplicação.
- **Avaliações e conversas:** avaliações não exigem compra comprovada; a criação de conversa ainda não valida a relação entre produto e vendedor informado.
- **Operação do marketplace:** não há fluxo implementado de repasse automático aos vendedores nem gerenciamento completo de envio e entrega.
- **Qualidade e reprodução do ambiente:** versionar migrations e a função de estoque, implementar testes automatizados, configurar CI e manter a documentação dos módulos alinhada ao código.

## Contribuição

Não desenvolva diretamente na `main`. Com suas alterações locais salvas, atualize a branch principal e crie uma branch para a tarefa:

```bash
git switch main
git pull origin main
git switch -c docs/atualiza-documentacao
```

Convenções utilizadas pela equipe:

| Branch | Finalidade |
| --- | --- |
| `feature/` | Nova funcionalidade |
| `fix/` | Correção de problema |
| `refactor/` | Refatoração |
| `docs/` | Documentação |
| `test/` | Testes |
| `chore/` | Manutenção e configuração |

Use commits com os prefixos `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `style:` ou `chore:`. Abra um Pull Request para `main`, descrevendo o problema, a alteração e as verificações realizadas.

Antes de abrir o PR, execute as verificações pertinentes, revise os arquivos alterados e atualize a documentação. Não versione `.env`, credenciais, chaves privadas, `node_modules`, builds ou logs; consulte o `.gitignore` para as regras completas.

## Equipe

| Integrante | Responsabilidade |
| --- | --- |
| Matheus Araújo | Frontend |
| Antônio Kauã | Backend |
| Filipe Mateus | Banco de Dados |
| Francisco Lucas | Documentação |

## Objetivos acadêmicos

Aplicar conhecimentos de engenharia de software, desenvolvimento web, APIs REST, modelagem relacional, autenticação, arquitetura cliente-servidor, integrações externas e trabalho colaborativo com Git e GitHub.
