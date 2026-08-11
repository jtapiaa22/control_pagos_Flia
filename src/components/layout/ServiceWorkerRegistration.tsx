"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/push/register-sw";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return null;
}
