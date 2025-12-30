import { useState } from "react";
import {
  registerBiometric,
  isWebAuthnSupported,
  isPlatformAuthenticatorAvailable,
} from "@/services/webauthn.service";
import { useRegisterBiometric } from "@/api/auth/auth.queries";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";

export const useBiometricRegistration = () => {
  const [isRegistering, setIsRegistering] = useState(false);

  const onRegisterError = (error: any) => {
    setIsRegistering(false);
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage) ? errorMessage : [errorMessage];

    ErrorToast({
      title: "Biometric registration failed",
      descriptions,
    });
  };

  const onRegisterSuccess = () => {
    setIsRegistering(false);
    SuccessToast({
      title: "Biometric registered successfully!",
      description: "You can now use fingerprint or Face ID to log in",
    });
  };

  const {
    mutate: registerBiometricAPI,
    isPending: registerPending,
  } = useRegisterBiometric(onRegisterError, onRegisterSuccess);

  const register = async (userId: string, username: string, displayName: string) => {
    if (!isWebAuthnSupported()) {
      ErrorToast({
        title: "Not supported",
        descriptions: ["WebAuthn is not supported in this browser"],
      });
      return;
    }

    const isAvailable = await isPlatformAuthenticatorAvailable();
    if (!isAvailable) {
      ErrorToast({
        title: "Not available",
        descriptions: ["Biometric authentication is not available on this device"],
      });
      return;
    }

    setIsRegistering(true);
    try {
      const credential = await registerBiometric({
        userId,
        username,
        displayName,
      });

      // Send credential to backend
      registerBiometricAPI({
        userId,
        credentialId: credential.id,
        publicKey: arrayBufferToBase64(credential.response.authenticatorData),
        counter: 0,
      });
    } catch (error: any) {
      setIsRegistering(false);
      ErrorToast({
        title: "Registration failed",
        descriptions: [error.message || "Failed to register biometric"],
      });
    }
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  return {
    register,
    isRegistering: isRegistering || registerPending,
  };
};






