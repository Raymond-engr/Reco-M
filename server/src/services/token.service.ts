import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { UnauthorizedError } from '../utils/customErrors.js';

export interface TokenPayload {
  userId: string;
  email: string;
}

class TokenService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiry: string;
  private readonly refreshTokenExpiry: string;

  constructor() {
    this.accessTokenSecret = process.env.JWT_ACCESS_SECRET as string;
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET as string;
    this.accessTokenExpiry = '15m';
    this.refreshTokenExpiry = '7d';
  }

  generateTokens(payload: TokenPayload) {
    const accessToken = jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry
    });

    const refreshToken = jwt.sign(payload, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpiry
    });

    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.accessTokenSecret) as TokenPayload;
    } catch (error) {
      throw new UnauthorizedError('Invalid access token');
    }
  }

  verifyRefreshToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.refreshTokenSecret) as TokenPayload;
    } catch (error) {
      throw new UnauthorizedError('Invalid refresh token');
    }
  }

  setRefreshTokenCookie(res: Response, token: string) {
    res.cookie('refreshToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
  }

  clearRefreshTokenCookie(res: Response) {
    res.clearCookie('refreshToken');
  }
}

export const tokenService = new TokenService();