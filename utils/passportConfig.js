const GoogleStrategy = require('passport-google-oauth2');
const { ExtractJwt, Strategy: JwtStrategy } = require('passport-jwt');

const AuthUser = require('../models/auth');

module.exports = passport => {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                callbackURL: 'http://localhost:3000/auth/google/callback',
                passReqToCallback: true,
            },
            async (request, accessToken, refreshToken, profile, done) => {
                try {
                    const existingUser = await AuthUser.findOne({ 'google.id': profile.id });
                    if (existingUser) {
                        return done(null, existingUser);
                    }
                    console.log('Creating new user...');
                    const newUser = new AuthUser({
                        google: {
                            id: profile.id,
                            name: profile.displayName,
                            email: profile.emails[0].value,
                        },
                    });
                    await newUser.save();
                    return done(null, newUser);
                } catch (error) {
                    return done(error);
                }
            },
        ),
    );

    passport.use(
        new JwtStrategy(
            {
                jwtFromRequest: ExtractJwt.fromHeader('authorization'),
                secretOrKey: 'secretKey',
            },
            async (jwtPayload, done) => {
                try {
                    const { user } = jwtPayload;
                    done(null, user);
                } catch (err) {
                    done(err, false);
                }
            },
        ),
    );
};
