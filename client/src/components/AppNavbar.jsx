import { useMemo } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext.jsx";

const navLinkClass = ({ isActive }) =>
  `amazon-subnav-link${isActive ? " active" : ""}`;

const normalizeCategory = (categoryValue) => {
  const categoryLabel = String(categoryValue || "").trim();
  return categoryLabel || "Uncategorized";
};

function AppNavbar() {
  const navigate = useNavigate();
  const {
    cart,
    isLoadingProducts,
    loadProducts,
    products,
    searchTerm,
    setAppliedSearchTerm,
    setSearchTerm,
    searchProducts,
  } = useShop();

  const cartCount = cart.items.reduce(
    (runningTotal, item) => runningTotal + Number(item.quantity || 0),
    0,
  );

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

  const handleSearchSubmit = async (event) => {
    event.preventDefault();
    await searchProducts(searchTerm);
    navigate("/");
  };

  const handleCategoryShortcut = async (category) => {
    setSearchTerm("");
    setAppliedSearchTerm("");
    await loadProducts();
    navigate(category === "All" ? "/" : `/?category=${encodeURIComponent(category)}`);
  };

  return (
    <header className="amazon-header">
      <div className="page-width amazon-header-top">
        <Link className="amazon-brand" to="/">
          <span className="amazon-brand-wordmark">eddiezon</span>
          <span className="amazon-brand-submark">prime</span>
        </Link>

        <form className="amazon-search" onSubmit={handleSearchSubmit}>
          <span className="amazon-search-scope">All</span>
          <input
            className="amazon-search-input"
            type="search"
            placeholder="Search Eddiezon"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            aria-label="Search products"
          />
          <button
            className="amazon-search-button"
            type="submit"
            disabled={isLoadingProducts}
          >
            Search
          </button>
        </form>

        <Link className="amazon-cart-link" to="/cart">
          <span className="amazon-cart-count">{cartCount}</span>
          <span className="amazon-cart-text">Cart</span>
        </Link>
      </div>

      <div className="amazon-subnav">
        <div className="page-width amazon-subnav-inner">
          <button
            type="button"
            className="amazon-menu-button"
            onClick={() => handleCategoryShortcut("All")}
          >
            All
          </button>

          <NavLink className={navLinkClass} to="/" end>
            Home
          </NavLink>

          {categoryOptions.map((category) => (
            <button
              key={category}
              type="button"
              className="amazon-subnav-button"
              onClick={() => handleCategoryShortcut(category)}
            >
              {category}
            </button>
          ))}

          <NavLink className={navLinkClass} to="/cart">
            Cart
          </NavLink>
        </div>
      </div>
    </header>
  );
}

export default AppNavbar;
