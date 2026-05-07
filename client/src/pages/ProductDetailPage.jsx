import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useShop } from "../context/ShopContext.jsx";
import { getProductColor, getProductVisualLabel } from "../utils/productVisuals.js";

const formatPrice = (price) => `$${Number(price || 0).toFixed(2)}`;
const reviewCountFormatter = new Intl.NumberFormat("en-US");
const getRatingValue = (product) => (4.1 + ((Number(product.id) || 0) % 8) * 0.1).toFixed(1);
const getReviewCount = (product) =>
  reviewCountFormatter.format(
    Math.round(Number(product.price || 0) * 137 + (Number(product.id) || 0) * 53),
  );

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, isLoadingProducts, clearError, addItemToCart } = useShop();

  const product = useMemo(
    () => products.find((currentProduct) => String(currentProduct.id) === String(id)) || null,
    [products, id],
  );

  const handleAddToCart = async () => {
    if (!product) {
      return;
    }

    const result = await addItemToCart(product.id);
    if (result.ok) {
      clearError();
      navigate("/cart");
    }
  };

  if (isLoadingProducts && !product) {
    return (
      <section className="loading-state">
        <div className="spinner-border text-warning" role="status" />
      </section>
    );
  }

  if (!product) {
    return (
      <section className="empty-state">
        <h1 className="h4">Product not found</h1>
        <p className="text-muted">
          The product API routes are the next backend step, so this page depends on
          loaded catalog data for now.
        </p>
        <Link className="amazon-action-button mt-3" to="/">
          Return Home
        </Link>
      </section>
    );
  }

  return (
    <section className="product-detail-page">
      <div className="product-detail-breadcrumbs">
        <Link to="/">Best Sellers</Link>
        <span>/</span>
        <span>{product.category || "General"}</span>
      </div>

      <div className="product-detail-layout">
        <div className="product-detail-gallery">
          {product.image ? (
            <img
              className="product-detail-image"
              src={product.image}
              alt={product.title || "Product"}
            />
          ) : (
            <div
              className="product-detail-image product-color-block"
              style={{ "--product-color": getProductColor(product) }}
              aria-label={product.title || "Product"}
            >
              <span className="product-color-label">
                {getProductVisualLabel(product)}
              </span>
            </div>
          )}
        </div>

        <div className="product-detail-main">
          <p className="product-detail-category">{product.category || "General"}</p>
          <h1 className="product-detail-title">{product.title || "Untitled product"}</h1>
          <div className="product-detail-rating">
            <span className="amazon-stars">★★★★☆</span>
            <span>{getRatingValue(product)}</span>
            <span className="amazon-rating-count">{getReviewCount(product)} ratings</span>
          </div>
          <p className="product-detail-copy">
            {product.description || "No description available."}
          </p>

          <div className="product-detail-highlights">
            <div>
              <span className="product-highlight-label">Brand</span>
              <strong>Eddiezon Essentials</strong>
            </div>
            <div>
              <span className="product-highlight-label">Shipping</span>
              <strong>FREE delivery tomorrow</strong>
            </div>
            <div>
              <span className="product-highlight-label">Returns</span>
              <strong>30-day easy returns</strong>
            </div>
          </div>
        </div>

        <aside className="buy-box">
          <p className="buy-box-price">{formatPrice(product.price)}</p>
          <p className="buy-box-copy">
            FREE delivery on eligible orders. Ships from Eddiezon and sold by
            Eddiezon Marketplace.
          </p>
          <p className="buy-box-stock">In Stock</p>
          <button type="button" className="amazon-action-button" onClick={handleAddToCart}>
            Add to Cart
          </button>
          <Link className="amazon-secondary-link" to="/">
            Continue Shopping
          </Link>
        </aside>
      </div>
    </section>
  );
}

export default ProductDetailPage;
