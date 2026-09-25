import { prisma } from "@/lib/db/prisma";

export const findNotificationsForUser = (recipientUserId: string) =>
  prisma.notification.findMany({
    where: { recipientUserId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 50,
    select: {
      id: true,
      type: true,
      title: true,
      message: true,
      relatedProductId: true,
      readAt: true,
      createdAt: true,
    },
  });

export const markNotificationReadForUser = (
  id: string,
  recipientUserId: string,
) =>
  prisma.notification.updateMany({
    where: { id, recipientUserId, readAt: null },
    data: { readAt: new Date() },
  });
