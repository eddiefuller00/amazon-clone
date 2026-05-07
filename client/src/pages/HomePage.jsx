import { useEffect, useMemo, useRef } from "react";
import Carousel from "bootstrap/js/dist/carousel";
import { Link, useSearchParams } from "react-router-dom";
import { useShop } from "../context/ShopContext.jsx";
import { getProductColor, getProductVisualLabel } from "../utils/productVisuals.js";

const formatPrice = (price) => `$${Number(price || 0).toFixed(2)}`;
const ALL_CATEGORIES_KEY = "__all__";
const reviewCountFormatter = new Intl.NumberFormat("en-US");

const normalizeCategory = (categoryValue) => {
  const categoryLabel = String(categoryValue || "").trim();
  return categoryLabel || "Uncategorized";
};

const getRatingValue = (product) => (4.1 + ((Number(product.id) || 0) % 8) * 0.1).toFixed(1);

const getReviewCount = (product) =>
  reviewCountFormatter.format(
    Math.round(Number(product.price || 0) * 137 + (Number(product.id) || 0) * 53),
  );

function HomePage() {
  const {
    products,
    isLoadingProducts,
    error,
    clearError,
    addItemToCart,
    appliedSearchTerm,
  } = useShop();
  const [searchParams, setSearchParams] = useSearchParams();
  const carouselRef = useRef(null);

  const categoryOptions = useMemo(() => {
    const categoryMap = new Map();

    products.forEach((product) => {
      const categoryLabel = normalizeCategory(product.category);
      const categoryKey = categoryLabel.toLowerCase();

      if (!categoryMap.has(categoryKey)) {
        categoryMap.set(categoryKey, categoryLabel);
      }
    });

    return [...categoryMap.values()].sort((left, right) => left.localeCompare(right));
  }, [products]);

  const activeCategory =
    (searchParams.get("category") || ALL_CATEGORIES_KEY) === ALL_CATEGORIES_KEY ||
    categoryOptions.includes(searchParams.get("category") || ALL_CATEGORIES_KEY)
      ? searchParams.get("category") || ALL_CATEGORIES_KEY
      : ALL_CATEGORIES_KEY;

  const visibleProducts = useMemo(() => {
    if (activeCategory === ALL_CATEGORIES_KEY) {
      return products;
    }

    return products.filter(
      (product) => normalizeCategory(product.category) === activeCategory,
    );
  }, [activeCategory, products]);

  const categorySections = useMemo(() => {
    if (activeCategory !== ALL_CATEGORIES_KEY) {
      return [
        {
          category: activeCategory,
          products: visibleProducts,
        },
      ];
    }

    return categoryOptions
      .map((category) => ({
        category,
        products: products
          .filter((product) => normalizeCategory(product.category) === category)
          .slice(0, 4),
      }))
      .filter((section) => section.products.length > 0);
  }, [activeCategory, categoryOptions, products, visibleProducts]);

  const carouselSlides = useMemo(
    () =>
      categoryOptions
        .map((category) => {
          const categoryProducts = products.filter(
            (product) => normalizeCategory(product.category) === category,
          );
          const featuredProduct = categoryProducts[0];

          if (!featuredProduct) {
            return null;
          }

          return {
            category,
            product: featuredProduct,
          };
        })
        .filter(Boolean),
    [categoryOptions, products],
  );

  const showFeaturedCarousel =
    activeCategory === ALL_CATEGORIES_KEY &&
    !appliedSearchTerm.trim() &&
    carouselSlides.length > 1;

  const handleAddToCart = async (productId) => {
    const result = await addItemToCart(productId);
    if (result.ok) {
      clearError();
    }
  };

  const handleCategoryPageChange = (category) => {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);
      if (category === ALL_CATEGORIES_KEY) {
        nextParams.delete("category");
      } else {
        nextParams.set("category", category);
      }
      return nextParams;
    });
  };

  useEffect(() => {
    if (!showFeaturedCarousel || !carouselRef.current) {
      return undefined;
    }

    const carousel = new Carousel(carouselRef.current, {
      interval: 3500,
      ride: "carousel",
      pause: false,
      touch: true,
      wrap: true,
    });

    return () => {
      carousel.dispose();
    };
  }, [showFeaturedCarousel]);

  if (isLoadingProducts) {
    return (
      <section className="loading-state">
        <div className="spinner-border text-warning" role="status" />
      </section>
    );
  }

  return (
    <section className="storefront-page">
      <div className="storefront-tabs">
        <button type="button" className="active">Best Sellers</button>
      </div>

      {showFeaturedCarousel ? (
        <div
          id="bestSellerCarousel"
          ref={carouselRef}
          className="carousel slide storefront-carousel"
          data-bs-ride="carousel"
        >
          <div className="carousel-indicators storefront-carousel-indicators">
            {carouselSlides.map((slide, index) => (
              <button
                key={slide.category}
                type="button"
                data-bs-target="#bestSellerCarousel"
                data-bs-slide-to={index}
                className={index === 0 ? "active" : ""}
                aria-current={index === 0 ? "true" : undefined}
                aria-label={`Featured ${slide.category}`}
              />
            ))}
          </div>

          <div className="carousel-inner">
            {carouselSlides.map((slide, index) => {
              const { product, category } = slide;

              return (
                <div
                  className={`carousel-item${index === 0 ? " active" : ""}`}
                  key={product.id}
                >
                  <div className="storefront-carousel-panel">
                    <div className="storefront-carousel-copy">
                      <p className="storefront-carousel-kicker">{category}</p>
                      <h2>{product.title || "Featured product"}</h2>
                      <p>{product.description || "No description available."}</p>
                      <div className="storefront-carousel-meta">
                        <span className="price-text">{formatPrice(product.price)}</span>
                        <span className="storefront-carousel-rating">
                          <span className="amazon-stars">★★★★☆</span>
                          {getRatingValue(product)}
                        </span>
                      </div>
                      <div className="storefront-carousel-actions">
                        <Link
                          className="amazon-action-button"
                          to={`/products/${product.id}`}
                        >
                          View Item
                        </Link>
                        <button
                          type="button"
                          className="storefront-carousel-link"
                          onClick={() => handleCategoryPageChange(category)}
                        >
                          Shop {category}
                        </button>
                      </div>
                    </div>

                    <Link
                      className="storefront-carousel-media"
                      to={`/products/${product.id}`}
                    >
                      {product.image ? (
                        <img
                          className="storefront-carousel-image"
                          src={product.image}
                          alt={product.title || "Featured product"}
                        />
                      ) : (
                        <div
                          className="product-color-block storefront-carousel-fallback"
                          style={{ "--product-color": getProductColor(product) }}
                          aria-label={product.title || "Featured product"}
                        >
                          <span className="product-color-label">
                            {getProductVisualLabel(product)}
                          </span>
                        </div>
                      )}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            className="carousel-control-prev storefront-carousel-control"
            type="button"
            data-bs-target="#bestSellerCarousel"
            data-bs-slide="prev"
          >
            <span className="carousel-control-prev-icon" aria-hidden="true" />
            <span className="visually-hidden">Previous</span>
          </button>
          <button
            className="carousel-control-next storefront-carousel-control"
            type="button"
            data-bs-target="#bestSellerCarousel"
            data-bs-slide="next"
          >
            <span className="carousel-control-next-icon" aria-hidden="true" />
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      ) : null}

      <div className="storefront-intro">
        <h1 className="page-title">
          {activeCategory !== ALL_CATEGORIES_KEY
            ? activeCategory
            : appliedSearchTerm.trim()
            ? `Results for "${appliedSearchTerm}"`
            : "Amazon Best Sellers"}
        </h1>
      </div>

      {error ? (
        <div className="alert alert-warning mb-4" role="alert">
          {error}
        </div>
      ) : null}

      {!isLoadingProducts && visibleProducts.length === 0 ? (
        <div className="empty-state">
          {products.length === 0 ? (
            <>
              <h2 className="h4">No products loaded yet</h2>
              <p className="text-muted mb-0">
                Seed products and implement product API routes to populate this page.
              </p>
            </>
          ) : (
            <>
              <h2 className="h4">No products in this department</h2>
              <p className="text-muted mb-0">
                Try another department or clear your current search.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="storefront-layout">
          <div className="storefront-sections">
            {categorySections.map((section) => (
              <section className="bestseller-section" key={section.category}>
                <div className="bestseller-section-header">
                  <h2>Best Sellers in {section.category}</h2>
                </div>

                <div className="bestseller-grid">
                  {section.products.map((product, index) => (
                    <article className="amazon-product-card" key={product.id}>
                      <div className="rank-badge">#{index + 1}</div>

                      <Link className="amazon-product-media" to={`/products/${product.id}`}>
                        {product.image ? (
                          <img
                            className="product-image"
                            src={product.image}
                            alt={product.title || "Product"}
                          />
                        ) : (
                          <div
                            className="product-color-block"
                            style={{ "--product-color": getProductColor(product) }}
                            aria-label={product.title || "Product"}
                          >
                            <span className="product-color-label">
                              {getProductVisualLabel(product)}
                            </span>
                          </div>
                        )}
                      </Link>

                      <div className="amazon-product-meta">
                        <Link className="product-title-link" to={`/products/${product.id}`}>
                          {product.title || "Untitled product"}
                        </Link>
                        <p className="amazon-product-description">
                          {product.description || "No description available."}
                        </p>
                        <div className="amazon-product-rating">
                          <span className="amazon-stars">★★★★☆</span>
                          <span>{getRatingValue(product)}</span>
                          <span className="amazon-rating-count">
                            {getReviewCount(product)}
                          </span>
                        </div>
                        <div className="amazon-product-buy">
                          <span className="price-text">{formatPrice(product.price)}</span>
                          <button
                            type="button"
                            className="amazon-action-button"
                            onClick={() => handleAddToCart(product.id)}
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default HomePage;
