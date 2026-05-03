import dotenv from "dotenv";
dotenv.config();

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { HTTPException } from "hono/http-exception";
import authRouter from "./routes/auth";
import storesRouter from "./routes/stores";
import productsRouter from "./routes/products";
import ordersRouter from "./routes/orders";
import storefrontCartRouter from "./routes/storefront-cart";
import storefrontCheckoutRouter from "./routes/storefront-checkout";
import reviewsRouter from "./routes/reviews";
import categoryRoutes from "./routes/category.routes";
import planRouter from "./routes/plans";
import adminRouter from "./routes/admin";
import paymentsRouter from "./routes/payments";
import inventoryRouter from "./routes/inventory";
import webhooksRouter from "./routes/webhooks";
import swaggerRouter from "./routes/swagger";
import cmsRouter from "./routes/cms";
import staffRouter from "./routes/staff";
import assetsRouter from "./routes/assets";
import themesRouter from "./routes/themes";
import domainsRouter from "./routes/domains";
import { resolveTenant } from "./middlewares/tenant";

const app = new Hono();

app.use("*", logger());

app.use(
  "*",
  cors({
    origin: (origin) => {
      const allowedOrigins = [
        "http://localhost:3001",
        "http://localhost:3000",
        "https://localhost:3001",
      ];
      
      if (!origin) return null;
      if (allowedOrigins.includes(origin)) return origin;
      if (origin.startsWith("http://localhost:") || origin.startsWith("https://localhost:")) {
        return origin;
      }
      
      return null;
    },
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length", "X-Request-Id"],
    maxAge: 86400,
  })
);

app.use("*", prettyJSON());

const PUBLIC_ROUTES = [
  { method: "GET", path: "/" },
  { method: "GET", path: "/health" },
  { method: "POST", path: "/api/v1/auth/login" },
  { method: "POST", path: "/api/v1/auth/register" },
  { method: "GET", path: "/api/v1/products" },
  { method: "GET", path: "/api/v1/stores" },
  { method: "GET", path: "/api/v1/categories" },
  { method: "GET", path: "/api/v1/plans" },
  { method: "GET", path: "/swagger/ui" },
  { method: "GET", path: "/swagger/doc" },
];

const PUBLIC_PREFIXES = [
  { method: "GET", path: "/api/v1/products/" },
  { method: "GET", path: "/api/v1/stores/" },
  { method: "GET", path: "/api/v1/categories/" },
  { method: "GET", path: "/api/v1/reviews/product/" },
  { method: "GET", path: "/api/v1/plans/" },
  // Payment webhooks: provider-signed, must bypass our JWT auth.
  { method: "POST", path: "/api/v1/payments/webhooks/" },
  // Storefront cart + checkout: own customer-token auth, runs without platform JWT.
  { method: "GET", path: "/api/v1/storefront/" },
  { method: "POST", path: "/api/v1/storefront/" },
  { method: "PATCH", path: "/api/v1/storefront/" },
  { method: "DELETE", path: "/api/v1/storefront/" },
  // Public theme read for storefronts.
  { method: "GET", path: "/api/v1/themes/published" },
  // Caddy on-demand TLS hook: must be reachable without auth.
  { method: "GET", path: "/api/v1/domains/check" },
];

const PRIVATE_EXCEPTIONS = [
  "/api/v1/products/my",
  "/api/v1/stores/my",
  "/api/v1/orders/my",
  "/api/v1/reviews/my",
];

import { authenticate } from "./middlewares/auth";

app.use("/api/v1/*", async (c, next) => {
  const method = c.req.method;
  const path = c.req.path;

  // Check exact matches
  const isExactPublic = PUBLIC_ROUTES.some(
    (r) => r.method === method && r.path === path
  );
  if (isExactPublic) return next();

  // Check prefix matches for public storefront content
  const isPrefixPublic = PUBLIC_PREFIXES.some(
    (r) => r.method === method && path.startsWith(r.path)
  );

  // If it's a prefix match, ensure it's not a private exception (like /my)
  if (isPrefixPublic) {
    const isPrivateException = PRIVATE_EXCEPTIONS.some((p) => path === p);
    if (!isPrivateException) return next();
  }

  // All other api/v1 routes require authentication
  return authenticate(c, next);
});

app.use("/api/v1/*", resolveTenant);

app.onError((err, c) => {
  const status = err instanceof HTTPException ? err.status : 500;
  const message = err.message || "Internal Server Error";
  const causes = err instanceof HTTPException ? err.cause : undefined;

  return c.json(
    {
      data: null,
      error: true,
      message,
      ...(causes && { causes }),
    },
    status as any
  );
});

app.get("/", (c) => {
  return c.json({
    message: "E-commerce SaaS Platform API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      auth: "/api/v1/auth",
      stores: "/api/v1/stores",
      products: "/api/v1/products",
      storefrontCart: "/api/v1/storefront/cart",
      storefrontCheckout: "/api/v1/storefront/checkout",
      orders: "/api/v1/orders",
      reviews: "/api/v1/reviews",
      categories: "/api/v1/categories",
      plans: "/api/v1/plans",
      admin: "/api/v1/admin",
      payments: "/api/v1/payments",
      inventory: "/api/v1/inventory",
      webhooks: "/api/v1/webhooks",
      swagger: "/swagger/ui",
      openapi: "/swagger/doc",
    },
  });
});

app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.route("/api/v1/auth", authRouter);
app.route("/api/v1/stores", storesRouter);
app.route("/api/v1/products", productsRouter);
app.route("/api/v1/storefront/cart", storefrontCartRouter);
app.route("/api/v1/storefront/checkout", storefrontCheckoutRouter);
app.route("/api/v1/orders", ordersRouter);
app.route("/api/v1/reviews", reviewsRouter);
app.route("/api/v1/categories", categoryRoutes);
app.route("/api/v1/plans", planRouter);
app.route("/api/v1/admin", adminRouter);
app.route("/api/v1/payments", paymentsRouter);
app.route("/api/v1/inventory", inventoryRouter);
app.route("/api/v1/webhooks", webhooksRouter);
app.route("/api/v1/cms", cmsRouter);
app.route("/api/v1/staff", staffRouter);
app.route("/api/v1/assets", assetsRouter);
app.route("/api/v1/themes", themesRouter);
app.route("/api/v1/domains", domainsRouter);
app.route("/swagger", swaggerRouter);

const port = parseInt(process.env.PORT || "3000");

console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
