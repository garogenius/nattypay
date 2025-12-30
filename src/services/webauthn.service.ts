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
 */
export const getBiometricType = async (): Promise<"fingerprint" | "face" | "unknown"> => {
  if (!isWebAuthnSupported()) return "unknown";

  try {
    // Check user agent to determine likely biometric type
    const userAgent = navigator.userAgent.toLowerCase();
    
    // iOS devices typically use Face ID or Touch ID
    if (/iphone|ipad|ipod/.test(userAgent)) {
      // Newer iPhones use Face ID, older ones use Touch ID
      // We can't directly detect, so we'll default to "face" for newer devices
      return "face";
    }
    
    // Android devices typically use fingerprint
    if (/android/.test(userAgent)) {
      return "fingerprint";
    }
    
    // Desktop devices might have either
    // Windows Hello can be fingerprint or face
    if (/windows/.test(userAgent)) {
      return "fingerprint"; // Default to fingerprint for Windows
    }
    
    // macOS uses Touch ID (fingerprint)
    if (/mac/.test(userAgent)) {
      return "fingerprint";
    }
    
    return "unknown";
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
  // Modern browsers may support this directly
  const maybeGetPublicKey = (attestation as any).getPublicKey as undefined | (() => ArrayBuffer);
  if (typeof maybeGetPublicKey === "function") {
    const pk = maybeGetPublicKey.call(attestation);
    if (pk && pk.byteLength > 0) return pk;
  }

  const attestationObject = attestation.attestationObject;
  const decoded = cborDecodeFirst(attestationObject);
  const authData = decoded?.authData;
  if (!(authData instanceof Uint8Array)) {
    throw new Error("Failed to extract public key");
  }
  return extractCoseKeyFromAuthData(authData).buffer;
};

/**
 * Convert COSE public key (CBOR) to PEM format
 * For ES256 (ECDSA P-256), extracts x and y coordinates and converts to ASN.1 DER
 */
const convertCoseToPem = (coseKeyBuffer: ArrayBuffer): string => {
  const coseKey = cborDecodeFirst(coseKeyBuffer);
  
  // COSE key structure for ES256:
  // { 1: 2 (kty: EC2), 3: -7 (alg: ES256), -1: 1 (crv: P-256), -2: x, -3: y }
  // Note: CBOR decoder stores all map keys as strings, so:
  // - Positive integers: "1", "3"
  // - Negative integers: "-1", "-2", "-3"
  const kty = coseKey["1"] ?? coseKey[1];
  const crv = coseKey["-1"] ?? (coseKey as any)[-1];
  const x = coseKey["-2"] ?? (coseKey as any)[-2];
  const y = coseKey["-3"] ?? (coseKey as any)[-3];
  
  // Validate key type and curve
  if (kty !== 2) {
    throw new Error(`Unsupported key type: ${kty}. Expected EC2 (2). Found keys: ${Object.keys(coseKey).join(", ")}`);
  }
  
  if (crv !== 1) {
    throw new Error(`Unsupported curve: ${crv}. Expected P-256 (1). Found crv value: ${crv}`);
  }
  
  if (!(x instanceof Uint8Array) || !(y instanceof Uint8Array)) {
    throw new Error(`Invalid COSE key: missing x or y coordinates. x type: ${typeof x}, y type: ${typeof y}`);
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
 */
const extractCoseKeyFromAuthData = (authData: Uint8Array): Uint8Array => {
  if (authData.byteLength < 37) throw new Error("Invalid authenticator data");

  const flags = authData[32];
  const hasAttestedCredData = (flags & 0x40) !== 0;
  if (!hasAttestedCredData) throw new Error("Authenticator data missing attested credential data");

  let offset = 37; // 32 rpIdHash + 1 flags + 4 signCount
  // aaguid(16)
  offset += 16;
  if (offset + 2 > authData.byteLength) throw new Error("Invalid authenticator data");

  // credentialIdLength (2)
  const credIdLen = (authData[offset] << 8) | authData[offset + 1];
  offset += 2;
  // credentialId
  offset += credIdLen;
  if (offset >= authData.byteLength) throw new Error("Invalid authenticator data");

  // remaining bytes start with CBOR-encoded COSE key. Decode one CBOR item to learn its byte length.
  const { nextOffset } = cborDecodeAny(authData, offset);
  if (nextOffset <= offset) throw new Error("Invalid public key data");
  return authData.slice(offset, nextOffset);
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
        // keys can be int or string in our use-case
        map[String(k.value)] = v.value;
      }
      // WebAuthn attestationObject needs authData under key "authData"
      if (map["authData"] instanceof Uint8Array) {
        return { value: map, nextOffset: offset };
      }
      // Normalize: if authData was decoded as Uint8Array under "authData", keep it
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






