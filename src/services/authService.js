const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const speakeasy = require("speakeasy");

const prisma = new PrismaClient();

async function registerUser(email, password, username) {
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new Error("EMAIL_EXISTS");
  }

  const existingProfile = await prisma.profile.findUnique({
    where: { username },
  });

  if (existingProfile) {
    throw new Error("USERNAME_EXISTS");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const secret = speakeasy.generateSecret({ name: `Nebula (${email})` });

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: "PLAYER",
      totpSecret: secret.base32,
      isTotpEnabled: false,
      profile: {
        create: {
          username,
        },
      },
    },
    include: {
      profile: true,
    },
  });

  return { user, secret };
}

module.exports = { registerUser };
