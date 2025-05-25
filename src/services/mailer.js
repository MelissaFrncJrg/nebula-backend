const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

exports.sendPasswordResetMail = async (to, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const mailOptions = {
    from: `"Nebula Support" <${process.env.MAIL_USER}>`,
    to,
    subject: "Réinitialisation de ton mot de passe",
    html: `
      <p>Tu as demandé une réinitialisation de ton mot de passe.</p>
      <p><a href="${resetUrl}">Clique ici pour définir un nouveau mot de passe</a></p>
      <p>Ce lien expirera dans 1h.</p>
      <p>Si tu n’es pas à l’origine de cette demande, ignore simplement ce mail.</p>
    `,
  };

  return transporter.sendMail(mailOptions);
};
