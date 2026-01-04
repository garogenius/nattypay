/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * WebAuthn Service for Biometric Authentication
 * Supports Fingerprint and Face ID authentication on web browsers
 */

// Storage keys
const CREDENTIAL_ID_KEY = "nattypay_credential_id";
const USER_ID_KEY = "nattypay_user_id";

export interface WebAuthnAssertion {
  credentialId: string; // base64url
  rawId: ArrayBuffer;
  response: {
    clientDataJSON: ArrayBuffer;
    authenticatorData: ArrayBuffer;
    signature: ArrayBuffer;
    userHandle: ArrayBuffer | null;
  };
}

export interface WebAuthnRegistrationResult {
  credentialId: string; // base64url
  rawId: ArrayBuffer;
  // COSE public key (CBOR encoded), base64url
  publicKey: string;
  publicKeyBase64?: string; // Optional base64 encoded public key
}

export interface WebAuthnRegistrationOptions {
  userId: string;
  username: string;
  displayName: string;
}

/**
 * Check if WebAuthn is supported in the current browser
 */
export const isWebAuthnSupported = (): boolean => {
  if (typeof window === "undefined") return false;
  return (
    typeof window.PublicKeyCredential !== "undefined" &&
    typeof navigator.credentials !== "undefined" &&
    typeof navigator.credentials.create !== "undefined"
  );
};

/**
 * Check if platform authenticator (biometric) is available
 */
export const isPlatformAuthenticatorAvailable = async (): Promise<boolean> => {
  if (!isWebAuthnSupported()) return false;

  try {
    const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    return available;
  } catch {
    return false;
  }
};

/**
 * Register a new biometric credential for a user
 */
export const registerBiometric = async (
  options: WebAuthnRegistrationOptions
): Promise<WebAuthnRegistrationResult> => {
  if (!isWebAuthnSupported()) {
    throw new Error("WebAuthn is not supported in this browser");
  }

  const isAvailable = await isPlatformAuthenticatorAvailable();
  if (!isAvailable) {
    throw new Error("Biometric authentication is not available on this device");
  }

  try {
    // Convert userId to ArrayBuffer
    const userIdBuffer = new TextEncoder().encode(options.userId);

    // Create credential creation options
    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rp: {
        name: "NattyPay",
        id: window.location.hostname,
      },
      user: {
        id: userIdBuffer,
        name: options.username,
        displayName: options.displayName,
      },
      pubKeyCredParams: [{ alg: -7, type: "public-key" }], // ES256
      authenticatorSelection: {
        authenticatorAttachment: "platform", // Use platform authenticator (biometric)
        userVerification: "required",
      },
      timeout: 60000,
      attestation: "direct",
    };

    // Create credential
    const credential = (await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    })) as PublicKeyCredential | null;

    if (!credential) {
      throw new Error("Failed to create credential");
    }

    const credentialId = arrayBufferToBase64Url(credential.rawId);

    // Extract public key (COSE), base64url
    const attestation = credential.response as AuthenticatorAttestationResponse;
    const cosePublicKey = extractCosePublicKey(attestation);
    const publicKeyBase64 = arrayBufferToBase64Url(cosePublicKey);
    
    // Convert COSE public key to PEM format
    const publicKeyPem = convertCoseToPem(cosePublicKey);

    // Store credential ID and user ID (device-local only)
    localStorage.setItem(CREDENTIAL_ID_KEY, credentialId);
    localStorage.setItem(USER_ID_KEY, options.userId);

    return { credentialId, rawId: credential.rawId, publicKey: publicKeyPem, publicKeyBase64 };
  } catch (error: any) {
    // Handle specific WebAuthn errors
    if (error.name === "NotAllowedError" || error.name === "AbortError") {
      throw new Error("Biometric setup was cancelled. Please try again when ready.");
    }
    if (error.name === "InvalidStateError") {
      throw new Error("A biometric credential already exists. Please remove it first and try again.");
    }
    if (error.name === "NotSupportedError") {
      throw new Error("Biometric authentication is not supported on this device or browser.");
    }
    if (error.name === "SecurityError") {
      throw new Error("Security error occurred. Please ensure you're using HTTPS and try again.");
    }
    if (error.name === "UnknownError") {
      throw new Error("An unknown error occurred during biometric setup. Please try again.");
    }
    
    // Re-throw with original message if it's already a user-friendly error
    if (error.message && typeof error.message === "string") {
      throw error;
    }
    
    throw new Error(error.message || "Failed to register biometric authentication");
  }
};

/**
 * Authenticate using biometric credential
 */
