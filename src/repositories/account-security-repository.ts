import { prisma } from "@/lib/db/prisma";

export type AccountPasswordRecord = {
  id: string;
  passwordHash: string;
};

export const findAccountPasswordById = async (
  userId: string,
): Promise<AccountPasswordRecord | null> =>
  prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, passwordHash: true },
  });

export const replaceAccountPasswordHash = async ({
  userId,
  expectedPasswordHash,
  newPasswordHash,
  changedAt,
}: {
  userId: string;
  expectedPasswordHash: string;
  newPasswordHash: string;
  changedAt: Date;
}): Promise<boolean> => {
  const result = await prisma.user.updateMany({
    where: { id: userId, passwordHash: expectedPasswordHash },
    data: { passwordHash: newPasswordHash, updatedAt: changedAt },
  });

  return result.count === 1;
};
