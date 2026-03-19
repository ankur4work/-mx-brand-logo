// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";

import shopify from "./shopify.js";
import GDPRWebhookHandlers from "./gdpr.js";

import dotenv from "dotenv";
dotenv.config();

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT || "3000", 10);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const APP_NAME = "LogoFlow Marquee";
const PRO_PLAN_NAME = "Pro";
const BILLING_MODE = "managed";
const SHOPIFY_APP_HANDLE = process.env.SHOPIFY_APP_HANDLE || "";
const SHOPIFY_REQUIRE_ACTIVE_PLAN =
  process.env.SHOPIFY_REQUIRE_ACTIVE_PLAN !== "false";

const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  INTERNAL_SERVER_ERROR: 500,
};

const app = express();
app.set("trust proxy", 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get(shopify.config.auth.path, shopify.auth.begin());

app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);

app.get("/auth/start", async (req, res) => {
  const shop = String(
    req.query.shop || req.headers["x-shopify-shop-domain"] || ""
  );

  if (!shop) {
    return handleError(
      res,
      HTTP_STATUS.BAD_REQUEST,
      "Missing shop for auth redirect"
    );
  }

  const redirectUri =
    req.query.redirectUri ||
    `https://${req.get("host")}${shopify.config.auth.path}?shop=${encodeURIComponent(
      shop
    )}`;

  if (isEmbeddedRequest(req)) {
    return res.redirect(
      buildExitIframeRedirect(req, shop, String(redirectUri))
    );
  }

  return res.redirect(String(redirectUri));
});

app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers })
);

function getSession(res) {
  return res.locals?.shopify?.session || null;
}

function getOfflineSessionId(shop) {
  if (!shop) return "";

  if (shopify.api?.session?.getOfflineId) {
    return shopify.api.session.getOfflineId(String(shop));
  }

  return `offline_${String(shop)}`;
}

async function loadStoredSessionForShop(shop) {
  if (!shop) return null;

  const offlineSessionId = getOfflineSessionId(shop);
  if (offlineSessionId && shopify.config.sessionStorage.loadSession) {
    const offlineSession = await shopify.config.sessionStorage.loadSession(
      offlineSessionId
    );
    if (offlineSession) {
      return offlineSession;
    }
  }

  const sessions = await shopify.config.sessionStorage.findSessionsByShop(shop);
  if (!sessions.length) return null;

  return sessions.find((session) => !session.isOnline) || sessions[0];
}

function getStoreHandleFromReferrer(req) {
  const referrer = req.get("referer");
  if (!referrer) {
    return "";
  }

  try {
    const url = new URL(referrer);
    const match = url.pathname.match(/\/store\/([^/]+)\//i);
    return match?.[1] || "";
  } catch (_error) {
    return "";
  }
}

function getShopFromReferrer(req) {
  const storeHandle = getStoreHandleFromReferrer(req);
  if (!storeHandle) {
    return "";
  }

  return shopify.api.utils.sanitizeShop(`${storeHandle}.myshopify.com`) || "";
}

async function getShopFromRequest(req) {
  const queryShop = shopify.api.utils.sanitizeShop(
    String(req.query.shop || req.headers["x-shopify-shop-domain"] || "")
  );

  if (queryShop) {
    return queryShop;
  }

  const bearerToken = req.headers.authorization?.match(/Bearer (.*)/)?.[1];
  if (!bearerToken) {
    return getShopFromReferrer(req);
  }

  try {
    const payload = await shopify.api.session.decodeSessionToken(bearerToken);
    return (
      shopify.api.utils.sanitizeShop(
        String(payload.dest || "").replace(/^https:\/\//i, "")
      ) || ""
    );
  } catch (_error) {
    return getShopFromReferrer(req);
  }
}

async function attachOfflineSession(req, res, next) {
  const existingSession = getSession(res);
  if (existingSession) {
    return next();
  }

  const shop = await getShopFromRequest(req);
  if (!shop) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).send({
      error: "Missing or invalid shop for this request",
    });
  }

  const session = await loadStoredSessionForShop(shop);
  if (!session) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).send({
      error: "No stored session found for this shop",
    });
  }

  res.locals.shopify = {
    ...(res.locals.shopify || {}),
    session,
  };

  return next();
}

