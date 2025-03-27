import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/user';

export const setupPassport = () => {
  console.log('Setting up Passport with Google OAuth...');
  console.log('Client ID:', process.env.GOOGLE_CLIENT_ID);
  console.log('Callback URL:', process.env.GOOGLE_CALLBACK_URL);

  passport.serializeUser((user: any, done) => {
    console.log('Serializing user:', user.id);
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      console.log('Deserializing user:', id);
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      console.error('Deserialize error:', error);
      done(error, null);
    }
  });

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Google OAuth callback received profile:', profile.id);
      let user = await User.findOne({ googleId: profile.id });

      if (!user) {
        console.log('Creating new user for Google ID:', profile.id);
        user = await User.create({
          googleId: profile.id,
          email: profile.emails?.[0]?.value,
          name: profile.displayName,
          provider: 'google'
        });
      } else {
        console.log('Found existing user:', user.id);
      }

      // Add tokens to user object
      user.accessToken = accessToken;
      user.refreshToken = refreshToken;
      await user.save();
      console.log('Updated user tokens');

      return done(null, user);
    } catch (error) {
      console.error('Passport strategy error:', error);
      return done(error as Error, undefined);
    }
  }));
}; 