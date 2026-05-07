import { Link } from "react-router-dom";
import { useShop } from "../context/ShopContext.jsx";
import { getProductColor, getProductVisualLabel } from "../utils/productVisuals.js";

const formatPrice = (value) => `$${Number(value || 0).toFixed(2)}`;

function CartSidebar() {
  const { cart, isLoadingCart, updateItemQuantity, removeItemFromCart } = useShop();
  const cartItems = Array.isArray(cart.items) ? cart.items : [];
  const cartCount = cartItems.reduce(
    (runningTotal, item) => runningTotal + Number(item.quantity || 0),
    0,
  );

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <aside className="cart-sidebar">
      <div className="cart-sidebar-card">
        <div className="cart-sidebar-header">
          <p className="cart-sidebar-kicker">Cart summary</p>
          <h2 className="cart-sidebar-title">Subtotal ({cartCount} items)</h2>
          <strong className="cart-sidebar-subtotal">{formatPrice(cart.subtotal)}</strong>
          <Link to="/cart" className="amazon-action-button cart-sidebar-cta">
            Proceed to cart
          </Link>
        </div>

        <div className="cart-sidebar-items">
          {cartItems.map((item) => {
            const product = item.product || item;
            const productId = item.productId ?? product.id;
            const quantity = Number(item.quantity || 0);

            return (
              <article className="cart-sidebar-item" key={productId}>
                <div className="cart-sidebar-image">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.title || "Cart item"}
                    />
                  ) : (
                    <div
                      className="product-color-block"
                      style={{ "--product-color": getProductColor(product) }}
                      aria-label={product.title || "Cart item"}
                    >
                      <span className="product-color-label">
                        {getProductVisualLabel(product)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="cart-sidebar-copy">
                  <Link className="cart-sidebar-name" to={`/products/${productId}`}>
                    {product.title || "Cart item"}
                  </Link>
                  <p className="cart-sidebar-price">{formatPrice(product.price)}</p>
                  <div className="cart-sidebar-stepper">
                    <button
                      type="button"
                      onClick={() =>
                        quantity <= 1
                          ? removeItemFromCart(productId)
                          : updateItemQuantity(productId, quantity - 1)
                      }
                      disabled={isLoadingCart}
                      aria-label={quantity <= 1 ? "Remove item" : "Decrease quantity"}
                    >
                      {quantity <= 1 ? "🗑️" : "-"}
                    </button>
                    <span>{quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateItemQuantity(productId, quantity + 1)}
                      disabled={isLoadingCart}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

export default CartSidebar;
