import React, { useState } from "react";
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import {
  Search, ShoppingCart, User, Menu, X, ChevronRight, Heart, Star,
  Truck, ShieldCheck, CreditCard, ArrowRight, LogOut, Package,
  LayoutDashboard, Store, MapPin, CheckCircle2
} from "lucide-react";

const products = [
  { id: 1, name: "Notebook Lenovo IdeaPad 3", price: 2499.9, old: 2899.9, category: "Informática", rating: 4.8, seller: "DTS Store", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80" },
  { id: 2, name: "Smartphone Samsung Galaxy", price: 1599.9, old: 1799.9, category: "Eletrônicos", rating: 4.7, seller: "Tech Brasil", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80" },
  { id: 3, name: "Fone Bluetooth Premium", price: 249.9, old: 329.9, category: "Eletrônicos", rating: 4.9, seller: "Audio Shop", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80" },
  { id: 4, name: "Cadeira Ergonômica", price: 899.9, old: 1099.9, category: "Casa", rating: 4.6, seller: "Home Design", image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=800&q=80" },
  { id: 5, name: "Tênis Esportivo", price: 299.9, old: 399.9, category: "Moda", rating: 4.8, seller: "Sport Mix", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80" },
  { id: 6, name: "Monitor Full HD 24\"", price: 699.9, old: 799.9, category: "Informática", rating: 4.7, seller: "DTS Store", image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80" }
];

const money = value => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function Header({ cartCount = 0, user, onLogout }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const search = e => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="container-dts flex h-20 items-center gap-4">
        <button className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
        <Link to="/" className="shrink-0">
          <div className="text-2xl font-black tracking-tight text-dts-600">DTS</div>
          <div className="-mt-1 hidden text-[9px] font-bold uppercase tracking-[.22em] text-slate-500 sm:block">Digital Trading & Selling</div>
        </Link>

        <form onSubmit={search} className="hidden flex-1 md:flex">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} />
            <input value={q} onChange={e => setQ(e.target.value)} className="input pl-11" placeholder="O que você está procurando?" />
          </div>
        </form>

        <nav className="ml-auto flex items-center gap-2">
          <Link to="/seller" className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 lg:block">Vender na DTS</Link>
          {user ? (
            <div className="group relative hidden sm:block">
              <button className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-slate-100">
                <User size={20}/><span className="max-w-24 truncate text-sm font-semibold">{user.name}</span>
              </button>
              <div className="invisible absolute right-0 mt-1 w-56 rounded-2xl border bg-white p-2 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100">
                <Link className="flex gap-2 rounded-xl px-3 py-2 hover:bg-slate-50" to="/account">Minha conta</Link>
                <Link className="flex gap-2 rounded-xl px-3 py-2 hover:bg-slate-50" to="/account/orders">Meus pedidos</Link>
                <button onClick={onLogout} className="flex w-full gap-2 rounded-xl px-3 py-2 text-left text-red-600 hover:bg-red-50"><LogOut size={18}/>Sair</button>
              </div>
            </div>
          ) : <Link to="/login" className="hidden items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold hover:bg-slate-100 sm:flex"><User size={20}/>Entrar</Link>}
          <Link to="/cart" className="relative rounded-xl p-2 hover:bg-slate-100">
            <ShoppingCart />
            {cartCount > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-dts-600 px-1 text-xs font-bold text-white">{cartCount}</span>}
          </Link>
        </nav>
      </div>

      <div className="border-t border-slate-100 md:hidden">
        <form onSubmit={search} className="container-dts py-3">
          <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/><input value={q} onChange={e=>setQ(e.target.value)} className="input pl-11" placeholder="Buscar produtos..."/></div>
        </form>
      </div>

      {open && <div className="border-t bg-white p-4 lg:hidden">
        <div className="container-dts flex flex-col gap-2">
          <Link onClick={()=>setOpen(false)} to="/seller" className="rounded-xl p-3 hover:bg-slate-50">Vender na DTS</Link>
          {user ? <><Link onClick={()=>setOpen(false)} to="/account" className="rounded-xl p-3 hover:bg-slate-50">Minha conta</Link><button onClick={onLogout} className="rounded-xl p-3 text-left text-red-600 hover:bg-red-50">Sair</button></> : <Link onClick={()=>setOpen(false)} to="/login" className="rounded-xl p-3 hover:bg-slate-50">Entrar / Criar conta</Link>}
        </div>
      </div>}

      <div className="hidden border-t border-slate-100 md:block">
        <div className="container-dts flex h-11 items-center gap-7 text-sm font-medium text-slate-600">
          <Link to="/categories/eletronicos" className="hover:text-dts-600">Eletrônicos</Link>
          <Link to="/categories/informatica" className="hover:text-dts-600">Informática</Link>
          <Link to="/categories/casa" className="hover:text-dts-600">Casa</Link>
          <Link to="/categories/moda" className="hover:text-dts-600">Moda</Link>
          <Link to="/search?q=ofertas" className="font-bold text-dts-600">Ofertas</Link>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return <footer className="mt-20 border-t bg-white">
    <div className="container-dts grid gap-10 py-12 md:grid-cols-4">
      <div><div className="text-2xl font-black text-dts-600">DTS</div><p className="mt-3 text-sm leading-6 text-slate-500">Digital Trading & Selling. Um marketplace para comprar e vender de forma simples.</p></div>
      <div><h3 className="font-bold">Comprar</h3><div className="mt-3 space-y-2 text-sm text-slate-500"><Link className="block hover:text-dts-600" to="/search">Produtos</Link><Link className="block hover:text-dts-600" to="/cart">Carrinho</Link><Link className="block hover:text-dts-600" to="/account/orders">Pedidos</Link></div></div>
      <div><h3 className="font-bold">Vender</h3><div className="mt-3 space-y-2 text-sm text-slate-500"><Link className="block hover:text-dts-600" to="/seller">Vender na DTS</Link><Link className="block hover:text-dts-600" to="/seller/products">Meus produtos</Link></div></div>
      <div><h3 className="font-bold">Atendimento</h3><p className="mt-3 text-sm text-slate-500">Central de ajuda e suporte DTS.</p></div>
    </div>
    <div className="border-t py-5 text-center text-xs text-slate-400">© {new Date().getFullYear()} DTS — Digital Trading & Selling.</div>
  </footer>;
}

function ProductCard({ product, onAdd }) {
  return <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-lg">
    <Link to={`/products/${product.id}`}><div className="relative aspect-square overflow-hidden bg-slate-100"><img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/><button onClick={e=>e.preventDefault()} className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-slate-500 shadow-sm"><Heart size={18}/></button></div></Link>
    <div className="p-4">
      <p className="text-xs font-semibold text-slate-400">{product.category}</p>
      <Link to={`/products/${product.id}`}><h3 className="mt-1 min-h-10 font-semibold leading-5 hover:text-dts-600">{product.name}</h3></Link>
      <div className="mt-2 flex items-center gap-1 text-sm"><Star size={15} className="fill-amber-400 text-amber-400"/>{product.rating}<span className="text-slate-400">• {product.seller}</span></div>
      <div className="mt-3 text-xs text-slate-400 line-through">{money(product.old)}</div>
      <div className="text-xl font-black">{money(product.price)}</div>
      <div className="mt-1 text-sm font-medium text-emerald-600">em até 12x sem juros</div>
      <button onClick={()=>onAdd(product)} className="btn-primary mt-4 w-full py-2.5">Adicionar ao carrinho</button>
    </div>
  </div>;
}

function Home({ onAdd }) {
  const categories = [["Eletrônicos","📱"],["Informática","💻"],["Casa","🏠"],["Moda","👟"],["Automóveis","🚗"],["Outros","📦"]];
  return <main>
    <section className="bg-gradient-to-br from-dts-900 via-dts-700 to-dts-600 text-white">
      <div className="container-dts grid min-h-[430px] items-center gap-10 py-14 md:grid-cols-2">
        <div><span className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">DTS Marketplace</span><h1 className="mt-6 text-4xl font-black tracking-tight sm:text-6xl">Encontre. Compre. Venda.</h1><p className="mt-5 max-w-xl text-lg leading-8 text-blue-100">Uma nova experiência para comprar e vender produtos na Digital Trading & Selling.</p><div className="mt-8 flex flex-wrap gap-3"><Link to="/search" className="btn-primary bg-white text-dts-700 hover:bg-blue-50">Comprar agora <ArrowRight className="ml-2" size={18}/></Link><Link to="/seller" className="btn-secondary border-white/30 bg-white/10 text-white hover:bg-white/20">Quero vender</Link></div></div>
        <div className="hidden md:block"><div className="mx-auto max-w-md rounded-[2rem] bg-white/10 p-4 backdrop-blur"><img src={products[0].image} alt="Produto em destaque" className="h-72 w-full rounded-3xl object-cover"/><div className="p-4"><div className="text-sm text-blue-100">Oferta em destaque</div><div className="mt-1 text-xl font-bold">Notebook Lenovo IdeaPad 3</div></div></div></div>
      </div>
    </section>

    <section className="container-dts -mt-8 relative z-10">
      <div className="grid grid-cols-2 gap-3 rounded-2xl border bg-white p-4 shadow-lg sm:grid-cols-3 lg:grid-cols-6">
        {categories.map(([name,icon])=><Link key={name} to={`/categories/${name.toLowerCase()}`} className="flex flex-col items-center gap-2 rounded-xl p-3 text-center hover:bg-slate-50"><span className="text-3xl">{icon}</span><span className="text-sm font-semibold">{name}</span></Link>)}
      </div>
    </section>

    <section className="container-dts pt-14"><div className="flex items-end justify-between"><div><p className="font-semibold text-dts-600">Seleção DTS</p><h2 className="text-3xl font-black">Ofertas em destaque</h2></div><Link to="/search?q=ofertas" className="hidden items-center gap-1 font-semibold text-dts-600 sm:flex">Ver todas <ChevronRight size={18}/></Link></div><div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{products.map(p=><ProductCard key={p.id} product={p} onAdd={onAdd}/>)}</div></section>

    <section className="container-dts py-16"><div className="grid gap-4 md:grid-cols-3">
      <div className="card p-6"><Truck className="text-dts-600"/><h3 className="mt-4 font-bold">Entrega</h3><p className="mt-2 text-sm text-slate-500">Acompanhe seus pedidos em um só lugar.</p></div>
      <div className="card p-6"><ShieldCheck className="text-dts-600"/><h3 className="mt-4 font-bold">Compra segura</h3><p className="mt-2 text-sm text-slate-500">Sua compra passa por uma experiência segura.</p></div>
      <div className="card p-6"><CreditCard className="text-dts-600"/><h3 className="mt-4 font-bold">Pagamento</h3><p className="mt-2 text-sm text-slate-500">Checkout preparado para integração com Mercado Pago.</p></div>
    </div></section>
  </main>;
}

function Login({ onLogin }) {
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [error,setError]=useState("");
  const submit=e=>{e.preventDefault(); if(!email||!password){setError("Informe e-mail e senha.");return;} onLogin({name:email.split("@")[0],email});};
  return <AuthShell title="Entre na sua conta" subtitle="Acesse seus pedidos, favoritos e compras."><form onSubmit={submit} className="space-y-5"><Field label="E-mail"><input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com"/></Field><Field label="Senha"><input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"/></Field>{error&&<p className="text-sm font-medium text-red-600">{error}</p>}<div className="text-right"><Link to="/forgot-password" className="text-sm font-semibold text-dts-600">Esqueceu sua senha?</Link></div><button className="btn-primary w-full">Entrar</button><p className="text-center text-sm text-slate-500">Ainda não possui conta? <Link className="font-bold text-dts-600" to="/register">Criar conta</Link></p></form></AuthShell>;
}

function Register({ onLogin }) {
  const [data,setData]=useState({name:"",email:"",password:"",confirm:""}); const [error,setError]=useState("");
  const submit=e=>{e.preventDefault(); if(!data.name||!data.email||!data.password){setError("Preencha todos os campos.");return;} if(data.password!==data.confirm){setError("As senhas não conferem.");return;} onLogin({name:data.name,email:data.email});};
  return <AuthShell title="Crie sua conta" subtitle="Cadastre-se para comprar e vender na DTS."><form onSubmit={submit} className="space-y-4"><Field label="Nome"><input className="input" value={data.name} onChange={e=>setData({...data,name:e.target.value})}/></Field><Field label="E-mail"><input className="input" type="email" value={data.email} onChange={e=>setData({...data,email:e.target.value})}/></Field><Field label="Senha"><input className="input" type="password" value={data.password} onChange={e=>setData({...data,password:e.target.value})}/></Field><Field label="Confirmar senha"><input className="input" type="password" value={data.confirm} onChange={e=>setData({...data,confirm:e.target.value})}/></Field>{error&&<p className="text-sm text-red-600">{error}</p>}<button className="btn-primary w-full">Criar minha conta</button><p className="text-center text-sm text-slate-500">Já possui conta? <Link className="font-bold text-dts-600" to="/login">Entrar</Link></p></form></AuthShell>;
}

function AuthShell({title,subtitle,children}) { return <main className="min-h-[calc(100vh-132px)] bg-slate-50 py-12"><div className="mx-auto max-w-md px-4"><div className="mb-7 text-center"><Link to="/" className="text-3xl font-black text-dts-600">DTS</Link><h1 className="mt-6 text-2xl font-black">{title}</h1><p className="mt-2 text-sm text-slate-500">{subtitle}</p></div><div className="card p-6 sm:p-8">{children}</div></div></main>; }
function Field({label,children}) { return <label className="block"><span className="mb-2 block text-sm font-semibold">{label}</span>{children}</label>; }

function SearchPage({onAdd}) {
  const [term,setTerm]=useState(new URLSearchParams(useLocation().search).get("q")||"");
  const filtered=products.filter(p=>(p.name+" "+p.category).toLowerCase().includes(term.toLowerCase()));
  return <main className="container-dts py-10"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm text-slate-400">DTS / Busca</p><h1 className="mt-1 text-3xl font-black">Produtos</h1></div><input value={term} onChange={e=>setTerm(e.target.value)} className="input max-w-md" placeholder="Pesquisar..."/></div><p className="mt-3 text-sm text-slate-500">{filtered.length} produto(s) encontrado(s).</p><div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{filtered.map(p=><ProductCard key={p.id} product={p} onAdd={onAdd}/>)}</div></main>;
}

function ProductDetails({onAdd}) {
  const id=Number(useLocation().pathname.split("/").pop()); const p=products.find(x=>x.id===id)||products[0];
  return <main className="container-dts py-10"><div className="mb-6 text-sm text-slate-400">Home / {p.category} / {p.name}</div><div className="grid gap-10 rounded-3xl border bg-white p-5 shadow-sm md:grid-cols-2 md:p-8"><div className="overflow-hidden rounded-2xl bg-slate-100"><img src={p.image} alt={p.name} className="aspect-square h-full w-full object-cover"/></div><div><span className="text-sm font-semibold text-slate-400">{p.category}</span><h1 className="mt-2 text-3xl font-black">{p.name}</h1><div className="mt-3 flex items-center gap-2"><Star className="fill-amber-400 text-amber-400"/><b>{p.rating}</b><span className="text-slate-400">avaliações</span></div><div className="mt-8 text-sm text-slate-400 line-through">{money(p.old)}</div><div className="text-4xl font-black">{money(p.price)}</div><p className="mt-2 font-medium text-emerald-600">12x sem juros</p><div className="my-8 rounded-2xl bg-slate-50 p-4"><div className="flex gap-3"><Truck className="text-dts-600"/><div><b>Entrega</b><p className="text-sm text-slate-500">Consulte o prazo no checkout.</p></div></div></div><button onClick={()=>onAdd(p)} className="btn-primary w-full">Adicionar ao carrinho</button><button className="btn-secondary mt-3 w-full">Comprar agora</button><p className="mt-5 text-sm text-slate-500">Vendido por <b className="text-slate-700">{p.seller}</b></p></div></div><div className="mt-8 rounded-3xl border bg-white p-6"><h2 className="text-xl font-black">Descrição</h2><p className="mt-3 leading-7 text-slate-600">Produto anunciado na DTS. Esta área será preenchida posteriormente pelos dados retornados pela API.</p></div></main>;
}

function Cart({cart,onRemove,onQty}) {
  const total=cart.reduce((s,i)=>s+i.price*i.qty,0);
  return <main className="container-dts py-10"><h1 className="text-3xl font-black">Seu carrinho</h1>{!cart.length?<div className="card mt-8 p-10 text-center"><ShoppingCart className="mx-auto text-slate-300" size={48}/><h2 className="mt-4 text-xl font-bold">Seu carrinho está vazio</h2><Link className="btn-primary mt-5" to="/search">Continuar comprando</Link></div>:<div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]"><div className="space-y-3">{cart.map(i=><div key={i.id} className="card flex gap-4 p-4"><img src={i.image} className="h-24 w-24 rounded-xl object-cover" alt=""/><div className="min-w-0 flex-1"><h3 className="font-bold">{i.name}</h3><p className="mt-1 text-sm text-slate-500">{i.seller}</p><div className="mt-3 flex items-center gap-3"><button onClick={()=>onQty(i.id,-1)} className="rounded-lg border px-3 py-1">−</button><span>{i.qty}</span><button onClick={()=>onQty(i.id,1)} className="rounded-lg border px-3 py-1">+</button></div></div><div className="text-right"><b>{money(i.price*i.qty)}</b><button onClick={()=>onRemove(i.id)} className="mt-3 block text-sm font-semibold text-red-600">Remover</button></div></div>)}</div><div className="card h-fit p-6"><h2 className="text-lg font-black">Resumo</h2><div className="mt-5 flex justify-between text-slate-500"><span>Subtotal</span><span>{money(total)}</span></div><div className="mt-3 flex justify-between text-slate-500"><span>Frete</span><span>A calcular</span></div><div className="my-5 border-t pt-5 flex justify-between text-xl font-black"><span>Total</span><span>{money(total)}</span></div><Link to="/checkout" className="btn-primary w-full">Continuar compra</Link></div></div>}</main>;
}

function Checkout({user}) {
  if(!user) return <Navigate to="/login?next=/checkout" replace/>;
  return <main className="container-dts py-10"><h1 className="text-3xl font-black">Checkout</h1><div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]"><div className="space-y-5"><div className="card p-6"><h2 className="font-black">1. Endereço de entrega</h2><div className="mt-4 grid gap-3 sm:grid-cols-2"><input className="input" placeholder="CEP"/><input className="input" placeholder="Cidade"/><input className="input sm:col-span-2" placeholder="Endereço"/></div></div><div className="card p-6"><h2 className="font-black">2. Pagamento</h2><div className="mt-4 rounded-xl border border-dashed p-5 text-sm text-slate-500">Área preparada para integrar o checkout do Mercado Pago pela API DTS.</div><button className="btn-primary mt-5 w-full">Continuar para pagamento</button></div></div><div className="card h-fit p-6"><h2 className="font-black">Resumo da compra</h2><p className="mt-4 text-sm text-slate-500">Os itens serão carregados do carrinho/API.</p></div></div></main>;
}

function Account({user}) { return <main className="container-dts py-10"><h1 className="text-3xl font-black">Minha conta</h1><div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{[["Perfil",User,"/account/profile"],["Meus pedidos",Package,"/account/orders"],["Favoritos",Heart,"/account/favorites"],["Endereços",MapPin,"/account/addresses"]].map(([t,I,to])=><Link key={t} to={to} className="card p-6 transition hover:-translate-y-1 hover:shadow-md"><I className="text-dts-600"/><h2 className="mt-4 font-bold">{t}</h2><p className="mt-1 text-sm text-slate-500">{t==="Perfil"?user.email:"Acessar"}</p></Link>)}</div></main>; }

function Seller() { return <main className="container-dts py-10"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="font-semibold text-dts-600">Área do vendedor</p><h1 className="text-3xl font-black">Vender na DTS</h1></div><Link to="/seller/products/new" className="btn-primary">+ Novo produto</Link></div><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["Vendas","R$ 28.900,00"],["Pedidos","187"],["Produtos","32"],["A receber","R$ 6.420,00"]].map(([a,b])=><div className="card p-5" key={a}><p className="text-sm text-slate-500">{a}</p><p className="mt-2 text-2xl font-black">{b}</p></div>)}</div><div className="mt-8 grid gap-6 lg:grid-cols-2"><div className="card p-6"><h2 className="font-black">Acesso rápido</h2><div className="mt-4 grid gap-3"><Link className="btn-secondary justify-start" to="/seller/products"><Store size={18}/> Meus produtos</Link><Link className="btn-secondary justify-start" to="/seller/orders"><Package size={18}/> Pedidos</Link><Link className="btn-secondary justify-start" to="/seller/financial"><CreditCard size={18}/> Financeiro</Link></div></div><div className="card p-6"><h2 className="font-black">Últimas vendas</h2><div className="mt-4 space-y-3">{["#DTS-00123"," #DTS-00122"," #DTS-00121"].map((x,i)=><div key={x} className="flex justify-between border-b pb-3 text-sm"><span>{x}</span><b>{money([249.9,899.9,1599.9][i])}</b></div>)}</div></div></div></main>; }

function Placeholder({title}) { return <main className="container-dts py-16"><div className="card p-10 text-center"><LayoutDashboard className="mx-auto text-dts-600" size={42}/><h1 className="mt-5 text-2xl font-black">{title}</h1><p className="mx-auto mt-2 max-w-lg text-slate-500">Tela estruturada e pronta para receber os dados da API DTS.</p></div></main>; }

export default function App() {
  const [user,setUser]=useState(()=>JSON.parse(localStorage.getItem("dts_user")||"null"));
  const [cart,setCart]=useState([]);
  const add=p=>setCart(c=>{const found=c.find(x=>x.id===p.id);return found?c.map(x=>x.id===p.id?{...x,qty:x.qty+1}:x):[...c,{...p,qty:1}];});
  const remove=id=>setCart(c=>c.filter(x=>x.id!==id));
  const qty=(id,d)=>setCart(c=>c.map(x=>x.id===id?{...x,qty:Math.max(1,x.qty+d)}:x));
  const login=u=>{localStorage.setItem("dts_user",JSON.stringify(u));setUser(u);};
  const logout=()=>{localStorage.removeItem("dts_user");setUser(null);};

  return <div className="min-h-screen bg-slate-50"><Header user={user} onLogout={logout} cartCount={cart.reduce((s,x)=>s+x.qty,0)}/><Routes>
    <Route path="/" element={<Home onAdd={add}/>}/>
    <Route path="/login" element={<Login onLogin={login}/>}/>
    <Route path="/register" element={<Register onLogin={login}/>}/>
    <Route path="/forgot-password" element={<AuthShell title="Recuperar senha" subtitle="Informe seu e-mail para receber as instruções."><form className="space-y-5"><Field label="E-mail"><input className="input" type="email" placeholder="seu@email.com"/></Field><button className="btn-primary w-full">Enviar instruções</button></form></AuthShell>}/>
    <Route path="/search" element={<SearchPage onAdd={add}/>}/>
    <Route path="/categories/:category" element={<SearchPage onAdd={add}/>}/>
    <Route path="/products/:id" element={<ProductDetails onAdd={add}/>}/>
    <Route path="/cart" element={<Cart cart={cart} onRemove={remove} onQty={qty}/>}/>
    <Route path="/checkout" element={<Checkout user={user}/>}/>
    <Route path="/account" element={user?<Account user={user}/>:<Navigate to="/login"/>}/>
    <Route path="/account/*" element={user?<Placeholder title="Minha conta"/>:<Navigate to="/login"/>}/>
    <Route path="/seller" element={<Seller/>}/>
    <Route path="/seller/*" element={<Seller/>}/>
    <Route path="*" element={<Placeholder title="Página não encontrada"/>}/>
  </Routes><Footer/></div>;
}