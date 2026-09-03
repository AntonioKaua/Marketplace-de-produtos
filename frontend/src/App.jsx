import { Navigate, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header";
import RequireAuth from "./components/RequireAuth";
import { useAuth } from "./context/AuthContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Search from "./pages/Search";
import ProductDetails from "./pages/ProductDetails";
import SellerProfile from "./pages/SellerProfile";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import CheckoutResult from "./pages/CheckoutResult";
import NotFound from "./pages/NotFound";

import AccountLayout from "./pages/account/AccountLayout";
import Profile from "./pages/account/Profile";
import Orders from "./pages/account/Orders";
import Favorites from "./pages/account/Favorites";
import Messages from "./pages/account/Messages";

import SellerLayout from "./pages/seller/SellerLayout";
import SellerDashboard from "./pages/seller/Dashboard";
import SellerProducts from "./pages/seller/Products";
import ProductForm from "./pages/seller/ProductForm";
import SellerOrders from "./pages/seller/Orders";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminUsers from "./pages/admin/Users";
import AdminProducts from "./pages/admin/Products";
import AdminCategories from "./pages/admin/Categories";

export default function App() {
  const { authLoading } = useAuth();

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="font-semibold text-slate-500">Carregando sua sessão...</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/search" element={<Search />} />
        <Route path="/categories/:categoryId" element={<Search />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/sellers/:id" element={<SellerProfile />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout/success" element={<CheckoutResult variant="success" />} />
        <Route path="/checkout/failure" element={<CheckoutResult variant="failure" />} />
        <Route path="/checkout/pending" element={<CheckoutResult variant="pending" />} />

        <Route path="/account" element={<RequireAuth><AccountLayout /></RequireAuth>}>
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<Profile />} />
          <Route path="orders" element={<Orders />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="messages" element={<Messages />} />
        </Route>

        <Route path="/seller" element={<RequireAuth><SellerLayout /></RequireAuth>}>
          <Route index element={<SellerDashboard />} />
          <Route path="products" element={<SellerProducts />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id/edit" element={<ProductForm />} />
          <Route path="orders" element={<SellerOrders />} />
        </Route>

        <Route path="/admin" element={<RequireAuth role="admin"><AdminLayout /></RequireAuth>}>
          <Route index element={<Navigate to="users" replace />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </div>
  );
}
