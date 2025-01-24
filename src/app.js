const express = require("express");
const session = require("express-session");
const passport = require("passport");
const dotenv = require("dotenv");
const authRoutes = require("../src/routes/authRoutes");

// Charger les variables d'environnement
dotenv.config();

// Initiliaser l'application express
const app = express();

// Middleware pour parser les JSON
app.use(express.json());

// Configuration des sessions
require("dotenv").config();

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

// Stocker les données de l'utilisateur dans la session
passport.serializeUser((user, done) => {
  done(null, user.id); // Après authentification d'un user on call cette fonction pour décider quoi sauvegarder dans la session
});

// détermine comment récupérer les informations utilisateur à partir de la session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Roiutes d'authentification
app.use("/auth", authRoutes);

module.exports = app;
