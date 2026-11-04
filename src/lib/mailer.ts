import fs from "fs";
import { getDataFilePath } from "./storage";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  fromName?: string;
  fromEmail?: string;
  simulate?: boolean;
}

export interface BroadcastLogRecord {
  id: string;
  releaseId: string;
  projectSlug: string;
  subject: string;
  recipientCount: number;
  recipients: string[];
  simulated: boolean;
  status: "success" | "partial" | "failed";
  timestamp: string;
  error?: string;
}

function getLogsFilePath() {
  const file = getDataFilePath("broadcast_logs.json");
  if (!fs.existsSync(file)) {
    try {
      fs.writeFileSync(file, JSON.stringify([]), "utf8");
    } catch {
      // ignore
    }
  }
  return file;
}

export function saveBroadcastLog(record: BroadcastLogRecord) {
  try {
    const file = getLogsFilePath();
    const raw = fs.readFileSync(file, "utf8");
    const logs = JSON.parse(raw);
    logs.unshift(record);
    fs.writeFileSync(file, JSON.stringify(logs.slice(0, 100), null, 2), "utf8");
  } catch (err) {
    console.error("Failed to save broadcast log", err);
  }
}

export function getBroadcastLogs(projectSlug?: string): BroadcastLogRecord[] {
  try {
    const file = getLogsFilePath();
    const raw = fs.readFileSync(file, "utf8");
    const logs: BroadcastLogRecord[] = JSON.parse(raw);
    if (projectSlug) {
      return logs.filter((l) => l.projectSlug.toLowerCase() === projectSlug.toLowerCase());
    }
    return logs;
  } catch {
    return [];
  }
}

/**
 * Dispatch emails via Resend API or simulated transport
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  fromName = "ShipHype Updates",
  fromEmail = "updates@shiphype.com",
  simulate = false,
}: SendEmailOptions): Promise<{
  success: boolean;
  deliveredCount: number;
  recipients: string[];
  simulated: boolean;
  error?: string;
}> {
  const recipients = Array.isArray(to) ? to : [to];

  if (recipients.length === 0) {
    return {
      success: false,
      deliveredCount: 0,
      recipients: [],
      simulated: !!simulate,
      error: "No recipients provided.",
    };
  }

  const resendApiKey = process.env.RESEND_API_KEY;

  // If simulate is requested or no Resend API key is configured, run in simulation mode
  if (simulate || !resendApiKey) {
    // Simulated delivery latency
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      success: true,
      deliveredCount: recipients.length,
      recipients,
      simulated: true,
    };
  }

  // Live Send via Resend REST API
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: recipients,
        subject,
        html,
        text,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        deliveredCount: 0,
        recipients,
        simulated: false,
        error: data.message || `Resend API failed with status ${res.status}`,
      };
    }

    return {
      success: true,
      deliveredCount: recipients.length,
      recipients,
      simulated: false,
    };
  } catch (err: unknown) {
    return {
      success: false,
      deliveredCount: 0,
      recipients,
      simulated: false,
      error: err instanceof Error ? err.message : "Failed to send email",
    };
  }
}
