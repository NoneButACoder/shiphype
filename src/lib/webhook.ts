import crypto from "crypto";
import fs from "fs";
import { getDataFilePath } from "./storage";

export interface WebhookDeliveryRecord {
  id: string; // GitHub x-github-delivery ID
  event: string;
  repo: string;
  action: string;
  processedAt: string;
  status: "success" | "skipped" | "failed";
  summary: string;
}

function getDeliveriesFilePath() {
  const file = getDataFilePath("webhook_deliveries.json");
  if (!fs.existsSync(file)) {
    try {
      fs.writeFileSync(file, JSON.stringify([]), "utf8");
    } catch {
      // ignore
    }
  }
  return file;
}

export function getAllDeliveries(): WebhookDeliveryRecord[] {
  try {
    const file = getDeliveriesFilePath();
    const raw = fs.readFileSync(file, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function hasProcessedDelivery(deliveryId: string): boolean {
  const deliveries = getAllDeliveries();
  return deliveries.some((d) => d.id === deliveryId && d.status === "success");
}

export function recordDelivery(record: WebhookDeliveryRecord) {
  try {
    const file = getDeliveriesFilePath();
    const deliveries = getAllDeliveries();
    // Keep last 100 deliveries
    deliveries.unshift(record);
    if (deliveries.length > 100) deliveries.length = 100;
    fs.writeFileSync(file, JSON.stringify(deliveries, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to record webhook delivery", err);
  }
}

export function verifyGitHubSignature(
  rawBody: string,
  signature: string | null,
  secret: string
): boolean {
  if (!secret) {
    // If no secret configured in environment, allow in development mode
    return true;
  }
  if (!signature) return false;

  try {
    const hmac = crypto.createHmac("sha256", secret);
    const digest = "sha256=" + hmac.update(rawBody).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  } catch {
    return false;
  }
}
