/**
 * Fingerprint Payment Service
 * Handles biometric authentication for payments/transactions
 * Uses WebAuthn to verify wallet PIN via fingerprint/Face ID
 */

import { isWebAuthnSupported, isPlatformAuthenticatorAvailable, authenticateBiometric } from "./webauthn.service";
import { getBiometricChallengeRequest } from "@/api/auth/auth.apis";

/**
 * Verify wallet PIN using biometric authentication
 * This replaces manual PIN entry with biometric verification
 * Returns a special token that backend should accept as equivalent to PIN
 */
export const verifyPinWithBiometric = async (): Promise<string> => {
  if (!isWebAuthnSupported()) {
    throw new Error("Biometric authentication is not supported in this browser");
  }

  const isAvailable = await isPlatformAuthenticatorAvailable();
  if (!isAvailable) {
    throw new Error("Biometric authentication is not available on this device");
  }

  try {
    // Get challenge from backend for secure authentication
    const storedCredentialId = localStorage.getItem("nattypay_credential_id");
    if (!storedCredentialId) {
      throw new Error("Biometric credential not found. Please register biometric authentication first.");
    }

    let challenge: string | undefined;

    try {
      const challengeResponse = await getBiometricChallengeRequest(storedCredentialId);
      challenge = challengeResponse?.data?.challenge;
    } catch (error) {
      console.warn("Backend challenge endpoint not available, using client-side challenge");
    }

    // Authenticate with biometric
    const credential = await authenticateBiometric(challenge, storedCredentialId);

    // Convert ArrayBuffers to base64 for potential backend verification
    const authenticatorData = arrayBufferToBase64(credential.response.authenticatorData);
    const clientDataJSON = arrayBufferToBase64(credential.response.clientDataJSON);
    const signature = arrayBufferToBase64(credential.response.signature);

    // NOTE: In a production implementation, the backend would:
    // 1. Receive the biometric signature data
    // 2. Verify the signature against the stored public key
    // 3. Return a temporary authorization token
    // 4. The transaction API would accept either PIN or this biometric token
    
    // For now, we return a special marker that indicates biometric verification succeeded
    // The backend transaction APIs should be updated to accept this as equivalent to PIN
    // Format: "BIOMETRIC_VERIFIED:{credentialId}:{signature}" for backend verification
    return `BIOMETRIC_VERIFIED:${credential.id}:${signature}`;
  } catch (error: any) {
    if (error.name === "NotAllowedError") {
      throw new Error("Biometric authentication was cancelled or denied");
    }
    if (error.name === "InvalidStateError") {
      throw new Error("Biometric credential is invalid or expired");
    }
    throw new Error(error.message || "Failed to authenticate with biometric");
  }
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
 * Check if fingerprint payment is available
 */
export const isFingerprintPaymentAvailable = async (): Promise<boolean> => {
  if (!isWebAuthnSupported()) return false;
  return await isPlatformAuthenticatorAvailable();
};

