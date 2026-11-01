import argon2 from "argon2";

import ConflictError from "../errors/conflict-error.js";
import UnauthorizedError from "../errors/unauthorized-error.js";
import prisma from "../lib/prisma.js";

const emailConflictCode = "P2002";

const findByEmail = (email) => prisma.user.findUnique({ where: { email } });

const findById = (id) => prisma.user.findUnique({ where: { id } });

const findPublicById = (id) =>
  prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, createdAt: true },
  });

const registerUser = async ({ email, password }) => {
  const passwordHash = await argon2.hash(password);

  try {
    return await prisma.user.create({
      data: { email, passwordHash },
      select: { id: true, email: true, createdAt: true },
    });
  } catch (error) {
    if (error.code === emailConflictCode) {
      throw new ConflictError("Email already registered.");
    }

    throw error;
  }
};

const verifyPassword = (user, password) =>
  argon2.verify(user.passwordHash, password);

const assertCurrentPassword = async (userId, currentPassword) => {
  const user = await findById(userId);

  if (!user || !(await verifyPassword(user, currentPassword))) {
    throw new UnauthorizedError("Current password is incorrect.", {
      currentPassword: "Current password is incorrect.",
    });
  }

  return user;
};

const updateEmail = async (userId, { email, currentPassword }) => {
  await assertCurrentPassword(userId, currentPassword);

  try {
    return await prisma.user.update({
      where: { id: userId },
      data: { email },
      select: { id: true, email: true, createdAt: true },
    });
  } catch (error) {
    if (error.code === emailConflictCode) {
      throw new ConflictError("Email already registered.");
    }

    throw error;
  }
};

const updatePassword = async (
  userId,
  { currentPassword, newPassword, currentSessionId },
) => {
  await assertCurrentPassword(userId, currentPassword);

  const passwordHash = await argon2.hash(newPassword);
  const [user] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
      select: { id: true, email: true, createdAt: true },
    }),
    prisma.session.deleteMany({
      where: {
        data: { contains: userId },
        sid: { not: currentSessionId },
      },
    }),
  ]);

  return user;
};

export default {
  findByEmail,
  findPublicById,
  registerUser,
  verifyPassword,
  updateEmail,
  updatePassword,
};
