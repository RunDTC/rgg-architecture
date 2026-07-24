import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";

// In development, allow the machine's own LAN IPs as dev origins. Reaching the dev server
// via its "Network" URL (e.g. http://192.168.x.x:3000 shown by `next dev`) otherwise trips
// Next's cross-origin dev-resource block, which breaks HMR and the client runtime. Derived
// from the current machine — nothing hard-coded — so it works in any client clone. Prefer
// http://localhost:3000 locally; add more hosts (e.g. a phone) via ALLOWED_DEV_ORIGINS.
const lanOrigins = Object.values(networkInterfaces())
  .flat()
  .flatMap((iface) =>
    iface && iface.family === "IPv4" && !iface.internal ? [iface.address] : [],
  );

const extraOrigins =
  process.env.ALLOWED_DEV_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];

const allowedDevOrigins = [...new Set([...lanOrigins, ...extraOrigins])];

const nextConfig: NextConfig = {
  ...(allowedDevOrigins.length ? { allowedDevOrigins } : {}),
};

export default nextConfig;
