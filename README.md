# maeClient — Make Audit Easy Frontend

React + Vite client app for the Make Audit Easy compliance marketplace.

## Setup

```bash
npm install
npm run dev        # starts on http://localhost:3000
```

## Project Structure

```
src/
  components/
    Navbar.jsx          # Top navbar with logo, search, phone, icons, sign-in
    Navbar.css
    CategoryBar.jsx     # Teal horizontal category navigation bar
    CategoryBar.css
    HeroSection.jsx     # Hero: sidebar frameworks list + hero content + promo slider cards
    HeroSection.css
    PromoBannerSlider.jsx  # Wide promo banner below hero (SOC 2 etc.)
    PromoBannerSlider.css
    ProductCard.jsx     # Reusable product card with skeleton loading
    ProductCard.css
    FeaturedProducts.jsx   # Featured products grid section
    SpecialBanner.jsx   # GEN Next VAPT special pricing strip
    SpecialBanner.css
    BestDeals.jsx       # Best Deal Offer grid section
    TrustSection.jsx    # Trusted by 500+ corporations section
    TrustSection.css
    NewsletterSection.jsx  # Stay Regulatory Ready newsletter signup
    NewsletterSection.css
    Footer.jsx          # Full footer with columns, payments, social
    Footer.css
    ProductSection.css  # Shared CSS for Featured + BestDeals sections
  pages/
    HomePage.jsx        # Composes all home sections
    PlaceholderPage.jsx # Static stub for all other pages
    PlaceholderPage.css
  hooks/
    useSiteSettings.js  # Fetches /api/site-settings
  services/
    api.js              # Axios instance + API calls
  App.jsx               # Router + Layout wrapper
  main.jsx
  index.css             # Global CSS variables + resets
```

## API Integration

All data comes from your backend:

| Endpoint | Usage |
|---|---|
| `GET /api/site-settings` | Full site config (header, hero, promos, banners, footer, etc.) |
| `GET /api/products?featured=true&limit=5` | Featured products grid |
| `GET /api/products?bestDeal=true&limit=5` | Best deal products grid |

The Vite dev server proxies `/api` and `/uploads` to `http://localhost:5000`.  
To change the backend URL, edit `vite.config.js`.

## Notes

- **Skeleton loading**: Product grids show animated skeletons while API loads.
- **Default fallbacks**: All sections display sensible defaults if the API returns empty data.
- **Other pages**: All routes except `/` render a static placeholder page.
