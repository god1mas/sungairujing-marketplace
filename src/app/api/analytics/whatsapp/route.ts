import { NextResponse } from "next/server";
import { WhatsAppClickSource } from "@prisma/client";
import { z } from "zod";
import {
  createVisitorId,
  isVisitorId,
  VISITOR_COOKIE_MAX_AGE,
  VISITOR_COOKIE_NAME,
} from "@/lib/analytics/visitor";
import { recordWhatsAppClick } from "@/services/analytics-service";

const schema = z.object({
  source: z.enum(WhatsAppClickSource),
  productSlug: z.string().optional(),
  merchantSlug: z.string().optional(),
});
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return new NextResponse(null, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return new NextResponse(null, { status: 400 });
  const raw = request.headers
    .get("cookie")
    ?.match(new RegExp(`(?:^|; )${VISITOR_COOKIE_NAME}=([^;]+)`))?.[1];
  const existing = raw ? decodeURIComponent(raw) : undefined;
  const visitorId = isVisitorId(existing) ? existing : createVisitorId();
  try {
    await recordWhatsAppClick({ ...parsed.data, visitorId });
  } catch {
    /* WhatsApp navigation remains primary. */
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
