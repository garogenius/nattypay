/**
 * Fingerprint Payment Service
 * Handles biometric authentication for payments/transactions
 * Uses WebAuthn to verify wallet PIN via fingerprint/Face ID
 */

import {
  arrayBufferToBase64Url,
  authenticateBiometric,
  isPlatformAuthenticatorAvailable,
  isWebAuthnSupported,
} from "./webauthn.service";
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

    const challengeResponse = await getBiometricChallengeRequest(storedCredentialId);
    const challenge = challengeResponse?.data?.challenge as string | undefined;
    if (!challenge) {
      throw new Error("Unable to start biometric verification. Please use your PIN.");
    }

    // Authenticate with biometric (server challenge required)
    const assertion = await authenticateBiometric(challenge, storedCredentialId);
    const signature = arrayBufferToBase64Url(assertion.response.signature);

    // NOTE: In a production implementation, the backend would:
    // 1. Receive the biometric signature data
    // 2. Verify the signature against the stored public key
    // 3. Return a temporary authorization token
    // 4. The transaction API would accept either PIN or this biometric token
    
    // For now, we return a special marker that indicates biometric verification succeeded
    // The backend transaction APIs should be updated to accept this as equivalent to PIN
    // Format: "BIOMETRIC_VERIFIED:{credentialId}:{signature}" for backend verification
    return `BIOMETRIC_VERIFIED:${assertion.credentialId}:${signature}`;
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
 * Check if fingerprint payment is available
 */
export const isFingerprintPaymentAvailable = async (): Promise<boolean> => {
  if (!isWebAuthnSupported()) return false;
  return await isPlatformAuthenticatorAvailable();
};

