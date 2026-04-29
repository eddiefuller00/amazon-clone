import { Link } from "react-router-dom";
import { useShop } from "../context/ShopContext.jsx";

const formatPrice = (value) => `$${Number(value || 0).toFixed(2)}`;

function CartSidebar() {
  const { cart, isLoadingCart, updateItemQuantity, removeItemFromCart } = useShop();
  const cartItems = Array.isArray(cart.items) ? cart.items : [];

  if (cartItems.length === 0) {
  return null;
}

  return (
    <aside className="cart-sidebar">
      <div className="cart-sidebar-header">
        <p className="mb-1">Subtotal</p>
        <strong>{formatPrice(cart.subtotal)}</strong>
        <Link to="/cart" className="btn btn-outline-secondary btn-sm w-100 mt-2">
          Go to Cart
        </Link>
      </div>

      <div className="cart-sidebar-items">
        {cartItems.map((item) => {
          const product = item.product || item;
          const productId = item.productId ?? product.id;
          const quantity = Number(item.quantity || 0);

          return (
            <div className="cart-sidebar-item" key={productId}>
              <div className="cart-sidebar-image">
                <img
                    src={product.image}
                    alt={product.title || "Cart item"}
                />
              </div>

              <p className="cart-sidebar-price">{formatPrice(product.price)}</p>

              <div className="cart-sidebar-controls">
                <button
                  type="button"
                  onClick={() => removeItemFromCart(productId)}
                  disabled={isLoadingCart}
                >
                  🗑
                </button>

                <span>{quantity}</span>

                <button
                  type="button"
                  onClick={() => updateItemQuantity(productId, quantity + 1)}
                  disabled={isLoadingCart}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

export default CartSidebar;