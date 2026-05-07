import { Link } from "react-router-dom";
import { useShop } from "../context/ShopContext.jsx";
import { getProductColor, getProductVisualLabel } from "../utils/productVisuals.js";

const formatPrice = (value) => `$${Number(value || 0).toFixed(2)}`;

const getItemInfo = (item) => {
  const product = item.product || item;
  const quantity = Number(item.quantity || 0);
  const productId = item.productId ?? product.id;
  const title = product.title || "Untitled product";
  const unitPrice = Number(product.price || item.price || 0);

  return {
    productId,
    title,
    quantity,
    unitPrice,
    lineTotal: unitPrice * quantity,
    image: product.image,
    description: product.description || "No description available.",
  };
};

function CartPage() {
  const { cart, isLoadingCart, error, updateItemQuantity, removeItemFromCart } = useShop();
  const cartItems = Array.isArray(cart.items) ? cart.items : [];

  const handleIncrement = async (productId, currentQuantity) => {
    await updateItemQuantity(productId, currentQuantity + 1);
  };

  const handleDecrement = async (productId, currentQuantity) => {
    if (currentQuantity <= 1) {
      await removeItemFromCart(productId);
      return;
    }

    await updateItemQuantity(productId, currentQuantity - 1);
  };

  const handleRemove = async (productId) => {
    await removeItemFromCart(productId);
  };

  if (isLoadingCart && cartItems.length === 0) {
    return (
      <section className="loading-state">
        <div className="spinner-border text-warning" role="status" />
      </section>
    );
  }

  if (cartItems.length === 0) {
    return (
      <section className="empty-state">
        <h1 className="h3">Your Eddiezon Cart is empty</h1>
        <p className="text-muted">Add an item from the catalog to get started.</p>
        <Link to="/" className="amazon-action-button mt-3">
          Browse Products
        </Link>
      </section>
    );
  }

  return (
    <section className="cart-page">
      <div className="cart-page-main">
        <div className="cart-page-header">
          <h1 className="page-title">Shopping Cart</h1>
          <p className="section-subtitle">Review your items before checkout.</p>
        </div>

        {error ? (
          <div className="alert alert-warning mb-4" role="alert">
            {error}
          </div>
        ) : null}

        <div className="cart-line-items">
          {cartItems.map((item) => {
            const { productId, title, quantity, unitPrice, lineTotal, image, description } =
              getItemInfo(item);

            return (
              <article className="cart-line-item" key={productId}>
                <Link className="cart-line-image" to={`/products/${productId}`}>
                  {image ? (
                    <img src={image} alt={title} />
                  ) : (
                    <div
                      className="product-color-block"
                      style={{ "--product-color": getProductColor({ title, description }) }}
                      aria-label={title}
                    >
                      <span className="product-color-label">
                        {getProductVisualLabel({ title, description })}
                      </span>
                    </div>
                  )}
                </Link>

                <div className="cart-line-copy">
                  <Link className="cart-line-title" to={`/products/${productId}`}>
                    {title}
                  </Link>
                  <p className="cart-line-description">{description}</p>
                  <p className="cart-line-stock">In Stock</p>

                  <div className="cart-line-actions">
                    <div className="quantity-controls">
                      <button
                        type="button"
                        onClick={() => handleDecrement(productId, quantity)}
                        disabled={isLoadingCart}
                        aria-label={quantity <= 1 ? "Remove item" : "Decrease quantity"}
                      >
                        {quantity <= 1 ? "🗑️" : "-"}
                      </button>
                      <span>{quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleIncrement(productId, quantity)}
                        disabled={isLoadingCart}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className="cart-remove-button"
                      onClick={() => handleRemove(productId)}
                      disabled={isLoadingCart}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="cart-line-price">
                  <strong>{formatPrice(unitPrice)}</strong>
                  <span>Line total {formatPrice(lineTotal)}</span>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <aside className="cart-summary-card">
        <h2>Order Summary</h2>
        <div className="cart-summary-row">
          <span>Items subtotal</span>
          <strong>{formatPrice(cart.subtotal)}</strong>
        </div>
        <div className="cart-summary-row">
          <span>Estimated shipping</span>
          <strong>FREE</strong>
        </div>
        <div className="cart-summary-row total">
          <span>Order total</span>
          <strong>{formatPrice(cart.total)}</strong>
        </div>
        <Link to="/checkout" className="amazon-action-button w-100">
          Proceed to checkout
        </Link>
        <Link className="amazon-secondary-link" to="/">
          Continue shopping
        </Link>
      </aside>
    </section>
  );
}

export default CartPage;
