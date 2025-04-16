const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function getUserByEmail(email) {
  return await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      password: true,
      isTotpEnabled: true,
    },
  });
}

module.exports = { getUserByEmail };
