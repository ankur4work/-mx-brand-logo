export function getCurrentShop() {
  const search = new URLSearchParams(window.location.search);
  const shop = search.get("shop") || window.__SHOPIFY_DEV_SHOP;

  if (shop) {
    window.__SHOPIFY_DEV_SHOP = shop;
  }

  return shop || "";
}

export function getCurrentHost() {
  const search = new URLSearchParams(window.location.search);
  const host = search.get("host") || window.__SHOPIFY_DEV_HOST;

  if (host) {
    window.__SHOPIFY_DEV_HOST = host;
  }

  return host || "";
}

export function withShopQuery(path) {
  const shop = getCurrentShop();
  const host = getCurrentHost();
  if (!shop && !host) return path;

  const params = new URLSearchParams();
  if (shop) params.set("shop", shop);
  if (host) params.set("host", host);

  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}${params.toString()}`;
}