app.use("/api/*", attachOfflineSession);

async function getSessionForRequest(req, res) {
  const validatedSession = getSession(res);
  if (validatedSession) {
    return validatedSession;
  }

  const shop =
    validatedSession?.shop ||
    req.query.shop ||
    req.headers["x-shopify-shop-domain"] ||
    getShopFromReferrer(req);

  const offlineSession = await loadStoredSessionForShop(String(shop || ""));
  if (offlineSession) return offlineSession;

  return validatedSession || null;
}

function createGraphQLClient(session) {
  return new shopify.api.clients.Graphql({ session });
}

function formatErrorMessage(error) {
  if (error?.errorData?.length) {
    return error.errorData
      .map((item) => item?.message || JSON.stringify(item))
      .join(" | ");
  }

  if (error?.response?.body?.errors) {
    const responseErrors = error.response.body.errors;
    if (Array.isArray(responseErrors)) {
      return responseErrors
        .map((item) => item?.message || JSON.stringify(item))
        .join(" | ");
    }
  }

  return error?.message || "Unexpected server error";
}

function handleError(res, code, message) {
  console.error(message);
  res.status(code).send({ error: message });
}

function getStoreHandle(shop) {
  return String(shop || "").replace(/\.myshopify\.com$/i, "");
}

function getManagedPricingUrl(shop) {
  if (!SHOPIFY_APP_HANDLE) {
    throw new Error("Missing SHOPIFY_APP_HANDLE");
  }
  if (!shop) {
    throw new Error("Missing shop");
  }

  const storeHandle = getStoreHandle(shop);
  if (!storeHandle) {
    throw new Error("Missing store handle");
  }

  return `https://admin.shopify.com/store/${storeHandle}/charges/${SHOPIFY_APP_HANDLE}/pricing_plans`;
}

function getEmbeddedAppAdminUrl(req, shop) {
  const storeHandle = getStoreHandle(shop) || getStoreHandleFromReferrer(req);
  if (!storeHandle || !SHOPIFY_APP_HANDLE) {
    return "";
  }

  return `https://admin.shopify.com/store/${storeHandle}/apps/${SHOPIFY_APP_HANDLE}`;
}

function buildBillingRequiredPath(req) {
  const query = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
  return `/billing-required${query}`;
}

function buildExitIframeRedirect(req, shop, redirectUri) {
  const queryParams = new URLSearchParams({
    ...req.query,
    shop: String(shop || ""),
    redirectUri,
  }).toString();

  return `${shopify.config.exitIframePath}?${queryParams}`;
}

function isEmbeddedRequest(req) {
  return req.query.embedded === "1" || Boolean(req.query.host);
}

const BillingManager = {
  async getSubscriptionStatus(session) {
    const client = createGraphQLClient(session);
    const response = await client.request(GET_ACTIVE_SUBSCRIPTIONS);
    const subscriptions =
      response?.currentAppInstallation?.activeSubscriptions ||
      response?.data?.currentAppInstallation?.activeSubscriptions ||
      [];
    const activeSubscription =
      subscriptions.find((subscription) => {
        const status = String(subscription?.status || "").toUpperCase();
        return !status || status === "ACTIVE" || status === "ACCEPTED";
      }) ||
      subscriptions[0] ||
      null;

    console.log(
      "[billing-status]",
      JSON.stringify({
        shop: session.shop,
        subscriptions: subscriptions.map((subscription) => ({
          id: subscription?.id,
          name: subscription?.name,
          status: subscription?.status,
          test: subscription?.test,
        })),
        activePlanName: activeSubscription?.name || null,
        hasActiveSubscription: Boolean(activeSubscription),
      })
    );

    return {
      tier: activeSubscription ? "premium" : "free",
      activePlanName: activeSubscription?.name || null,
      hasActiveSubscription: Boolean(activeSubscription),
    };
  },
};