export const authenticateBiometric = async (
  challenge: string, // base64/base64url encoded challenge from backend
  credentialId?: string
): Promise<WebAuthnAssertion> => {
  if (!isWebAuthnSupported()) {
    throw new Error("WebAuthn is not supported in this browser");
  }

  const isAvailable = await isPlatformAuthenticatorAvailable();
  if (!isAvailable) {
    throw new Error("Biometric authentication is not available on this device");
  }

  try {
    // Get stored credential ID if not provided
    const storedCredentialId = credentialId || localStorage.getItem(CREDENTIAL_ID_KEY);
    if (!storedCredentialId) {
      throw new Error("No biometric credential found. Please register first.");
    }

    // Convert credential ID + challenge to ArrayBuffer
    const credentialIdBuffer = base64UrlToArrayBufferLoose(storedCredentialId);
    const challengeBuffer = base64UrlToArrayBufferLoose(challenge);

    // Create authentication options
    const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
      challenge: challengeBuffer,
      allowCredentials: [
        {
          id: credentialIdBuffer,
          type: "public-key",
          transports: ["internal"], // Platform authenticator
        },
      ],
      userVerification: "required",
      timeout: 60000,
    };

    // Authenticate
    const assertion = (await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions,
    })) as PublicKeyCredential | null;

    if (!assertion) {
      throw new Error("Biometric authentication failed");
    }

    // Convert response to a serializable format
    const response = assertion.response as AuthenticatorAssertionResponse;

    return {
      credentialId: storedCredentialId,
      rawId: assertion.rawId,
      response: {
        clientDataJSON: response.clientDataJSON,
        authenticatorData: response.authenticatorData,
        signature: response.signature,
        userHandle: response.userHandle,
      },
    };
  } catch (error: any) {
    // SECURITY: Don't log sensitive error details
    if (error.name === "NotAllowedError") {
      throw new Error("Biometric authentication was cancelled or denied");
    }
    if (error.name === "InvalidStateError") {
      throw new Error("Biometric credential is already registered or invalid");
    }
    throw new Error(error.message || "Failed to authenticate with biometric");
  }
};

/**
 * Check if user has registered biometric credentials
 */
export const hasBiometricCredential = (): boolean => {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(CREDENTIAL_ID_KEY);
};

/**
 * Get stored user ID
 */
export const getStoredUserId = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_ID_KEY);
};

/**
 * Clear stored biometric credentials
 */
export const clearBiometricCredentials = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CREDENTIAL_ID_KEY);
  localStorage.removeItem(USER_ID_KEY);
};

/**
 * Helper: Convert ArrayBuffer to base64url (no padding)
 */
export const arrayBufferToBase64Url = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

/**
 * Helper: Convert base64/base64url to ArrayBuffer (tolerant)
 */
