import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import AppNavbar from "./components/AppNavbar.jsx";
import CartSidebar from "./components/CartSidebar.jsx";
import { ShopProvider, useShop } from "./context/ShopContext.jsx";
import CartPage from "./pages/CartPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import ProductDetailPage from "./pages/ProductDetailPage.jsx";
import "./App.css";

function AppLayout() {
  const { cart } = useShop();
  const { pathname } = useLocation();
  const hasCartItems = Array.isArray(cart.items) && cart.items.length > 0;
  const showCartSidebar = hasCartItems && pathname !== "/cart";

  return (
    <div className="app-shell">
      <AppNavbar />

      <div className={`app-layout${showCartSidebar ? " has-cart" : ""}`}>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="*" element={<Navigate replace to="/" />} />
          </Routes>
        </main>

        {showCartSidebar ? <CartSidebar /> : null}
      </div>
    </div>
  );
}

function AppFrame() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

function App() {
  return (
    <ShopProvider>
      <AppFrame />
    </ShopProvider>
  );
}

export default App;
