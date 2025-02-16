const GoogleStrategy = require('passport-google-oauth2');
const { ExtractJwt, Strategy: JwtStrategy } = require('passport-jwt');
const AuthUser = require('../models/auth');
const { createUserFolder } = require('../utils/createUserFolderAWS'); // Import S3 function

module.exports = (passport) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_OAUTH_CALLBACK_URL,
        passReqToCallback: true,
      },
      async (request, accessToken, refreshToken, profile, done) => {
        try {
          let user = await AuthUser.findOne({ 'google.id': profile.id });

          if (!user) {
            console.log('Creating new user...');
            user = new AuthUser({
              google: {
                id: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
              },
            });

            await user.save();
            await createUserFolder(user.google.email); // Create folder in S3
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
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
          console.log(jwtPayload)
          done(null, user);
        } catch (err) {
          done(err, false);
        }
      }
    )
  );
};
