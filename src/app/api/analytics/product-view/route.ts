import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createVisitorId,
  isVisitorId,
  VISITOR_COOKIE_MAX_AGE,
  VISITOR_COOKIE_NAME,
} from "@/lib/analytics/visitor";
import { consumePublicAnalyticsLimit } from "@/lib/rate-limit/public-analytics";
import { recordProductView } from "@/services/analytics-service";

const inputSchema = z.object({ productId: z.uuid() });

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return new NextResponse(null, { status: 403 });
  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return new NextResponse(null, { status: 400 });
  if (!(await consumePublicAnalyticsLimit(request, "product-view"))) {
    return new NextResponse(null, { status: 204 });
  }
  const rawCookie = request.headers
    .get("cookie")
    ?.match(new RegExp(`(?:^|; )${VISITOR_COOKIE_NAME}=([^;]+)`))?.[1];
  const existing = rawCookie ? decodeURIComponent(rawCookie) : undefined;
  const visitorId = isVisitorId(existing) ? existing : createVisitorId();
  try {
    await recordProductView(parsed.data.productId, visitorId);
  } catch {
    /* Analytics must not break the public product experience. */
  }
  const response = new NextResponse(null, { status: 204 });
  if (!isVisitorId(existing))
    response.cookies.set(VISITOR_COOKIE_NAME, visitorId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: VISITOR_COOKIE_MAX_AGE,
      path: "/",
    });
  return response;
}
