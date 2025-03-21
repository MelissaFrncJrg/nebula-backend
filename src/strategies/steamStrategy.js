const passport = require("passport");
const SteamStrategy = require("passport-steam").Strategy;
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

passport.use(
  new SteamStrategy(
    {
      returnURL: `${process.env.BASE_URL}/auth/steam/callback`,
      realm: process.env.BASE_URL,
      apiKey: process.env.STEAM_API_KEY,
    },
    async (identifier, profile, done) => {
      try {
        const steamId = profile.id;

        let user = await prisma.user.findUnique({
          where: { steamId },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              steamId,
              username: profile.displayName,
              avatar: profile.photos?.[2]?.value || null,
            },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