export const base64UrlToArrayBufferLoose = (input: string): ArrayBuffer => {
  const base64 = normalizeToBase64(input);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

const normalizeToBase64 = (input: string): string => {
  // Accept base64url or base64; add padding if missing
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? 0 : 4 - (b64.length % 4);
  return b64 + "=".repeat(pad);
};

/**
 * Get biometric type (fingerprint or face)
 * Attempts to detect the available biometric type, but may return "unknown" if detection fails
 */
export const getBiometricType = async (): Promise<"fingerprint" | "face" | "unknown"> => {
  if (!isWebAuthnSupported()) return "unknown";

  try {
    // Check user agent to determine likely biometric type
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Try to detect from device capabilities if available
    // Some browsers expose biometric type information
    if ((navigator as any).credentials && (navigator as any).credentials.get) {
      try {
        // Check if we can determine from available authenticators
        // This is a best-effort detection
      } catch {
        // Ignore errors, fall back to user agent detection
      }
    }
    
    // iOS devices: iPhone X and later use Face ID, older devices use Touch ID
    if (/iphone|ipad|ipod/.test(userAgent)) {
      // Try to detect iPhone model from user agent
      // iPhone X (2017) and later typically have Face ID
      // iPhone 8 and earlier have Touch ID
      const match = userAgent.match(/iphone\s*os\s*(\d+)/i);
      if (match) {
        const iosVersion = parseInt(match[1], 10);
        // iOS 11+ with newer devices typically have Face ID
        // But we can't reliably detect device model, so we'll check for newer iOS versions
        if (iosVersion >= 11) {
          // Check for iPhone model indicators (iPhone X, 11, 12, etc.)
          // iPhone X was released with iOS 11, so devices on iOS 11+ might have Face ID
          // However, this is not 100% accurate, so we default to "face" for newer iOS
          return "face";
        }
      }
      // Default to "face" for iOS devices (most modern iPhones/iPads have Face ID)
      return "face";
    }
    
    // Android devices typically use fingerprint sensors
    if (/android/.test(userAgent)) {
      return "fingerprint";
    }
    
    // Windows Hello supports both fingerprint and face recognition
    // We can't detect which one is available, so default to fingerprint
    if (/windows/.test(userAgent)) {
      return "fingerprint";
    }
    
    // macOS uses Touch ID (fingerprint) on supported devices
    if (/mac/.test(userAgent)) {
      return "fingerprint";
    }
    
    // Chrome OS and Linux might have either
    // Default to fingerprint as it's more common
    return "fingerprint";
  } catch {
    return "unknown";
  }
};

/**
 * Extract COSE public key bytes from attestation response.
 * - Prefers built-in `getPublicKey()` if available (WebAuthn L2+).
 * - Falls back to parsing `attestationObject` authData (CBOR) to locate the COSE key.
 *
 * SECURITY: We only extract the public key; private key stays in the authenticator.
 */
const extractCosePublicKey = (attestation: AuthenticatorAttestationResponse): ArrayBuffer => {
  // Modern browsers may support this directly (WebAuthn Level 2+)
  // Try getPublicKey() first as it's more reliable than manual extraction
  const maybeGetPublicKey = (attestation as any).getPublicKey as undefined | (() => ArrayBuffer | CryptoKey);
  if (typeof maybeGetPublicKey === "function") {
    try {
      const pk = maybeGetPublicKey.call(attestation);
      if (pk) {
        // If it returns an ArrayBuffer, use it directly
        if (pk instanceof ArrayBuffer) {
          if (pk.byteLength > 0) {
            return pk;
          }
        }
        // If it returns a CryptoKey, we'd need to export it, but for now fall through
        // Most implementations return ArrayBuffer for COSE key
        if (pk instanceof CryptoKey) {
          console.warn("getPublicKey() returned CryptoKey, falling back to manual extraction");
        }
      }
    } catch (error: any) {
      // Fall through to manual extraction
      console.warn("getPublicKey() failed, falling back to manual extraction:", error?.message || error);
    }
  }

  // Manual extraction from attestationObject
  const attestationObject = attestation.attestationObject;
  if (!attestationObject || attestationObject.byteLength === 0) {
    throw new Error("Invalid attestation object: empty or null");
  }

  let decoded: any;
  try {
    decoded = cborDecodeFirst(attestationObject);
  } catch (error: any) {
    throw new Error(`Failed to decode attestation object: ${error.message}`);
  }

  if (!decoded || typeof decoded !== "object") {
    throw new Error(`Invalid attestation object structure: expected object, got ${typeof decoded}`);
  }

  // Extract authData - it can be under "authData" key or directly in the object
  const authData = decoded.authData ?? decoded["authData"];
  
  if (!(authData instanceof Uint8Array)) {
    const availableKeys = Object.keys(decoded).join(", ");
    throw new Error(
      `Failed to extract authData from attestation object. ` +
      `Expected Uint8Array, got ${typeof authData}. ` +
      `Available keys: ${availableKeys || "none"}`
    );
  }

  try {
    // Extract the COSE key bytes from authData
    // This function validates that we're extracting a complete CBOR-encoded map
    const coseKeyBytes = extractCoseKeyFromAuthData(authData);
    
    // Create a new ArrayBuffer (not SharedArrayBuffer) and copy the data
    // This ensures we have a clean, independent buffer for the COSE key
    const buffer = new ArrayBuffer(coseKeyBytes.byteLength);
    new Uint8Array(buffer).set(coseKeyBytes);
    
    // Note: Full validation of COSE key structure happens in convertCoseToPem()
    // where we decode and validate all required fields (kty, alg, crv, x, y)
    
    return buffer;
  } catch (error: any) {
    // Provide detailed diagnostic information
    const errorMessage = error.message || String(error);
    const authDataHex = Array.from(authData.slice(0, Math.min(100, authData.byteLength)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join(' ');
    
    throw new Error(
      `Failed to extract COSE key from authData: ${errorMessage}. ` +
      `AuthData length: ${authData.byteLength} bytes. ` +
      `First 100 bytes (hex): ${authDataHex}... ` +
      `This usually indicates the attestationObject or authData is malformed. ` +
      `If this persists, try using a different browser or device.`
    );
  }
};

/**
 * Convert COSE public key (CBOR) to PEM format
 * For ES256 (ECDSA P-256), extracts x and y coordinates and converts to ASN.1 DER
 * 
 * COSE Key Structure for ES256 (EC2):
 * {
 *   1: 2,        // kty: EC2 (Elliptic Curve Key Type 2)
 *   3: -7,       // alg: ES256 (ECDSA with SHA-256)
 *   -1: 1,       // crv: P-256 (NIST P-256 curve)
 *   -2: <x>,     // x coordinate (32 bytes for P-256)
 *   -3: <y>      // y coordinate (32 bytes for P-256)
 * }
 */
const convertCoseToPem = (coseKeyBuffer: ArrayBuffer): string => {
  if (!coseKeyBuffer || coseKeyBuffer.byteLength === 0) {
    throw new Error("Invalid COSE key buffer: empty or null");
  }

  // Decode CBOR to get COSE key object
  // CRITICAL: Do NOT JSON-stringify or cast buffers before decoding
  let coseKey: any;
  try {
    coseKey = cborDecodeFirst(coseKeyBuffer);
  } catch (error: any) {
    throw new Error(
      `Failed to decode COSE key CBOR: ${error.message}. ` +
      `Buffer length: ${coseKeyBuffer.byteLength} bytes`
    );
  }

  // Debug: Log what we got (in development only)
  if (process.env.NODE_ENV === 'development') {
    console.log('[WebAuthn] COSE key decoded:', {
      type: typeof coseKey,
      isArray: Array.isArray(coseKey),
      isMap: coseKey instanceof Map,
      keys: coseKey instanceof Map ? Array.from(coseKey.keys()) : Object.keys(coseKey || {}),
      bufferLength: coseKeyBuffer.byteLength
    });
  }

  // Handle Map objects (some CBOR decoders return Maps)
  if (coseKey instanceof Map) {
    const mapObj: any = {};
    coseKey.forEach((value, key) => {
      // Store with both numeric and string keys for compatibility
      if (typeof key === "number") {
        mapObj[key] = value;
        mapObj[String(key)] = value;
        // For negative keys, also store as explicit negative string
        if (key < 0) {
          mapObj[String(key)] = value;
        }
      } else {
        mapObj[String(key)] = value;
      }
    });
    coseKey = mapObj;
  }

  // CRITICAL: Validate that we got an object (COSE keys MUST be maps/objects)
  if (coseKey === null || coseKey === undefined) {
    throw new Error(
      `Invalid COSE key structure: decoded value is null or undefined. ` +
      `Buffer length: ${coseKeyBuffer.byteLength} bytes. ` +
      `This indicates the credentialPublicKey is missing or corrupted.`
    );
  }

  if (typeof coseKey === "number") {
    throw new Error(
      `Invalid COSE key structure: CBOR decoder returned a number (${coseKey}) instead of a map. ` +
      `This usually means the buffer contains a single integer, not a COSE key map. ` +
      `Buffer length: ${coseKeyBuffer.byteLength} bytes. ` +
      `The credentialPublicKey must be a CBOR-encoded map, not a primitive value.`
    );
  }

  if (typeof coseKey === "string") {
    throw new Error(
      `Invalid COSE key structure: CBOR decoder returned a string instead of a map. ` +
      `Buffer length: ${coseKeyBuffer.byteLength} bytes. ` +
      `The credentialPublicKey must be a CBOR-encoded map, not a string.`
    );
  }

  if (Array.isArray(coseKey)) {
    throw new Error(
      `Invalid COSE key structure: CBOR decoder returned an array instead of a map. ` +
      `Buffer length: ${coseKeyBuffer.byteLength} bytes. ` +
      `The credentialPublicKey must be a CBOR-encoded map (object), not an array.`
    );
  }

  if (typeof coseKey !== "object") {
    const actualType = typeof coseKey;
    const actualValue = String(coseKey).substring(0, 100);
    throw new Error(
      `Invalid COSE key structure: expected object (map), got ${actualType}. ` +
      `Value: ${actualValue}. ` +
      `Buffer length: ${coseKeyBuffer.byteLength} bytes. ` +
      `The credentialPublicKey must be a CBOR-encoded map with COSE key fields.`
    );
  }

  // Validate that the object has at least some keys (empty objects are invalid)
  const keys = Object.keys(coseKey);
  if (keys.length === 0) {
    throw new Error(
      `Invalid COSE key structure: decoded map is empty (no key-value pairs). ` +
      `Buffer length: ${coseKeyBuffer.byteLength} bytes. ` +
      `A valid COSE key must contain at least kty (key type) and other required fields.`
    );
  }

  // Helper function to safely get COSE key field (handles numeric and string keys)
  // COSE uses integer keys that may be stored as numbers or strings in the decoded object
  const getCoseField = (key: number): any => {
    // Try numeric key first (most common case)
    if (key in coseKey && coseKey[key] !== undefined) {
      return coseKey[key];
    }
    // Try string representation (e.g., "1", "-1")
    const strKey = String(key);
    if (strKey in coseKey && coseKey[strKey] !== undefined) {
      return coseKey[strKey];
    }
    // For negative keys, also try with explicit negative string format
    if (key < 0) {
      // Already tried String(key) above, but try again for clarity
      const negKey = String(key);
      if (negKey in coseKey && coseKey[negKey] !== undefined) {
        return coseKey[negKey];
      }
    }
    return undefined;
  };

  // Extract COSE key fields
  // Required COSE fields for ES256 (P-256):
  //   1 (kty): Key type (must be 2 for EC2)
  //   3 (alg): Algorithm (must be -7 for ES256)
  //  -1 (crv): Curve (must be 1 for P-256)
  //  -2 (x): X coordinate (32 bytes for P-256)
  //  -3 (y): Y coordinate (32 bytes for P-256)
  const kty = getCoseField(1);
  const alg = getCoseField(3);
  const crv = getCoseField(-1);
  const x = getCoseField(-2);
  const y = getCoseField(-3);

  // Validate required COSE fields are present
  const missingFields: string[] = [];
  if (kty === undefined) missingFields.push("kty (1)");
  if (alg === undefined) missingFields.push("alg (3)");
  if (crv === undefined) missingFields.push("crv (-1)");
  if (x === undefined) missingFields.push("x (-2)");
  if (y === undefined) missingFields.push("y (-3)");

  if (missingFields.length > 0) {
    const allKeys = Object.keys(coseKey);
    const allEntries = Object.entries(coseKey).map(([k, v]) => {
      if (v instanceof Uint8Array) {
        return `${k}: Uint8Array(${v.length})`;
      }
      return `${k}: ${typeof v} = ${JSON.stringify(v)}`;
    }).join(", ");
    
    // Also check for numeric keys that might not show up in Object.keys
    const numericKeys: string[] = [];
    for (const key in coseKey) {
      if (!isNaN(Number(key))) {
        numericKeys.push(key);
      }
    }
    
    throw new Error(
      `Invalid COSE key: missing required fields: ${missingFields.join(", ")}. ` +
      `A valid COSE key for ES256 (P-256) must contain: kty (1), alg (3), crv (-1), x (-2), y (-3). ` +
      `Found keys: ${allKeys.length > 0 ? allKeys.join(", ") : "none"}. ` +
      `Numeric keys: ${numericKeys.length > 0 ? numericKeys.join(", ") : "none"}. ` +
      `Key values: ${allEntries || "none"}. ` +
      `Buffer length: ${coseKeyBuffer.byteLength} bytes. ` +
      `This indicates the credentialPublicKey is incomplete or malformed.`
    );
  }
  
  // Validate key type (kty = 2 means EC2 - Elliptic Curve Key Type 2)
  if (kty !== 2) {
    throw new Error(
      `Unsupported key type: ${kty}. Expected EC2 (2). ` +
      `Found keys: ${Object.keys(coseKey).join(", ")}. ` +
      `Algorithm: ${alg}, Curve: ${crv}`
    );
  }
  
  // Validate algorithm (alg = -7 means ES256 - ECDSA with SHA-256)
  if (alg !== -7) {
    throw new Error(
      `Unsupported algorithm: ${alg}. Expected ES256 (-7). ` +
      `Key type: ${kty}, Curve: ${crv}. ` +
      `Only ES256 (ECDSA with SHA-256) is supported for P-256 curve.`
    );
  }
  
  // Validate curve (crv = 1 means P-256 - NIST P-256)
  if (crv !== 1) {
    throw new Error(
      `Unsupported curve: ${crv}. Expected P-256 (1). ` +
      `Key type: ${kty}, Algorithm: ${alg}. ` +
      `Only P-256 (NIST P-256) curve is supported.`
    );
  }
  
  // Validate coordinates
  if (!(x instanceof Uint8Array)) {
    throw new Error(
      `Invalid COSE key: x coordinate is not a Uint8Array. ` +
      `Type: ${typeof x}, Value: ${x}. ` +
      `Expected 32 bytes for P-256 curve.`
    );
  }
  
  if (!(y instanceof Uint8Array)) {
    throw new Error(
      `Invalid COSE key: y coordinate is not a Uint8Array. ` +
      `Type: ${typeof y}, Value: ${y}. ` +
      `Expected 32 bytes for P-256 curve.`
    );
  }
  
  // Validate coordinate lengths (P-256 uses 32-byte coordinates)
  if (x.length !== 32 || y.length !== 32) {
    throw new Error(
      `Invalid coordinate length: x=${x.length} bytes, y=${y.length} bytes. ` +
      `Expected 32 bytes each for P-256 curve.`
    );
  }
  
  // Convert to uncompressed point format (0x04 || x || y)
  const pointLength = 1 + x.length + y.length; // 1 byte prefix + x + y
  const point = new Uint8Array(pointLength);
  point[0] = 0x04; // Uncompressed point format
  point.set(x, 1);
  point.set(y, 1 + x.length);
  
  // ASN.1 DER encoding for EC public key
  // SEQUENCE {
  //   SEQUENCE {
  //     OBJECT IDENTIFIER ecPublicKey (1.2.840.10045.2.1)
  //     OBJECT IDENTIFIER prime256v1 (1.2.840.10045.3.1.7)
  //   }
  //   BIT STRING (point)
  // }
  
  // AlgorithmIdentifier: OID for ecPublicKey (1.2.840.10045.2.1) and prime256v1 (1.2.840.10045.3.1.7)
  const ecPublicKeyOid = new Uint8Array([0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01]); // 1.2.840.10045.2.1
  const prime256v1Oid = new Uint8Array([0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07]); // 1.2.840.10045.3.1.7
  
  // Inner SEQUENCE (AlgorithmIdentifier)
  const algSeqLength = ecPublicKeyOid.length + prime256v1Oid.length;
  const algSeq = new Uint8Array(2 + algSeqLength);
  algSeq[0] = 0x30; // SEQUENCE
  algSeq[1] = algSeqLength;
  algSeq.set(ecPublicKeyOid, 2);
  algSeq.set(prime256v1Oid, 2 + ecPublicKeyOid.length);
  
  // BIT STRING (point with unused bits = 0)
  const bitStringLength = 1 + point.length; // 1 byte for unused bits + point
  const bitString = new Uint8Array(2 + bitStringLength);
  bitString[0] = 0x03; // BIT STRING
  bitString[1] = bitStringLength;
  bitString[2] = 0x00; // unused bits
  bitString.set(point, 3);
  
  // Outer SEQUENCE
  const outerSeqLength = algSeq.length + bitString.length;
  const outerSeq = new Uint8Array(2 + outerSeqLength);
  outerSeq[0] = 0x30; // SEQUENCE
  outerSeq[1] = outerSeqLength;
  outerSeq.set(algSeq, 2);
  outerSeq.set(bitString, 2 + algSeq.length);
  
  // Convert to base64 and add PEM headers
  const base64 = btoa(String.fromCharCode(...outerSeq));
  const pemLines = [];
  pemLines.push("-----BEGIN PUBLIC KEY-----");
  for (let i = 0; i < base64.length; i += 64) {
    pemLines.push(base64.slice(i, i + 64));
  }
  pemLines.push("-----END PUBLIC KEY-----");
  
  return pemLines.join("\n");
};

/**
 * Parse WebAuthn authData and return the raw COSE key bytes.
 * authData format:
 * rpIdHash(32) + flags(1) + signCount(4) + [attestedCredentialData if flags AT=1]
 * 
 * attestedCredentialData format (when AT flag is set):
 * aaguid(16) + credentialIdLength(2) + credentialId(n) + credentialPublicKey(CBOR)
 */
const extractCoseKeyFromAuthData = (authData: Uint8Array): Uint8Array => {
  if (authData.byteLength < 37) {
    throw new Error(`Invalid authenticator data: too short (${authData.byteLength} bytes, minimum 37)`);
  }

  // Check AT (Attested Credential Data) flag (bit 6)
  const flags = authData[32];
  const hasAttestedCredData = (flags & 0x40) !== 0;
  
  if (!hasAttestedCredData) {
    throw new Error(
      `Authenticator data missing attested credential data. ` +
      `Flags byte: 0x${flags.toString(16).padStart(2, "0")} (AT flag not set)`
    );
  }

  let offset = 37; // 32 rpIdHash + 1 flags + 4 signCount
  
  // aaguid (16 bytes)
  if (offset + 16 > authData.byteLength) {
    throw new Error(`Invalid authenticator data: aaguid out of bounds (offset: ${offset}, length: ${authData.byteLength})`);
  }
  offset += 16;

  // credentialIdLength (2 bytes, big-endian per WebAuthn spec)
  if (offset + 2 > authData.byteLength) {
    throw new Error(`Invalid authenticator data: credentialIdLength out of bounds (offset: ${offset}, length: ${authData.byteLength})`);
  }
  
  // Read as big-endian (WebAuthn standard)
  const credIdLenBE = (authData[offset] << 8) | authData[offset + 1];
  // Also try little-endian as fallback (some implementations might use it incorrectly)
  const credIdLenLE = (authData[offset + 1] << 8) | authData[offset];
  
  // Use big-endian first, but validate both
  let credIdLen = credIdLenBE;
  let usedLittleEndian = false;
  
  // If big-endian gives unreasonable value but little-endian is reasonable, try little-endian
  if ((credIdLenBE < 0 || credIdLenBE > 1024) && credIdLenLE >= 0 && credIdLenLE <= 1024) {
    credIdLen = credIdLenLE;
    usedLittleEndian = true;
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[WebAuthn] Using little-endian credentialId length (${credIdLenLE}) instead of big-endian (${credIdLenBE})`);
    }
  }
  
  offset += 2;
  
  // Validate credentialId length is reasonable (should be between 0 and 1024 bytes typically)
  if (credIdLen < 0 || credIdLen > 1024) {
    throw new Error(
      `Invalid credentialId length: ${credIdLen} (BE: ${credIdLenBE}, LE: ${credIdLenLE}). ` +
      `Expected length between 0 and 1024 bytes. ` +
      `This may indicate corrupted authenticator data or non-standard encoding.`
    );
  }
  
  // credentialId (variable length)
  if (offset + credIdLen > authData.byteLength) {
    throw new Error(
      `Invalid authenticator data: credentialId out of bounds. ` +
      `Length: ${credIdLen}, Offset: ${offset}, Total: ${authData.byteLength}`
    );
  }
  
  // Debug: Log credentialId info in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[WebAuthn] CredentialId extraction:', {
      credIdLen,
      offsetBeforeCredId: offset,
      offsetAfterCredId: offset + credIdLen,
      authDataLength: authData.byteLength,
      remainingBytes: authData.byteLength - (offset + credIdLen),
      nextByte: offset + credIdLen < authData.byteLength ? `0x${authData[offset + credIdLen].toString(16).padStart(2, '0')}` : 'out of bounds'
    });
  }
  
  offset += credIdLen;
  
  // Remaining bytes should be the CBOR-encoded COSE public key
  if (offset >= authData.byteLength) {
    throw new Error(
      `Invalid authenticator data: no public key data found. ` +
      `Offset: ${offset}, Length: ${authData.byteLength}`
    );
  }

  // Validate that we're at a CBOR map marker (major type 5)
  // CBOR map markers: 0xa0-0xbf (definite-length maps with 0-23 pairs)
  // or 0xb8-0xbb (definite-length maps with 24-bit, 32-bit, 64-bit length)
  const firstByte = authData[offset];
  const majorType = (firstByte >> 5) & 0x07;
  const isMapMarker = majorType === 5;
  
  if (!isMapMarker) {
    // Try to find the map marker by scanning ahead (sometimes there's padding or extra bytes)
    // Also try scanning backwards in case credentialId length was misread
    let foundMap = false;
    let scanOffset = offset;
    const maxScanForward = Math.min(offset + 50, authData.byteLength); // Scan up to 50 bytes ahead
    const maxScanBackward = Math.max(offset - 10, 37 + 16 + 2); // Don't go before credentialId length field
    
    // Store original offset for logging
    const originalOffset = offset;
    
    // First try scanning forward
    while (scanOffset < maxScanForward) {
      const scanByte = authData[scanOffset];
      const scanMajorType = (scanByte >> 5) & 0x07;
      if (scanMajorType === 5) {
        offset = scanOffset;
        foundMap = true;
        if (process.env.NODE_ENV === 'development') {
          console.log(`[WebAuthn] Found map marker ${scanOffset - originalOffset} bytes after expected position`);
        }
        break;
      }
      scanOffset++;
    }
    
    // If not found forward, try scanning backward (in case credentialId length was misread)
    if (!foundMap) {
      scanOffset = originalOffset - 1;
      while (scanOffset >= maxScanBackward) {
        const scanByte = authData[scanOffset];
        const scanMajorType = (scanByte >> 5) & 0x07;
        if (scanMajorType === 5) {
          offset = scanOffset;
          foundMap = true;
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[WebAuthn] Found map marker ${originalOffset - scanOffset} bytes before expected position - credentialId length may be incorrect`);
          }
          break;
        }
        scanOffset--;
      }
    }
    
    if (!foundMap) {
      const hexBytes = Array.from(authData.slice(offset, Math.min(offset + 20, authData.byteLength)))
        .map(b => `0x${b.toString(16).padStart(2, '0')}`)
        .join(' ');
      throw new Error(
        `Invalid COSE key: expected CBOR map marker at offset ${offset}, but found major type ${majorType} (byte: 0x${firstByte.toString(16).padStart(2, '0')}). ` +
        `COSE keys must start with a CBOR map (major type 5, bytes 0xa0-0xbf). ` +
        `First 20 bytes at offset: ${hexBytes}. ` +
        `This suggests the credentialId length may be incorrect or there's extra data before the COSE key. ` +
        `CredentialId length: ${credIdLen}, Offset before scan: ${offset - credIdLen - 2}`
      );
    }
  }

  // Decode the COSE key CBOR to validate it's a map and determine its exact length
  let coseKeyStart = offset;
  let coseKeyEnd: number;
  let decodedCoseKey: any;
  
  try {
    const decoded = cborDecodeAny(authData, offset);
    coseKeyEnd = decoded.nextOffset;
    decodedCoseKey = decoded.value;
    
    // CRITICAL: Validate that we decoded a map (COSE keys MUST be maps)
    if (typeof decodedCoseKey !== "object" || decodedCoseKey === null || Array.isArray(decodedCoseKey)) {
      const actualType = decodedCoseKey === null ? "null" : Array.isArray(decodedCoseKey) ? "array" : typeof decodedCoseKey;
      const actualValue = typeof decodedCoseKey === "number" ? decodedCoseKey : 
                         typeof decodedCoseKey === "string" ? `"${decodedCoseKey.substring(0, 50)}"` : 
                         String(decodedCoseKey).substring(0, 100);
      throw new Error(
        `Invalid COSE key structure: expected map (object), got ${actualType}. ` +
        `Value: ${actualValue}. ` +
        `This indicates the credentialPublicKey is not properly formatted. ` +
        `Offset: ${offset}, First byte: 0x${authData[offset]?.toString(16).padStart(2, '0')}, ` +
        `CredentialId length: ${credIdLen}`
      );
    }
    
    // Validate it's actually a map (has key-value pairs, not just an empty object)
    const keys = Object.keys(decodedCoseKey);
    if (keys.length === 0) {
      throw new Error(
        `Invalid COSE key: decoded map is empty. ` +
        `This indicates the credentialPublicKey is malformed.`
      );
    }
    
    if (coseKeyEnd <= coseKeyStart) {
      throw new Error(`Invalid CBOR decoding: nextOffset (${coseKeyEnd}) <= start offset (${coseKeyStart})`);
    }
    
    if (coseKeyEnd > authData.byteLength) {
      throw new Error(
        `CBOR decoding out of bounds: nextOffset (${coseKeyEnd}) > authData length (${authData.byteLength})`
      );
    }
  } catch (error: any) {
    throw new Error(
      `Failed to decode COSE key CBOR from authData: ${error.message}. ` +
      `Start offset: ${offset}, Remaining bytes: ${authData.byteLength - offset}, ` +
      `AuthData total length: ${authData.byteLength}`
    );
  }

  // Extract the complete COSE key bytes (the full CBOR-encoded map)
  const coseKeyBytes = authData.slice(coseKeyStart, coseKeyEnd);
  
  if (coseKeyBytes.length === 0) {
    throw new Error(
      `Extracted COSE key is empty. ` +
      `Start: ${coseKeyStart}, End: ${coseKeyEnd}, Length: ${coseKeyEnd - coseKeyStart}`
    );
  }

  // Double-check: decode again to ensure we extracted the complete map
  try {
    const verifyDecode = cborDecodeFirst(coseKeyBytes.buffer);
    if (typeof verifyDecode !== "object" || verifyDecode === null || Array.isArray(verifyDecode)) {
      throw new Error(
        `Extracted COSE key bytes do not decode to a map: got ${Array.isArray(verifyDecode) ? "array" : typeof verifyDecode}`
      );
    }
  } catch (verifyError: any) {
    throw new Error(
      `Failed to verify extracted COSE key: ${verifyError.message}. ` +
      `Extracted bytes length: ${coseKeyBytes.length}`
    );
  }

  return coseKeyBytes;
};

