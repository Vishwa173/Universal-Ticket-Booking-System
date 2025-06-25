import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Sequelize from 'sequelize';
import User from '../models/user.js';
import PasswordResetToken from '../models/PasswordResetToken.js';
import { authenticateJWT } from '../middleware/auth.js';
import { sendResetEmail } from '../utils/emailSender.js';
import { generateToken } from '../utils/jwt.js';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

router.get('/google', (req, res) => {
  const redirectUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  redirectUrl.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID);
  redirectUrl.searchParams.set('redirect_uri', `${process.env.SERVER_URL}/api/auth/google/callback`);
  redirectUrl.searchParams.set('response_type', 'code');
  redirectUrl.searchParams.set('scope', 'openid email profile');
  redirectUrl.searchParams.set('access_type', 'offline');
  redirectUrl.searchParams.set('prompt', 'consent');

  res.redirect(redirectUrl.toString());
});

router.get('/google/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) return res.status(400).json({ message: 'Missing authorization code' });

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.SERVER_URL}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const profile = await profileRes.json();

    let user = await User.findOne({ where: { email: profile.email } });

    if (user) {
  const now = new Date();
  const banUntil = user.banUntil ? new Date(user.banUntil) : null;
  if (user.isBanned && (!banUntil || banUntil > now)) {
    return res.redirect(`${process.env.CLIENT_URL}/login?error=banned`);
  }
}

    let isNewUser = false;

    if (!user) {
      user = await User.create({
        name: profile.name,
        email: profile.email,
        profilePic: profile.picture,
        provider: 'google',
        wallet: 1000,
        role: null,
      });
      isNewUser = true;
    }

    const token = generateToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 24 * 60 * 60 * 1000,
       path: '/',
    });

    if (!user.role) {
      return res.redirect(`${process.env.CLIENT_URL}/select-role`);
    }

    const dashboard = user.role === 'vendor'
      ? 'vendor'
      : user.role === 'admin'
      ? 'admin'
      : 'user';

    res.redirect(`${process.env.CLIENT_URL}/dashboard/${dashboard}`);

  } catch (err) {
    console.error('Google OAuth error:', err);
    res.redirect(`${process.env.CLIENT_URL}/login?error=oauth`);
  }
});

router.get('/dauth', (req, res) => {
  const redirectUrl = new URL('https://auth.delta.nitt.edu/authorize');
  redirectUrl.searchParams.set('client_id', process.env.DAUTH_CLIENT_ID);
  redirectUrl.searchParams.set('redirect_uri', `${process.env.SERVER_URL}/api/auth/dauth/callback`);
  redirectUrl.searchParams.set('response_type', 'code');
  redirectUrl.searchParams.set('scope', 'user email profile openid');
  redirectUrl.searchParams.set('prompt', 'consent');

  res.redirect(redirectUrl.toString());
});

