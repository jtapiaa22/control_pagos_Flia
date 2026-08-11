// Run once with: node scripts/generate-vapid-keys.mjs
// Copy the output into .env (and later into Vercel's env vars).
import webpush from "web-push";

const keys = webpush.generateVAPIDKeys();

console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
