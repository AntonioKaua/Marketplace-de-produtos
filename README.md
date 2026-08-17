<div align="center">

# 🛒 Marketplace de Produtos Usados
# Digital Trading and Selling (DTS)

Plataforma web para compra e venda de produtos usados, permitindo que usuários publiquem anúncios, encontrem produtos próximos e entrem em contato com vendedores.

</div>

---

## 🚀 Tecnologias

### 🎨 Frontend

- **React.js**
- **TypeScript**
- **Tailwind CSS**

### ⚙️ Backend

- **Node.js**
- **TypeScript**
- **Express.js**

### 🗄️ Banco de Dados

- **PostgreSQL**

---

## 🏗️ Arquitetura

O projeto utiliza uma arquitetura com **Frontend e Backend separados**, comunicando-se através de uma **API REST**.

```text
┌──────────────────────┐
│      Frontend        │
│                      │
│ React + TypeScript   │
│      + Tailwind      │
└──────────┬───────────┘
           │
           │ API REST
           ▼
┌──────────────────────┐
│       Backend        │
│                      │
│ Node.js + Express    │
│      + TypeScript    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│     PostgreSQL       │
│                      │
│   Banco de Dados     │
│     Relacional       │
└──────────────────────┘
