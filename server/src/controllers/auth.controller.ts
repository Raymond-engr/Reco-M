import { Request, Response } from 'express';
import { tokenService } from '../services/token.service.js';
import { emailService } from '../services/email.service.js';
import { googleAuthService } from '../services/google-auth.service.js';
import User from '../models/user.model.js';
import { BadRequestError, UnauthorizedError } from '../utils/customErrors.js';
import asyncHandler from '../utils/asyncHandler.js';

class AuthController {
  register = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password } = (req as any).validated.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError('Email already registered');
    }

    const user = await User.create({
      name,
      email,
      password
    });

    // Generate verification token and send email
    const verificationToken = user.generateVerificationToken();
    await user.save();
    await emailService.sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for verification.'
    });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = (req as any).validated.body;

    // Find user and check password
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      const hasValidToken = user.verificationTokenExpires &&  user.verificationTokenExpires > new Date();

      return res.status(401).json({
        success: false,
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Please verify your email address first',
        canResend: !hasValidToken || (Date.now() - user.verificationTokenExpires.getTime()) >= 5 * 60 * 1000
      });
    }


    const tokens = tokenService.generateTokens({
      userId: user._id,
      email: user.email
    });

    user.refreshToken = tokens.refreshToken;
    user.lastLogin = new Date();
    await user.save();

    tokenService.setRefreshTokenCookie(res, tokens.refreshToken);
    res.json({
      success: true,
      accessToken: tokens.accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  });

  googleAuth = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.body;
    const googleUser = await googleAuthService.verifyGoogleToken(token);

    let user = await User.findOne({ email: googleUser.email });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleUser.googleId;
        user.isEmailVerified = true;
        await user.save();
      }
    } else {
      user = await User.create({
        name: googleUser.name,
        email: googleUser.email,
        googleId: googleUser.googleId,
        isEmailVerified: true
      });
    }

    const tokens = tokenService.generateTokens({
      userId: user._id,
      email: user.email
    });

    user.refreshToken = tokens.refreshToken;
    user.lastLogin = new Date();
    await user.save();

    tokenService.setRefreshTokenCookie(res, tokens.refreshToken);
    res.json({
      success: true,
      accessToken: tokens.accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  });

  // Additional controller methods...
  verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.params;
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new BadRequestError('Invalid or expired verification token');
    }

    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
    });
  });

  resendVerification = asyncHandler(async (req: Request, res: Response) => {
    const { email } = (req as any).validated.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw new BadRequestError('No user found with this email address');
    }

    if (user.isEmailVerified) {
      throw new BadRequestError('Email is already verified');
    }
    
    if (
      user.verificationTokenExpires &&
      user.verificationTokenExpires > new Date() &&
      user.verificationToken
    ) {
      const timeSinceLastToken = Date.now() - user.verificationTokenExpires.getTime();
      const waitTime = 5 * 60 * 1000;
      const timeRemaining = waitTime - timeSinceLastToken;
      
      if (timeRemaining > 0) {
        const remainingSeconds = Math.ceil(timeRemaining / 1000);
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
    
        let message = '';
        if (minutes > 0) {
          message = `Please wait ${minutes} minute${minutes > 1 ? 's' : ''} and ${seconds} second${seconds > 1 ? 's' : ''} before requesting another verification email.`;
        } else {
          message = `Please wait ${seconds} second${seconds > 1 ? 's' : ''} before requesting another verification email.`;
        }
        throw new BadRequestError(message);
      }
    }
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = (req as any).validated.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw new BadRequestError('User not found');
    }

    const resetToken = user.generatePasswordResetToken();
    await user.save();

    await emailService.sendVerificationEmail(email, resetToken);

    res.status(200).json({
      success: true,
      message: 'Password reset email sent',
    });
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.params;
    const { password } = (req as any).validated.body;
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new BadRequestError('Invalid or expired reset token');
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });
  });

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const {refreshToken} = req.cookies;

    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token required');
    }

    const payload = tokenService.verifyRefreshToken(refreshToken);
    const user = await User.findById(payload.userId);

    if (!user || user.refreshToken !== refreshToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }
    
    const tokens = tokenService.rotateRefreshToken(refreshToken, {
      userId: user._id,
      email: user.email
    });

    user.refreshToken = tokens.refreshToken;
    await user.save();

    tokenService.setRefreshTokenCookie(res, tokens.refreshToken);

    res.json({
      success: true,
      accessToken: tokens.accessToken
    });
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;
    if (refreshToken) {
      const user = await User.findOne({ refreshToken });
      if (user) {
        user.refreshToken = undefined;
        await user.save();
      }
    }

    tokenService.clearRefreshTokenCookie(res);
  
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  });
}

export const authController = new AuthController();