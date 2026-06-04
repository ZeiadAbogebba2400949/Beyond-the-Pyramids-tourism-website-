const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('../app');

const generateToken = (id, email, role, expiresIn) =>
  jwt.sign({ id, email, role }, process.env.JWT_SECRET, { expiresIn });

const getDashboard = (role) => {
  const dashboards = {
    Admin: '/admin',
    Tourist: '/dashboard',
  };
  return dashboards[role] || '/dashboard';
};

const sendTokenResponse = (user, statusCode, res, rememberMe = true) => {
  const expiresIn   = rememberMe ? '7d' : '1d';
  const token       = generateToken(user._id, user.email, user.role, expiresIn);
  const cookieOpts  = { httpOnly: true, sameSite: 'lax' };
  if (rememberMe) cookieOpts.maxAge = 7 * 24 * 60 * 60 * 1000;

  res.cookie('jwt', token, cookieOpts);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        image: user.image,
        loginTime: new Date().toISOString(),
        dashboard: getDashboard(user.role),
      },
    },
  });
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, nationality, dob } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return next(new AppError('An account with this email already exists.', 400));
    }

    const newUser = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      nationality: nationality || '',
      dob: dob || null,
      image: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=c8a96e&color=fff`,
      role: 'Tourist',
    });

    sendTokenResponse(newUser, 201, res);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return next(new AppError('Invalid email or password.', 401));
    }

    const isMatch = await user.correctPassword(password, user.password);
    if (!isMatch) {
      return next(new AppError('Invalid email or password.', 401));
    }

    if (user.status === 'suspended') {
      return next(new AppError('Your account has been suspended. Please contact support.', 403));
    }

    sendTokenResponse(user, 200, res, rememberMe === true);
  } catch (err) {
    next(err);
  }
};

const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', { httpOnly: true, maxAge: 10 * 1000 });
  res.status(200).json({ status: 'success', message: 'Logged out successfully' });
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ status: 'success', data: { user } });
  } catch (err) {
    next(err);
  }
};

const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.correctPassword(currentPassword, user.password);
    if (!isMatch) {
      return next(new AppError('Current password is incorrect.', 401));
    }

    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, logout, getMe, updatePassword };
