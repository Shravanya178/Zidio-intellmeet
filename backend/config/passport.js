const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

const configurePassport = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackUrl = process.env.GOOGLE_CALLBACK_URL;

  if (!clientId || !clientSecret || !callbackUrl) {
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: clientId,
        clientSecret,
        callbackURL: callbackUrl,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();
          const name = profile.displayName;
          const googleId = profile.id;

          if (!email) {
            return done(new Error("Google account email not available"));
          }

          let user = await User.findOne({ email });
          if (!user) {
            user = await User.create({
              email,
              name,
              oauthProvider: "google",
              oauthId: googleId,
            });
          } else if (!user.oauthProvider) {
            user.oauthProvider = "google";
            user.oauthId = googleId;
            await user.save();
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
};

module.exports = configurePassport;
