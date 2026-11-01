/**
 * Formatting and Validation Utilities for Emari Grill
 */

/**
 * Format an integer or float amount into Nigerian Naira currency representation.
 * E.g. 7000 -> "₦7,000"
 */
export function formatNaira(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₦0';
  }
  return `₦${Number(amount).toLocaleString('en-NG')}`;
}

/**
 * Cleans phone numbers to a uniform numeric string.
 * Strips whitespace, dashes, brackets, and leading + or 0 for uniform Nigerian comparison.
 */
export function cleanPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  // If starts with 234 and 13 digits (e.g. 2348012345678)
  if (digits.startsWith('234') && digits.length === 13) {
    return digits;
  }
  // If starts with 0 and 11 digits (e.g. 08012345678)
  if (digits.startsWith('0') && digits.length === 11) {
    return `234${digits.slice(1)}`;
  }
  // If 10 digits without leading 0 (e.g. 8012345678)
  if (digits.length === 10) {
    return `234${digits}`;
  }
  return digits;
}

/**
 * Validates whether an input string is a valid Nigerian phone number.
 * Accepts:
 *  - 080..., 081..., 070..., 090..., 091... (11 digits)
 *  - +23480..., +23481... (13 or 14 characters)
 *  - 23480... (13 digits)
 */
export function isValidNigerianPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const digits = phone.replace(/\D/g, '');

  // 11 digits starting with 07, 08, 09
  if (digits.length === 11 && /^0[789][01]\d{8}$/.test(digits)) {
    return true;
  }
  // 13 digits starting with 234 7, 8, 9
  if (digits.length === 13 && /^234[789][01]\d{8}$/.test(digits)) {
    return true;
  }
  // 10 digits starting with 7, 8, 9
  if (digits.length === 10 && /^[789][01]\d{8}$/.test(digits)) {
    return true;
  }

  // Broad check for 10-14 digits to not lock out edge networks
  return digits.length >= 10 && digits.length <= 14;
}

/**
 * Formats a phone number for human-friendly display: e.g. 0801 234 5678
 */
export function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('234') && digits.length === 13) {
    const local = `0${digits.slice(3)}`;
    return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
  }
  if (digits.length === 11) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  return phone;
}

/**
 * Generates a memorable short order code conforming to the spec (e.g. "IG-4821")
 */
export function generateOrderCode(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `IG-${randomNum}`;
}

/**
 * Builds a direct WhatsApp chat URL with prefilled URL-encoded message.
 * Compatible with mobile in-app browsers, WhatsApp app, and WhatsApp Web.
 */
export function getWhatsAppLink(phone: string, message: string): string {
  const cleanedPhone = cleanPhoneNumber(phone);
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanedPhone}?text=${encodedText}`;
}
