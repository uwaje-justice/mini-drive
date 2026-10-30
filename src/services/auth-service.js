import argon2 from "argon2";
import prisma from "../lib/prisma.js";
import ConflictError from "../errors/conflict-error.js";

const emailConflictCode = "P2002";

const findByEmail = (email) => prisma.user.findUnique({ where: { email } });

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

export default { findByEmail, findPublicById, registerUser, verifyPassword };
