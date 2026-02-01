# Acrylic Designer Pro - Technical SEO Checklist

## 1. Indexing & Crawlability (Completed)
- [x] **Robots.txt**: Updated to allow crawling of main content while blocking `/admin` and `/api`.
  - File: `src/robots.txt`
- [x] **Sitemap.xml**: Created with correct priorities and frequencies.
  - File: `src/sitemap.xml`
- [x] **Canonical Tags**: Added `<link rel="canonical">` to `index.html` and dynamic server routes.
- [x] **Server-Side Rendering (SSR Lite)**: Implemented in `server/server.js` to inject dynamic Meta Tags for routes like `/box/10x10x5`.

## 2. On-Page SEO (Completed)
- [x] **Title & Description**: Optimized in `index.html` for "Laser Cutting SVG Generator".
- [x] **Social Meta Tags**: Added Open Graph (Facebook) and Twitter Cards.
- [x] **Schema.org**: Added `SoftwareApplication` JSON-LD structured data.
- [x] **Mobile Viewport**: Optimized for all devices.

## 3. Programmatic SEO (Implemented)
- [x] **Dynamic Routes**: Server now supports `/box/:w-x:h-x:d` and `/shape/:name`.
- [x] **Client Hydration**: `app.js` now reads the URL and loads the specific design automatically.
- [x] **Dynamic Meta Tags**: Server injects specific titles (e.g., "Box 10x10x5 Plan") before serving HTML.

## 4. Next Steps (For You)
1. **Google Search Console**:
   - Verify ownership using the HTML file method or DNS.
   - Submit your sitemap: `https://acrylicgen-app.com/sitemap.xml`.
   - Use "URL Inspection" on `https://acrylicgen-app.com/` to request indexing.

2. **Content Strategy**:
   - Start creating backlinks to your site.
   - Share generated designs (e.g., `/box/20x20x10`) on forums/social media.

3. **Performance**:
   - Run Google PageSpeed Insights.
   - Ensure images/assets are optimized (currently using lightweight SVG).

## 5. Next.js Migration (Future)
If you decide to move to Next.js for full SSG:
- Use `app/sitemap.ts` for dynamic sitemaps.
- Use `generateStaticParams` for pre-rendering thousands of box pages.
- Use `Metadata` API for dynamic headers.
