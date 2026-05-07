import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext.jsx";

const formatPrice = (value) => `$${Number(value || 0).toFixed(2)}`;

function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, isLoadingCart, clearCartItems } = useShop();
  const cartItems = Array.isArray(cart.items) ? cart.items : [];
  const [formState, setFormState] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [formError, setFormError] = useState("");

  const itemCount = cartItems.reduce(
    (runningTotal, item) => runningTotal + Number(item.quantity || 0),
    0,
  );

  const orderItems = cartItems.map((item) => {
    const product = item.product || item;
    const quantity = Number(item.quantity || 0);
    const unitPrice = Number(product.price || item.price || 0);

    return {
      id: item.productId ?? product.id,
      title: product.title || "Untitled product",
      quantity,
      total: unitPrice * quantity,
    };
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((currentState) => ({ ...currentState, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !formState.cardName.trim() ||
      !formState.cardNumber.trim() ||
      !formState.expiry.trim() ||
      !formState.cvv.trim()
    ) {
      setFormError("Fill out the fake payment fields before confirming the order.");
      return;
    }

    setFormError("");
    const result = await clearCartItems();
    if (!result.ok) {
      setFormError("Unable to confirm the fake order right now.");
      return;
    }

    setOrderNumber(`EDZ-${Math.floor(100000 + Math.random() * 900000)}`);
    setHasSubmitted(true);
  };

  if (cartItems.length === 0 && !hasSubmitted) {
    return (
      <section className="empty-state">
        <h1 className="h3">Your cart is empty</h1>
        <p className="text-muted">Add items before heading to checkout.</p>
        <Link to="/cart" className="amazon-action-button mt-3">
          Return to cart
        </Link>
      </section>
    );
  }

  if (hasSubmitted) {
    return (
      <section className="checkout-page">
        <div className="checkout-success">
          <p className="checkout-success-kicker">Order confirmed</p>
          <h1 className="page-title">Thanks for your fake purchase.</h1>
          <p className="checkout-success-copy">
            Confirmation number: <strong>{orderNumber}</strong>
          </p>
          <p className="checkout-success-copy">
            Your pretend payment was approved and the cart has been cleared.
          </p>
          <div className="checkout-success-actions">
            <button
              type="button"
              className="amazon-action-button"
              onClick={() => navigate("/")}
            >
              Continue shopping
            </button>
            <Link className="amazon-secondary-link" to="/cart">
              View cart
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="checkout-page">
      <div className="checkout-layout">
        <form className="checkout-form-card" onSubmit={handleSubmit}>
          <h1 className="page-title">Checkout</h1>
          <p className="checkout-copy">Enter fake payment details to place the order.</p>

          {formError ? (
            <div className="alert alert-warning mb-0" role="alert">
              {formError}
            </div>
          ) : null}

          <label className="checkout-field">
            <span>Name</span>
            <input
              name="cardName"
              type="text"
              value={formState.cardName}
              onChange={handleChange}
              placeholder="Eddie Shopper"
            />
          </label>

          <label className="checkout-field">
            <span>Card number</span>
            <input
              name="cardNumber"
              type="text"
              inputMode="numeric"
              value={formState.cardNumber}
              onChange={handleChange}
              placeholder="4242 4242 4242 4242"
            />
          </label>

          <div className="checkout-field-row">
            <label className="checkout-field">
              <span>Expiry</span>
              <input
                name="expiry"
                type="text"
                value={formState.expiry}
                onChange={handleChange}
                placeholder="12/34"
              />
            </label>

            <label className="checkout-field">
              <span>CVV</span>
              <input
                name="cvv"
                type="text"
                inputMode="numeric"
                value={formState.cvv}
                onChange={handleChange}
                placeholder="123"
              />
            </label>
          </div>

          <button
            type="submit"
            className="amazon-action-button checkout-submit"
            disabled={isLoadingCart}
          >
            Confirm order
          </button>
        </form>

        <aside className="checkout-summary-card">
          <h2>Order Summary</h2>
          <div className="checkout-summary-row">
            <span>Items subtotal ({itemCount})</span>
            <strong>{formatPrice(cart.subtotal)}</strong>
          </div>
          <div className="checkout-summary-row">
            <span>Estimated shipping</span>
            <strong>FREE</strong>
          </div>
          <div className="checkout-summary-row total">
            <span>Order total</span>
            <strong>{formatPrice(cart.total)}</strong>
          </div>

          <div className="checkout-order-items">
            {orderItems.map((item) => (
              <div className="checkout-order-item" key={item.id}>
                <span>
                  {item.title} x {item.quantity}
                </span>
                <strong>{formatPrice(item.total)}</strong>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

export default CheckoutPage;
