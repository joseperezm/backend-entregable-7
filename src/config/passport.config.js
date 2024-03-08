const passport = require("passport");
const local = require("passport-local");
const UserModel = require("../dao/models/user-mongoose.js");
const { createHash, isValidPassword } = require("../utils/hashBcrypt.js");

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
};

module.exports = initializePassport;