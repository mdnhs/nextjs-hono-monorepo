import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { HTTPException } from "hono/http-exception";
import dotenv from "dotenv";
import authRouter from "./routes/auth";
import storesRouter from "./routes/stores";
import productsRouter from "./routes/products";
import cartRouter from "./routes/cart";
import ordersRouter from "./routes/orders";
import reviewsRouter from "./routes/reviews";
import categoryRoutes from "./routes/category.routes";
import planRouter from "./routes/plans";
import adminRouter from "./routes/admin";
import swaggerRouter from "./routes/swagger";

dotenv.config();

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

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status);
  }
  return c.json({ error: "Internal Server Error" }, 500);
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
      cart: "/api/v1/cart",
      orders: "/api/v1/orders",
      reviews: "/api/v1/reviews",
      categories: "/api/v1/categories",
      plans: "/api/v1/plans",
      admin: "/api/v1/admin",
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
app.route("/api/v1/cart", cartRouter);
app.route("/api/v1/orders", ordersRouter);
app.route("/api/v1/reviews", reviewsRouter);
app.route("/api/v1/categories", categoryRoutes);
app.route("/api/v1/plans", planRouter);
app.route("/api/v1/admin", adminRouter);
app.route("/swagger", swaggerRouter);

const port = parseInt(process.env.PORT || "3000");

console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