/**
 * Minimal CBOR decoder (enough for WebAuthn attestationObject + COSE key parsing).
 * Supports definite-length items only.
 */
const cborDecodeFirst = (data: ArrayBuffer): any => {
  const bytes = new Uint8Array(data);
  const { value } = cborDecodeAny(bytes, 0);
  return value;
};

const cborDecodeAny = (
  bytes: Uint8Array,
  offset: number
): { value: any; nextOffset: number } => {
  if (offset >= bytes.length) throw new Error("CBOR: unexpected end of buffer");
  const initial = bytes[offset++];
  const majorType = initial >> 5;
  const additional = initial & 0x1f;

  const readLength = (): { length: number; nextOffset: number } => {
    if (additional < 24) return { length: additional, nextOffset: offset };
    if (additional === 24) return { length: bytes[offset++], nextOffset: offset };
    if (additional === 25) {
      const length = (bytes[offset] << 8) | bytes[offset + 1];
      offset += 2;
      return { length, nextOffset: offset };
    }
    if (additional === 26) {
      const length =
        (bytes[offset] * 2 ** 24) +
        (bytes[offset + 1] << 16) +
        (bytes[offset + 2] << 8) +
        bytes[offset + 3];
      offset += 4;
      return { length, nextOffset: offset };
    }
    // We intentionally do not support 64-bit lengths or indefinite length for our use-case.
    throw new Error("CBOR: unsupported length encoding");
  };

  const readInt = (): { value: number; nextOffset: number } => {
    const { length, nextOffset } = readLength();
    return { value: length, nextOffset };
  };

  switch (majorType) {
    case 0: { // unsigned int
      const { value, nextOffset } = readInt();
      return { value, nextOffset };
    }
    case 1: { // negative int
      const { value, nextOffset } = readInt();
      return { value: -1 - value, nextOffset };
    }
    case 2: { // byte string
      const { length } = readLength();
      const end = offset + length;
      if (end > bytes.length) throw new Error("CBOR: byte string out of range");
      const value = bytes.slice(offset, end);
      offset = end;
      return { value, nextOffset: offset };
    }
    case 3: { // text string
      const { length } = readLength();
      const end = offset + length;
      if (end > bytes.length) throw new Error("CBOR: text string out of range");
      const value = new TextDecoder().decode(bytes.slice(offset, end));
      offset = end;
      return { value, nextOffset: offset };
    }
    case 4: { // array
      const { length } = readLength();
      const arr: any[] = [];
      for (let i = 0; i < length; i++) {
        const decoded = cborDecodeAny(bytes, offset);
        arr.push(decoded.value);
        offset = decoded.nextOffset;
      }
      return { value: arr, nextOffset: offset };
    }
    case 5: { // map
      const { length } = readLength();
      const map: any = {};
      for (let i = 0; i < length; i++) {
        const k = cborDecodeAny(bytes, offset);
        offset = k.nextOffset;
        const v = cborDecodeAny(bytes, offset);
        offset = v.nextOffset;
        
        // Store key in multiple formats for maximum compatibility
        const keyValue = k.value;
        const keyStr = String(keyValue);
        
        // Always store as string key
        map[keyStr] = v.value;
        
        // Also store as number if it's a valid integer (positive or negative)
        if (typeof keyValue === "number" && Number.isInteger(keyValue)) {
          map[keyValue] = v.value;
        }
        
        // For negative integers, also try storing with explicit negative string
        if (typeof keyValue === "number" && keyValue < 0) {
          map[String(keyValue)] = v.value; // e.g., "-1"
        }
      }
      
      // WebAuthn attestationObject needs authData under key "authData"
      // This is already handled by the string key storage above
      return { value: map, nextOffset: offset };
    }
    case 6: { // tag
      // Skip tag number and decode tagged item
      readLength();
      const inner = cborDecodeAny(bytes, offset);
      return { value: inner.value, nextOffset: inner.nextOffset };
    }
    case 7: { // simple / float
      if (additional === 20) return { value: false, nextOffset: offset };
      if (additional === 21) return { value: true, nextOffset: offset };
      if (additional === 22) return { value: null, nextOffset: offset };
      if (additional === 23) return { value: undefined, nextOffset: offset };
      throw new Error("CBOR: unsupported simple value");
    }
    default:
      throw new Error("CBOR: unsupported major type");
  }
};






