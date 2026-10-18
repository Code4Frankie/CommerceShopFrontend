import { Link, NavLink, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import { useCart } from "./context/CartContext.jsx";
import { RequireAdmin, RequireAuth } from "./components/Guards.jsx";
import logoHeader from "./assets/logo-header.png";
import logoHeaderReverse from "./assets/logo-header-reverse.png";
import Home from "./pages/Home.jsx";
import Products from "./pages/Products.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import PaymentCallback from "./pages/PaymentCallback.jsx";
import Orders from "./pages/Orders.jsx";
import Account from "./pages/Account.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import AdminProducts from "./pages/admin/AdminProducts.jsx";
import AdminCategories from "./pages/admin/AdminCategories.jsx";
import AdminOrders from "./pages/admin/AdminOrders.jsx";

const CartIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 4h2.5l2 11h10l2-8H7" />
    <circle cx="9" cy="19.5" r="1.4" />
    <circle cx="17" cy="19.5" r="1.4" />
  </svg>
);

export default function App() {
  const { user, logout, isAdmin } = useAuth();
  const { count } = useCart();

  return (
    <>
      <div className="announce">Proudly Nigerian products, paid for securely online.</div>
      <header className="nav">
        <Link to="/" className="brand" aria-label="ShopCore home">
          <img src={logoHeader} alt="ShopCore" />
        </Link>
        <nav aria-label="Main">
          <NavLink to="/products">Shop</NavLink>
          {user && <NavLink to="/orders">My orders</NavLink>}
          {isAdmin && <NavLink to="/admin">Admin</NavLink>}
          {user ? (
            <>
              <NavLink to="/account">{user.name?.split(" ")[0] || "Account"}</NavLink>
              <button className="link" onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Log in</NavLink>
              <NavLink to="/register" className="btn small">
                Sign up
              </NavLink>
            </>
          )}
          <NavLink to="/cart" className="cart-link" aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}>
            <CartIcon />
            {count > 0 && <b className="badge">{count}</b>}
          </NavLink>
        </nav>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route
            path="/checkout"
            element={
              <RequireAuth>
                <Checkout />
              </RequireAuth>
            }
          />
          <Route path="/payment/callback" element={<PaymentCallback />} />
          <Route
            path="/orders"
            element={
              <RequireAuth>
                <Orders />
              </RequireAuth>
            }
          />
          <Route
            path="/account"
            element={
              <RequireAuth>
                <Account />
              </RequireAuth>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            }
          >
            <Route index element={<AdminProducts />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="orders" element={<AdminOrders />} />
          </Route>
          <Route
            path="*"
            element={
              <div className="panel center">
                <h1>Page not found</h1>
                <p className="muted">The page you are looking for does not exist.</p>
                <Link to="/" className="btn">
                  Back to the shop
                </Link>
              </div>
            }
          />
        </Routes>
      </main>

      <footer className="footer">
        <div className="pattern-strip" aria-hidden="true" />
        <div className="footer-inner">
          <div className="footer-brand">
            <img src={logoHeaderReverse} alt="ShopCore" />
            <p>Shop local products, made in Nigeria.</p>
          </div>
          <div>
            <h2>Shop</h2>
            <Link to="/products">All products</Link>
            <Link to="/cart">Your cart</Link>
          </div>
          <div>
            <h2>Your account</h2>
            {user ? (
              <>
                <Link to="/orders">My orders</Link>
                <Link to="/account">Account settings</Link>
              </>
            ) : (
              <>
                <Link to="/login">Log in</Link>
                <Link to="/register">Create an account</Link>
              </>
            )}
          </div>
        </div>
        <div className="legal">&copy; {new Date().getFullYear()} ShopCore</div>
      </footer>
    </>
  );
}
