import "server-only";
import webpush from "web-push";

let configured = false;

function configure() {
  if (configured) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  configured = true;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

export interface StoredSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export async function sendPushNotification(
  subscription: StoredSubscription,
  payload: PushPayload
): Promise<{ ok: true } | { ok: false; expired: boolean }> {
  configure();
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      JSON.stringify(payload)
    );
    return { ok: true };
  } catch (error) {
    const statusCode = (error as { statusCode?: number }).statusCode;
    return { ok: false, expired: statusCode === 404 || statusCode === 410 };
  }
}