async function requireActivePlan(req, res, next) {
  if (!SHOPIFY_REQUIRE_ACTIVE_PLAN) {
    return next();
  }

  try {
    const session = await getSessionForRequest(req, res);
    if (!session) {
      return next();
    }

    const subscription = await BillingManager.getSubscriptionStatus(session);
    res.locals.activeSubscription = subscription;

    if (subscription.hasActiveSubscription) {
      return next();
    }

    const confirmationUrl = getManagedPricingUrl(session.shop);

    if (req.path.startsWith("/api/")) {
      return res.status(HTTP_STATUS.PAYMENT_REQUIRED).send({
        billingRequired: true,
        billingMode: BILLING_MODE,
        confirmationUrl,
        billingRequiredPath: buildBillingRequiredPath(req),
      });
    }

    if (req.query.embedded === "1" || req.query.host) {
      return shopify.redirectOutOfApp({
        req,
        res,
        redirectUri: confirmationUrl,
        shop: session.shop,
      });
    }

    return res.redirect(confirmationUrl);
  } catch (error) {
    return handleError(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      formatErrorMessage(error)
    );
  }
}

const PlanService = {
  async getPlanTier(session) {
    const subscription = await BillingManager.getSubscriptionStatus(session);
    return subscription.tier;
  },

  getOrderLimit(planTier) {
    switch (planTier) {
      case "premium":
        return 1000;
      default:
        return 0;
    }
  },
};

async function storeShopDetails(shopDetails) {
  try {
    await fetch("", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(shopDetails),
    });
  } catch (error) {
    console.error("Analytics store error:", error);
  }
}

app.get("/api/hasActiveSubscription", async (req, res) => {
  try {
    const session = await getSessionForRequest(req, res);
    if (!session) {
      return handleError(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        "Unable to resolve an app session for this shop"
      );
    }

    const subscription = await BillingManager.getSubscriptionStatus(session);

    res.status(HTTP_STATUS.OK).send({
      hasActiveSubscription: subscription.hasActiveSubscription,
      tier: subscription.tier,
      billingMode: BILLING_MODE,
      activePlanName: subscription.activePlanName,
    });
  } catch (error) {
    handleError(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      formatErrorMessage(error)
    );
  }
});

app.get("/api/billing-required", async (req, res) => {
  try {
    const session = await getSessionForRequest(req, res);
    if (!session) {
      return handleError(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        "Unable to resolve an app session for this shop"
      );
    }

    res.status(HTTP_STATUS.OK).send({
      billingRequired: true,
      billingMode: BILLING_MODE,
      shop: session.shop,
      storeHandle: getStoreHandle(session.shop),
      appHandle: SHOPIFY_APP_HANDLE,
      pricingUrl: getManagedPricingUrl(session.shop),
    });
  } catch (error) {
    handleError(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      formatErrorMessage(error)
    );
  }
});

app.get("/billing/start", async (req, res) => {
  try {
    const session = await getSessionForRequest(req, res);
    if (!session) {
      return handleError(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        "Unable to resolve an app session for this shop"
      );
    }

    const redirectUri = getManagedPricingUrl(session.shop);

    if (isEmbeddedRequest(req)) {
      return res.redirect(
        buildExitIframeRedirect(req, session.shop, redirectUri)
      );
    }

    return res.redirect(redirectUri);
  } catch (error) {
    handleError(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      formatErrorMessage(error)
    );
  }
});

app.get("/welcome", async (req, res) => {
  const shop =
    String(req.query.shop || "") ||
    `${getStoreHandleFromReferrer(req)}.myshopify.com`;
  const embeddedAppUrl = getEmbeddedAppAdminUrl(req, shop);

  if (embeddedAppUrl) {
    return res.redirect(embeddedAppUrl);
  }

  return res.redirect("/");
});

