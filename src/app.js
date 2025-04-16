const express = require("express");
const session = require("express-session");
const passport = require("passport");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const oauthRoutes = require("./routes/oauthRoutes");
const twoFactorRoutes = require("./routes/twoFactorRoutes");

// Charger les variables d'environnement
dotenv.config();

// charger la configuration de passport
require("./config/passportConfig");

// Initiliaser l'application express
const app = express();

// Middleware pour parser les JSON
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Initialisation de passport
app.use(passport.initialize());
app.use(passport.session());

// Routes d'authentification
app.use("/auth", oauthRoutes);
app.use("/auth", authRoutes);
app.use("/2fa", twoFactorRoutes);

module.exports = app;
