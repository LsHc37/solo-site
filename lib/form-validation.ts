/**
 * Form Validation Utilities
 * Provides reusable validation functions for client-side form feedback
 */

// Email regex pattern
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password requirements regex patterns
const HAS_UPPER = /[A-Z]/;
const HAS_NUMBER = /\d/;
const HAS_SPECIAL = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

export interface ValidationError {
  field: string;
  message: string;
}

export interface FieldErrors {
  [key: string]: string | null;
}

/**
 * Validates email format
 */
export function validateEmail(email: string): string | null {
  if (!email.trim()) {
    return "Email is required";
  }
  if (!EMAIL_REGEX.test(email)) {
    return "Please enter a valid email address";
  }
  return null;
}

/**
 * Validates password strength
 * Requirements: min 8 chars, 1 uppercase, 1 number, 1 special character
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
  score: number;
} {
  const errors: string[] = [];
  let score = 0;

  if (!password) {
    return { isValid: false, errors: ["Password is required"], score: 0 };
  }

  if (password.length < 8) {
    errors.push("At least 8 characters");
  } else {
    score += 25;
  }

  if (!HAS_UPPER.test(password)) {
    errors.push("At least 1 uppercase letter");
  } else {
    score += 25;
  }

  if (!HAS_NUMBER.test(password)) {
    errors.push("At least 1 number");
  } else {
    score += 25;
  }

  if (!HAS_SPECIAL.test(password)) {
    errors.push("At least 1 special character (!@#$%^&*)");
  } else {
    score += 25;
  }

  return {
    isValid: errors.length === 0,
    errors,
    score,
  };
}

/**
 * Validates simple password (for login) - min 8 chars
 */
export function validatePassword(password: string): string | null {
  if (!password) {
    return "Password is required";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }
  return null;
}

/**
 * Validates text length (min/max)
 */
export function validateLength(
  value: string,
  minLength: number,
  maxLength: number,
  fieldName: string = "This field"
): string | null {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return `${fieldName} is required`;
  }

  if (trimmed.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }

  if (trimmed.length > maxLength) {
    return `${fieldName} must be at most ${maxLength} characters`;
  }

  return null;
}

/**
 * Validates required field
 */
export function validateRequired(value: string, fieldName: string = "This field"): string | null {
  if (!value.trim()) {
    return `${fieldName} is required`;
  }
  return null;
}

/**
 * Get password strength color (for UI feedback)
 */
export function getPasswordStrengthColor(score: number): string {
  if (score === 0) return "#8B949E"; // gray - no input
  if (score < 50) return "#EF4444"; // red - weak
  if (score < 75) return "#F59916"; // orange - fair
  return "#10B981"; // green - strong
}

/**
 * Get password strength label
 */
export function getPasswordStrengthLabel(score: number): string {
  if (score === 0) return "";
  if (score < 50) return "Weak";
  if (score < 75) return "Fair";
  return "Strong";
}
