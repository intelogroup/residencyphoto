import "dotenv/config";
import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;
const appUrl = process.env.APP_URL;

if (!secretKey) throw new Error("STRIPE_SECRET_KEY is required.");
if (!appUrl) throw new Error("APP_URL is required.");

const stripe = new Stripe(secretKey);
const webhookUrl = new URL("/api/webhooks/stripe", appUrl).toString();
const enabledEvents = [
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
];
const endpoints = await stripe.webhookEndpoints.list({ limit: 100 });
const existing = endpoints.data.find((endpoint) => endpoint.url === webhookUrl);

const endpoint = existing
  ? await stripe.webhookEndpoints.update(existing.id, { enabled_events: enabledEvents })
  : await stripe.webhookEndpoints.create({ url: webhookUrl, enabled_events: enabledEvents });

console.log(`Stripe webhook ${existing ? "updated" : "created"}: ${endpoint.url}`);
if (!existing) {
  console.log("Copy the new endpoint signing secret into STRIPE_WEBHOOK_SECRET in your deployment environment.");
}