app.get("/api/createSubscription", async (req, res) => {
  try {
    const session = await getSessionForRequest(req, res);
    if (!session) {
      return handleError(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        "Unable to resolve an app session for this shop"
      );
    }

    const subscription = await BillingManager.getSubscriptionStatus(session);
    if (subscription.hasActiveSubscription) {
      return res.status(HTTP_STATUS.OK).send({
        isActiveSubscription: true,
        billingMode: BILLING_MODE,
        activePlanName: subscription.activePlanName || PRO_PLAN_NAME,
        tier: "premium",
      });
    }

    res.status(HTTP_STATUS.OK).send({
      confirmationUrl: getManagedPricingUrl(session.shop),
      billingMode: BILLING_MODE,
      activePlanName: PRO_PLAN_NAME,
    });
  } catch (error) {
    handleError(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      formatErrorMessage(error)
    );
  }
});

app.get("/api/cancelSubscription", async (_req, res) => {
  res.status(HTTP_STATUS.BAD_REQUEST).send({
    error:
      "This app uses a single managed plan. Billing changes are managed in Shopify admin.",
  });
});

app.get("/api/scroll-to-top/hasSubscription", async (req, res) => {
  try {
    const session = await getSessionForRequest(req, res);

    if (!session) {
      return handleError(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        "Unable to resolve an app session for this shop"
      );
    }

    const subscription = await BillingManager.getSubscriptionStatus(session);

    res.status(HTTP_STATUS.OK).send({
      hasActiveSubscription: subscription.hasActiveSubscription,
      tier: subscription.tier,
      billingMode: BILLING_MODE,
      activePlanName: subscription.activePlanName,
    });
  } catch (error) {
    handleError(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      formatErrorMessage(error)
    );
  }
});

app.use(
  ["/api/store-details", "/api/getshop", "/api/scroll-to-top/plan-info"],
  requireActivePlan
);

app.get("/api/scroll-to-top/plan-info", async (req, res) => {
  try {
    const session = await getSessionForRequest(req, res);
    if (!session) {
      return handleError(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        "Unable to resolve an app session for this shop"
      );
    }

    const tier = await PlanService.getPlanTier(session);
    const limit = PlanService.getOrderLimit(tier);

    res.json({
      planTier: tier,
      orderLimit: limit,
      remaining: limit,
      canImportMore: tier === "premium",
    });
  } catch (error) {
    handleError(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      formatErrorMessage(error)
    );
  }
});

const shopDetailsQuery = `
{
  shop {
    name
    email
    primaryDomain { url host }
    plan { displayName }
  }
}
`;

app.get("/api/store-details", async (req, res) => {
  try {
    const session = await getSessionForRequest(req, res);
    if (!session) {
      return handleError(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        "Unable to resolve an app session for this shop"
      );
    }

    const client = createGraphQLClient(session);
    const response = await client.request(shopDetailsQuery);
    const shop = response?.shop ?? response?.data?.shop ?? {};

    await storeShopDetails({
      appName: APP_NAME,
      storeUrl: shop?.primaryDomain?.url,
      name: shop?.name,
      email: shop?.email,
      plan: shop?.plan?.displayName,
    });

    res.status(HTTP_STATUS.OK).send({
      message: "Shop details fetched successfully",
      data: shop,
    });
  } catch (error) {
    handleError(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      formatErrorMessage(error)
    );
  }
});

app.get("/api/getshop", async (req, res) => {
  try {
    const session = await getSessionForRequest(req, res);
    if (!session) {
      return handleError(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        "Unable to resolve an app session for this shop"
      );
    }

    res.json({ shop: session.shop });
  } catch (error) {
    handleError(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      formatErrorMessage(error)
    );
  }
});

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

const serveFrontend = async (_req, res) => {
  const html = readFileSync(join(STATIC_PATH, "index.html"), "utf8").replace(
    "%%SHOPIFY_API_KEY%%",
    process.env.SHOPIFY_API_KEY || ""
  );

  res
    .status(HTTP_STATUS.OK)
    .set("Content-Type", "text/html")
    .send(html);
};

app.use("/*", serveFrontend);

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

const GET_ACTIVE_SUBSCRIPTIONS = `
query GetActiveSubscriptions {
  currentAppInstallation {
    activeSubscriptions {
      id
      name
      status
      test
    }
  }
}
`;
