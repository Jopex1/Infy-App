export function normalizePhoneNumber(value, countryCode = "GH") {
  if (!value) return { normalized: "", isValid: false, error: "Phone number is required." };
  
  // Remove spaces, parentheses, dashes, etc.
  let cleaned = value.trim().replace(/[\s\-\(\)]+/g, "");

  if (countryCode === "GH") {
    // Standard formats handling for Ghana (+233)
    
    // 1. Remove leading +2330
    if (cleaned.startsWith("+2330")) {
      cleaned = "+233" + cleaned.slice(5);
    }
    // 2. Remove leading 2330
    else if (cleaned.startsWith("2330")) {
      cleaned = "+233" + cleaned.slice(4);
    }
    // 3. Add plus to 233
    else if (cleaned.startsWith("233")) {
      cleaned = "+" + cleaned;
    }
    // 4. Convert local 024... to +23324...
    else if (cleaned.startsWith("0")) {
      cleaned = "+233" + cleaned.slice(1);
    }
    // 5. Convert local 9-digit (e.g. 241234567) to +233241234567
    else if (/^\d{9}$/.test(cleaned)) {
      cleaned = "+233" + cleaned;
    }
    // 6. Generic fallback if they entered just the number without +
    else if (/^\d+$/.test(cleaned) && !cleaned.startsWith("+")) {
      cleaned = "+233" + cleaned;
    }

    // Standardized Ghana mobile number regex: +233 followed by exactly 9 digits
    // Ghana phone numbers (excluding country code) are 9 digits long: 24, 20, 50, 54, 55, 59, 27, 26, etc.
    const ghanaRegex = /^\+233\d{9}$/;
    if (!ghanaRegex.test(cleaned)) {
      return {
        normalized: cleaned,
        isValid: false,
        error: "Invalid Ghana mobile number. Please check and try again (expected 9 digits after country code)."
      };
    }
    return { normalized: cleaned, isValid: true };
  }

  // Future-proofing: E.164 standardization for other countries
  if (!cleaned.startsWith("+")) {
    cleaned = "+" + cleaned;
  }
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  if (!e164Regex.test(cleaned)) {
    return {
      normalized: cleaned,
      isValid: false,
      error: "Invalid international phone number format."
    };
  }

  return { normalized: cleaned, isValid: true };
}
