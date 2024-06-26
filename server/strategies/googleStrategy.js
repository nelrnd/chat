const passport = require("passport")
const GoogleStrategy = require("passport-google-oauth20").Strategy
const User = require("../models/user")

const options = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/api/user/google/redirect",
  scope: ["email", "profile", "openid"],
}

passport.use(
  new GoogleStrategy(options, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id })

      if (!user) {
        user = new User({
          provider: "google",
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0].value,
        })

        await user.save()
      }

      done(null, user)
    } catch (err) {
      console.log(err)
    }
  })
)
