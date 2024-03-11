const passport = require("passport");
const local = require("passport-local");
const UserModel = require("../dao/models/user-mongoose.js");
const { createHash, isValidPassword } = require("../utils/hashBcrypt.js");

const GitHubStrategy = require('passport-github2').Strategy;

const LocalStrategy = local.Strategy;

const initializePassport = () => {
    passport.use("register", new LocalStrategy({
        passReqToCallback: true,
        usernameField: "email"
    }, async (req, username, password, done) => {
        const { first_name, last_name, age } = req.body;
        try {
            let user = await UserModel.findOne({ email: username });
            if (user) {
                return done(null, false, req.flash('error', 'El email ya está registrado...'));
            }
            let newUser = {
                first_name,
                last_name,
                email: username,
                age,
                role: 'user',
                password: createHash(password)
            };
            let result = await UserModel.create(newUser);
            return done(null, result);
        } catch (error) {
            return done(null, false, req.flash('error', 'Error al crear el usuario...'));
        }
    }));

    passport.use("login", new LocalStrategy({
        passReqToCallback: true,
        usernameField: "email"
    }, async (req, email, password, done) => {
        try {
            const user = await UserModel.findOne({ email });
            if (!user) {
                return done(null, false, req.flash('error'));
            }
            if (!isValidPassword(password, user)) {
                return done(null, false, req.flash('error'));
            }
            return done(null, user);
        } catch (error) {
            return done(null, false, req.flash('error'));
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        let user = await UserModel.findById({_id: id});
        done(null, user);
    });

        passport.use("github", new GitHubStrategy({
            clientID: "5fbb6e5e486efe9ea306",
            clientSecret: "5d88ec90f20b9494fc0804aeede78c64ecc1d4ef",
            callbackURL: "http://localhost:8080/api/sessions/auth/github/callback"
        }, async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await UserModel.findOne({ email: profile._json.id })
    
                if (!user) {
                    let newUser = {
                        first_name: profile._json.name,
                        last_name: "",
                        age: null,
                        email: profile._json.id,
                        role: 'user',
                        password: ""
                    }
                    let result = await UserModel.create(newUser);
                    done(null, result)
                } else {
                    done(null, user);
                }
    
            } catch (error) {
                return done(error);
            }
    
        }));

        const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: '995178315130-4l4keni15gt5igd7r1jevcnmcke3blt0.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: "http://localhost:8080/api/sessions/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await UserModel.findOne({ email: profile.id });

        if (!user) {
            const newUser = new UserModel({
                first_name: profile.name.givenName,
                last_name: profile.name.familyName,
                age: null,
                email: profile.id,
                role: 'user',
                password: "",
            });

            user = await newUser.save();
        }

        done(null, user);
    } catch (error) {
        done(error);
    }
}));

};

module.exports = initializePassport;