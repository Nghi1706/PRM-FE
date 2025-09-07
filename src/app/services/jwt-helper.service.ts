import { Injectable } from '@angular/core';
import { UserRole } from '../constants/roles';

export interface DecodedToken {
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': string; // User ID
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': string;
  RestaurantId: string;
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': string; // Role ID
  exp: number; // Expiration time
  iss: string; // Issuer
  aud: string; // Audience
}

@Injectable({
  providedIn: 'root',
})
export class JwtHelperService {
  constructor() {}

  /**
   * Decode JWT token without verification (for client-side use only)
   * Note: This should only be used for reading claims, not for security validation
   */
  decodeToken(token: string): DecodedToken | null {
    try {
      console.log('Decoding token:', token);
      if (!token) return null;

      // Split the token and get the payload
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      console.log('Token parts:', parts);
      // Decode the payload (base64url)
      const payload = parts[1];
      const decodedPayload = this.base64UrlDecode(payload);
      console.log('Decoded payload:', decodedPayload);
      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Get user role from token
   */
  getUserRole(token: string): UserRole | null {
    const decoded = this.decodeToken(token);
    console.log('Decoded token:', decoded);
    if (!decoded) return null;

    const roleValue = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    if (!roleValue) return null;

    const roleId = parseInt(roleValue, 10);
    console.log('User role ID:', roleId);
    return Object.values(UserRole).includes(roleId) ? (roleId as UserRole) : null;
  }

  /**
   * Get user ID from token
   */
  getUserId(token: string): string | null {
    const decoded = this.decodeToken(token);
    return (
      decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || null
    );
  }

  /**
   * Get restaurant ID from token
   */
  getRestaurantId(token: string): string | null {
    const decoded = this.decodeToken(token);
    return decoded?.RestaurantId || null;
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token: string): boolean {
    try {
      if (!token || token === 'undefined' || token === 'null') return true;

      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) return true;

      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

  /**
   * Base64URL decode
   */
  private base64UrlDecode(str: string): string {
    // Add padding if needed
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    const pad = str.length % 4;
    if (pad) {
      if (pad === 1) {
        throw new Error(
          'InvalidLengthError: Input base64url string is the wrong length to determine padding'
        );
      }
      str += new Array(5 - pad).join('=');
    }
    return atob(str);
  }
}
