// config/passport.js

import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { User } from '../models/index.js';

export default function configurePassport() {
  // Use email/username as the identifier
  passport.use(new LocalStrategy(
    { usernameField: 'username' },
    async (username, password, done) => {
      try {
        const user = await User.findOne({ where: { username } });

        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }

        const isValid = await user.validatePassword(password);
        if (!isValid) {
          return done(null, false, { message: 'Incorrect password.' });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  ));

  // Serialize user ID to the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user object from the session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findByPk(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}