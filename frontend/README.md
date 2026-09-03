# DTS Frontend

Frontend funcional inicial da DTS — Digital Trading & Selling.

## Requisitos
- Node.js 20+
- npm

## Executar
```bash
npm install
npm run dev
```

Abra http://localhost:5173

## Integração com a API
A versão entregue usa dados mockados para a experiência de marketplace e localStorage para demonstrar login.
Para conectar à API Node.js, crie `src/services/api.js` com Axios/fetch e substitua as funções mock de autenticação, produtos, pedidos e pagamentos.

Importante: nenhuma chave secreta do Supabase ou Mercado Pago deve ser colocada no frontend.
