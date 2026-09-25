import "server-only";

import type { NotificationType } from "@prisma/client";
import { requireMerchantAdmin } from "@/lib/auth/authorization";
import {
  findNotificationsForUser,
  markNotificationReadForUser,
} from "@/repositories/notification-repository";

const safeDestination: Record<NotificationType, string> = {
  VERIFICATION_APPROVED: "/dashboard/verification",
  VERIFICATION_REJECTED: "/dashboard/verification",
  PRODUCT_SUSPENDED: "/dashboard/products",
  MERCHANT_SUSPENDED: "/dashboard",
  MERCHANT_REACTIVATED: "/dashboard",
};

const defaults = {
  authorize: requireMerchantAdmin,
  findMany: findNotificationsForUser,
  markRead: markNotificationReadForUser,
};

export const getMerchantNotifications = async (
  overrides: Partial<typeof defaults> = {},
) => {
  const deps = { ...defaults, ...overrides };
  const membership = await deps.authorize();
  const notifications = await deps.findMany(membership.userId);
  return notifications.map((notification) => ({
    ...notification,
    href: safeDestination[notification.type],
  }));
};

export const markMerchantNotificationRead = async (
  notificationId: string,
  overrides: Partial<typeof defaults> = {},
) => {
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      notificationId,
    )
  )
    return false;
  const deps = { ...defaults, ...overrides };
  const membership = await deps.authorize();
  const result = await deps.markRead(notificationId, membership.userId);
  return result.count === 1;
};
