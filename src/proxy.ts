import { NextResponse, type NextRequest } from "next/server";
import { createRemoteJWKSet, jwtVerify } from "jose";

/**
 * Cloudflare Access enforcement.
 *
 * Access authenticates users at the Cloudflare edge, but the *.vercel.app
 * origin remains directly reachable. Verifying the Cf-Access-Jwt-Assertion
 * token that Access attaches to every authorized request closes that bypass:
 * requests that didn't pass through Access have no valid token and get a 403.
 *
 * Required env (both must be set for enforcement to activate):
 * - CF_ACCESS_TEAM_DOMAIN  e.g. "myteam.cloudflareaccess.com"
 * - CF_ACCESS_AUD          the Access application's Audience (AUD) tag
 */

const teamDomain = process.env.CF_ACCESS_TEAM_DOMAIN;
const audience = process.env.CF_ACCESS_AUD;

const jwks = teamDomain
  ? createRemoteJWKSet(
      new URL(`https://${teamDomain}/cdn-cgi/access/certs`),
    )
  : null;

export async function proxy(request: NextRequest) {
  if (!jwks || !audience) {
    // Not configured (local dev): fail open but make the state visible.
    if (process.env.NODE_ENV === "production" && process.env.VERCEL) {
      console.warn(
        "Cloudflare Access env vars missing; deployment is unprotected.",
      );
    }
    return NextResponse.next();
  }

  const token =
    request.headers.get("cf-access-jwt-assertion") ??
    request.cookies.get("CF_Authorization")?.value;

  if (!token) {
    return new NextResponse("Forbidden: missing Cloudflare Access token", {
      status: 403,
    });
  }

  try {
    await jwtVerify(token, jwks, {
      issuer: `https://${teamDomain}`,
      audience,
    });
    return NextResponse.next();
  } catch {
    return new NextResponse("Forbidden: invalid Cloudflare Access token", {
      status: 403,
    });
  }
}

export const config = {
  // Protect everything except Next.js internals and static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
