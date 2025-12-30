/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * WebAuthn Service for Biometric Authentication
 * Supports Fingerprint and Face ID authentication on web browsers
 */

// Storage keys
const CREDENTIAL_ID_KEY = "nattypay_credential_id";
const USER_ID_KEY = "nattypay_user_id";

export interface WebAuthnCredential {
  id: string;
  rawId: ArrayBuffer;
  response: {
    clientDataJSON: ArrayBuffer;
    authenticatorData: ArrayBuffer;
    signature: ArrayBuffer;
    userHandle: ArrayBuffer | null;
  };
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
  } catch (error) {
    console.error("Error checking platform authenticator:", error);
    return false;
  }
};

/**
 * Register a new biometric credential for a user
 */
export const registerBiometric = async (
  options: WebAuthnRegistrationOptions
): Promise<WebAuthnCredential> => {
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

    // Store credential ID and user ID
    const credentialId = arrayBufferToBase64(credential.rawId);
    localStorage.setItem(CREDENTIAL_ID_KEY, credentialId);
    localStorage.setItem(USER_ID_KEY, options.userId);

    // Convert response to a serializable format
    const response = credential.response as AuthenticatorAttestationResponse;

    return {
      id: credentialId,
      rawId: credential.rawId,
      response: {
        clientDataJSON: response.clientDataJSON,
        authenticatorData: response.getAuthenticatorData(),
        signature: new ArrayBuffer(0), // Not available in registration
        userHandle: response.getPublicKey() ? new ArrayBuffer(0) : null,
      },
    };
  } catch (error: any) {
    console.error("Error registering biometric:", error);
    throw new Error(error.message || "Failed to register biometric authentication");
  }
};

/**
 * Authenticate using biometric credential
 * SECURITY: Challenge should come from backend, but if not available, use client-side as fallback
 */
export const authenticateBiometric = async (
  challenge?: string, // Base64 encoded challenge from backend (preferred)
  credentialId?: string
): Promise<WebAuthnCredential> => {
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

    // Convert credential ID from base64 to ArrayBuffer
    const credentialIdBuffer = base64ToArrayBuffer(storedCredentialId);

    // SECURITY: Use challenge from backend if provided, otherwise generate client-side (less secure)
    let challengeBuffer: ArrayBuffer;
    if (challenge) {
      // Use backend-provided challenge (secure)
      challengeBuffer = base64ToArrayBuffer(challenge);
    } else {
      // Fallback: Generate client-side challenge (less secure, but works if backend doesn't provide)
      console.warn("Using client-side challenge. Backend should provide challenge for security.");
      challengeBuffer = crypto.getRandomValues(new Uint8Array(32)).buffer;
    }

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
      id: storedCredentialId,
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
 * Helper: Convert ArrayBuffer to Base64
 */
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

/**
 * Helper: Convert Base64 to ArrayBuffer
 */
export const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
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
  } catch (error) {
    console.error("Error determining biometric type:", error);
    return "unknown";
  }
};






