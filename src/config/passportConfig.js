const passport = require("passport");
const localStrategy = require("../strategies/localStrategy");

require("../strategies/googleStrategy");
require("../strategies/githubStrategy");
require("../strategies/discordStrategy");
require("../strategies/steamStrategy");

passport.use("local", localStrategy);

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Stocker les données de l'utilisateur dans la session
passport.serializeUser((user, done) => {
  done(null, user.id); // Après authentification d'un user on call cette fonction pour décider quoi sauvegarder dans la session
});

// détermine comment récupérer les informations utilisateur à partir de la session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
