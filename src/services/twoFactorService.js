const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function generateTotpSecret(email) {
  const secret = speakeasy.generateSecret({ name: `Nebula (${email})` });

  const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

  return { totpSecret: secret.base32, qrCodeUrl };
}

async function storeTotpSecret(userId, secretBase32) {
  await prisma.user.update({
    where: { id: userId },
    data: { totpSecret: secretBase32 },
  });
}

async function enableTwoFactor(userId) {
  const result = await prisma.user.update({
    where: { id: userId },
    data: {
      isTotpEnabled: true,
    },
  });

  return result;
}

function verifyTotpToken(secret, token) {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 1,
  });
}

async function getUserById(userId) {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      totpSecret: true,
      isTotpEnabled: true,
    },
  });
}

module.exports = {
  generateTotpSecret,
  storeTotpSecret,
  enableTwoFactor,
  verifyTotpToken,
  getUserById,
};