router.get('/dauth/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) {
    console.error("No authorization code received in callback");
    return res.status(400).json({ message: 'Missing authorization code' });
  }

  const tokenPayload = new URLSearchParams({
    code,
    client_id: process.env.DAUTH_CLIENT_ID,
    client_secret: process.env.DAUTH_CLIENT_SECRET,
    redirect_uri: `${process.env.SERVER_URL}/api/auth/dauth/callback`,
    grant_type: 'authorization_code',
  });

  try {
    const tokenRes = await fetch('https://auth.delta.nitt.edu/api/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: tokenPayload,
    });

    const contentType = tokenRes.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const html = await tokenRes.text();
      console.error("DAuth token endpoint returned HTML instead of JSON:", html.slice(0, 500));
      return res.redirect(`${process.env.CLIENT_URL}/login?error=token_html`);
    }

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      console.error("No access_token in token response:", tokenData);
      return res.redirect(`${process.env.CLIENT_URL}/login?error=missing_token`);
    }

    const accessToken = tokenData.access_token;

    const profileRes = await fetch('https://auth.delta.nitt.edu/api/resources/user', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const profileType = profileRes.headers.get("content-type") || "";
    if (!profileType.includes("application/json")) {
      const html = await profileRes.text();
      console.error("DAuth userinfo endpoint returned HTML:", html.slice(0, 500));
      return res.redirect(`${process.env.CLIENT_URL}/login?error=profile_html`);
    }

    const profile = await profileRes.json();

    if (!profile.email) {
      console.error("Profile is missing email. Likely due to insufficient scope. Profile:", profile);
      return res.redirect(`${process.env.CLIENT_URL}/login?error=missing_profile_email`);
    }

    let user = await User.findOne({ where: { email: profile.email } });

    if (user) {
      const now = new Date();
      const banUntil = user.banUntil ? new Date(user.banUntil) : null;
      if (user.isBanned && (!banUntil || banUntil > now)) {
        return res.redirect(`${process.env.CLIENT_URL}/login?error=banned`);
      }
    }

    if (!user) {
      user = await User.create({
        name: profile.name || 'DAuth User',
        email: profile.email,
        provider: 'dauth',
        wallet: 1000,
        role: null,
      });
    }

    const token = generateToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });

    if (!user.role) {
      return res.redirect(`${process.env.CLIENT_URL}/select-role`);
    }

    const dashboard = user.role === 'vendor' ? 'vendor'
                    : user.role === 'admin' ? 'admin'
                    : 'user';

    return res.redirect(`${process.env.CLIENT_URL}/dashboard/${dashboard}`);
  } catch (err) {
    console.error('DAuth callback error:', err);
    return res.redirect(`${process.env.CLIENT_URL}/login?error=dauth_internal`);
  }
});

router.get('/login-failure', (req, res) => {
  res.status(401).json({ message: 'Login failed' });
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role)
      return res.status(400).json({ message: 'All fields are required' });

    const allowedRoles = ['user', 'vendor', 'admin'];
    if (!allowedRoles.includes(role))
      return res.status(400).json({ message: 'Invalid role' });

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser)
      return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      provider: 'local',
      created_at: new Date(),
      wallet: 1000,
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        wallet: newUser.wallet,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/logout', (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production', 
    });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/user', (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  res.json({ user: req.user });
});

router.post('/send-code', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });

  const msg = { message: 'If the email exists, a code will be sent' };
  if (!user) return res.status(200).json(msg);

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000);

  await PasswordResetToken.upsert({
    userId: user.id,
    token: code,
    expiresAt: expires,
  });

  await sendResetEmail(email, `Your OMNITIX verification code is: ${code}`);
    res.json(msg);
  });

router.post('/verify-code', async (req, res) => {
  const { email, code } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const record = await PasswordResetToken.findOne({
    where: { userId: user.id, token: code },
  });

  if (!record || record.expiresAt < new Date())
    return res.status(400).json({ message: 'Invalid or expired code' });

  await PasswordResetToken.destroy({ where: { userId: user.id } });

  const token = generateToken(user);

  res.json({
    message: 'Login successful via code',
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      wallet: user.wallet,
    },
  });
});

router.post('/reset-password', async (req, res) => {
  const { email, code, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired code' });

    const tokenEntry = await PasswordResetToken.findOne({
      where: {
        userId: user.id,
        token: code,
      },
    });

    if (!tokenEntry || tokenEntry.expiresAt < new Date())
      return res.status(400).json({ message: 'Invalid or expired code' });

    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    await user.save();

    await PasswordResetToken.destroy({ where: { userId: user.id } });

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset error:', err);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

router.post('/set-role', async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { role } = req.body;
    const allowedRoles = ['user', 'vendor', 'admin'];
    if (!allowedRoles.includes(role))
      return res.status(400).json({ message: 'Invalid role' });

    user.role = role;
    await user.save();

    const newToken = generateToken(user);

    res.cookie('token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 24 * 60 * 60 * 1000,
       path: '/',
    });

    res.json({ message: 'Role set successfully', role });
  } catch (err) {
    console.error('Set role error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;