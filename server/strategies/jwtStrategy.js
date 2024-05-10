const passport = require("passport")
const JwtStrategy = require("passport-jwt").Strategy
const ExtractJwt = require("passport-jwt").ExtractJwt
const User = require("../models/user")

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
}

passport.use(
  new JwtStrategy(options, async (payload, done) => {
    const user = await User.findById(payload.id).select("-password")
    if (user) {
      return done(null, user)
    }
    return done(null, false)
  })
)
