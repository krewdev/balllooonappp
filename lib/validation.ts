/**
 * Input validation and sanitization utilities
 */

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string | null | undefined): string {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .slice(0, 1000); // Limit length
}

/**
 * Validate and sanitize email
 */
export function validateEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  
  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(trimmed)) {
    return null;
  }
  
  // Limit length
  return trimmed.slice(0, 255);
}

/**
 * Validate and sanitize phone number
 */
export function validatePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // US phone numbers: 10 digits (with optional country code)
  if (digits.length === 10) {
    return digits;
  }
  
  // With country code (11 digits starting with 1)
  if (digits.length === 11 && digits.startsWith('1')) {
    return digits.slice(1); // Remove leading 1
  }
  
  return null;
}

/**
 * Validate and sanitize ZIP code
 */
export function validateZipCode(zipCode: string | null | undefined): string | null {
  if (!zipCode) return null;
  
  const trimmed = zipCode.trim();
  
  // US ZIP codes: 5 digits or 5+4 format
  const zipRegex = /^\d{5}(-\d{4})?$/;
  
  if (zipRegex.test(trimmed)) {
    return trimmed;
  }
  
  // Try to extract 5 digits
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length >= 5) {
    return digits.slice(0, 5);
  }
  
  return null;
}

/**
 * Validate and sanitize numeric input
 */
export function validateNumber(
  input: string | number | null | undefined,
  min?: number,
  max?: number
): number | null {
  if (input === null || input === undefined) return null;
  
  const num = typeof input === 'string' ? parseFloat(input) : input;
  
  if (isNaN(num) || !isFinite(num)) {
    return null;
  }
  
  if (min !== undefined && num < min) return null;
  if (max !== undefined && num > max) return null;
  
  return num;
}

/**
 * Validate password strength
 */
export function validatePassword(password: string | null | undefined): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!password) {
    return { valid: false, errors: ['Password is required'] };
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize text for display (removes potentially dangerous HTML)
 */
export function sanitizeText(input: string | null | undefined): string {
  if (!input) return '';
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 5000); // Limit length
}

