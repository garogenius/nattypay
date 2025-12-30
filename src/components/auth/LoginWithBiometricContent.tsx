/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useLogin, useBiometricLogin } from "@/api/auth/auth.queries";
import { getBiometricChallengeRequest } from "@/api/auth/auth.apis";
import { useState, useEffect } from "react";
import Image from "next/image";
import images from "../../../public/images";
import CustomButton from "@/components/shared/Button";
import Link from "next/link";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import useNavigate from "@/hooks/useNavigate";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useTheme } from "@/store/theme.store";
import useAuthEmailStore from "@/store/authEmail.store";
import { User } from "@/constants/types";
import {
  isWebAuthnSupported,
  isPlatformAuthenticatorAvailable,
  authenticateBiometric,
  hasBiometricCredential,
  getBiometricType,
} from "@/services/webauthn.service";
import {
  getUserIdentifier,
  getUserName,
  storeUserIdentifier,
  maskIdentifier,
  clearUserIdentifier,
} from "@/services/userIdentifier.service";
import VerifyingBiometricModal from "@/components/modals/VerifyingBiometricModal";
import Cookies from "js-cookie";
import useUserStore from "@/store/user.store";
import { useQueryClient } from "@tanstack/react-query";

const schema = yup.object().shape({
  identifier: yup.string().when("hasStoredIdentifier", {
    is: false,
    then: (schema) => schema
      .required("Email or phone number is required")
      .test(
        "email-or-phone",
        "Must be a valid email or phone number",
        (value) => {
          if (!value) return false;
          // Check if it's a phone number (starts with + and has digits)
          const phoneRegex = /^\+?[1-9]\d{1,14}$/;
          // Check if it's an email
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return phoneRegex.test(value.replace(/\s/g, "")) || emailRegex.test(value);
        }
      ),
    otherwise: (schema) => schema.optional(),
  }),
  password: yup
    .string()
    .min(8, "Passcode must be at least 8 characters")
    .required("Passcode is required"),
  ipAddress: yup.string(),
  deviceName: yup.string(),
  operatingSystem: yup.string(),
});

type LoginFormData = yup.InferType<typeof schema>;

const LoginWithBiometricContent = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { setAuthEmail } = useAuthEmailStore();
  const { setUser, setIsLoggedIn } = useUserStore();
  const queryClient = useQueryClient();
  const [showPasscode, setShowPasscode] = useState(false);
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [biometricType, setBiometricType] = useState<"fingerprint" | "face">("fingerprint");
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [storedIdentifier, setStoredIdentifier] = useState<{
    type: "email" | "phone";
    value: string;
    masked: string;
  } | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  const form = useForm<LoginFormData & { hasStoredIdentifier: boolean }>({
    defaultValues: {
      identifier: "",
      password: "",
      ipAddress: "",
      deviceName: "",
      operatingSystem: "",
      hasStoredIdentifier: false,
    },
    resolver: yupResolver(schema) as any,
    mode: "onChange",
  });

  const { register, handleSubmit, formState, reset, setValue } = form;
  const { errors, isValid } = formState;

  useEffect(() => {
    // Check biometric availability
    const checkBiometric = async () => {
      if (isWebAuthnSupported()) {
        const available = await isPlatformAuthenticatorAvailable();
        setIsBiometricAvailable(available && hasBiometricCredential());
        if (available) {
          const type = await getBiometricType();
          setBiometricType(type === "face" ? "face" : "fingerprint");
        }
      }
    };

    checkBiometric();

    // Get stored user identifier
    const identifier = getUserIdentifier();
    const name = getUserName();
    if (identifier) {
      setStoredIdentifier(identifier);
      setValue("hasStoredIdentifier", true);
    } else {
      setValue("hasStoredIdentifier", false);
    }
    if (name) {
      setUserName(name);
    }

    // Get device info
    const getOS = () => {
      const userAgent = window.navigator.userAgent;
      if (/Windows/.test(userAgent)) return "Windows";
      if (/Mac/.test(userAgent)) return "Macintosh";
      if (/Linux/.test(userAgent)) return "Linux";
      if (/Android/.test(userAgent)) return "Android";
      if (/iPhone|iPad|iPod/.test(userAgent)) return "iOS";
      return "Unknown OS";
    };

    const getDeviceName = () => {
      const userAgent = window.navigator.userAgent;
      
      // Check for Mac
      if (/Mac/.test(userAgent)) {
        return "Mac Os";
      }
      
      // Check for Windows
      if (/Windows/.test(userAgent)) {
        if (/Windows NT 10.0/.test(userAgent)) return "Windows 10";
        if (/Windows NT 6.3/.test(userAgent)) return "Windows 8.1";
        if (/Windows NT 6.2/.test(userAgent)) return "Windows 8";
        return "Windows";
      }
      
      // Check for Linux
      if (/Linux/.test(userAgent)) {
        return "Linux";
      }
      
      // Check for Android
      if (/Android/.test(userAgent)) {
        const match = userAgent.match(/Android\s([\d.]+)/);
        return match ? `Android ${match[1]}` : "Android";
      }
      
      // Check for iOS
      if (/iPhone|iPad|iPod/.test(userAgent)) {
        if (/iPhone/.test(userAgent)) return "iPhone";
        if (/iPad/.test(userAgent)) return "iPad";
        return "iOS";
      }
      
      // Fallback: extract from user agent
      const deviceInfo = userAgent.split(") ")[0].split("(")[1] || "Unknown Device";
      return deviceInfo;
    };

    const getIpAddress = async () => {
      try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        setValue("ipAddress", data.ip);
      } catch (error) {
        console.error("Error fetching IP:", error);
        setValue("ipAddress", "0.0.0.0");
      }
    };

    setValue("operatingSystem", getOS());
    setValue("deviceName", getDeviceName());
    getIpAddress();
  }, [setValue]);

  const onError = async (error: any) => {
    const identifier = storedIdentifier?.value || form.getValues("identifier") || "";
    
    // Record failed attempt for rate limiting
    if (identifier) {
      const { rateLimiter, sanitizeInput } = await import("@/utils/security.utils");
      const sanitizedIdentifier = sanitizeInput(identifier);
      rateLimiter.recordFailedAttempt(sanitizedIdentifier);
      
      // Check rate limit
      const rateLimit = rateLimiter.checkRateLimit(sanitizedIdentifier);
      if (!rateLimit.allowed) {
        ErrorToast({
          title: "Account Temporarily Locked",
          descriptions: [
            `Too many failed login attempts. Please wait ${rateLimit.lockoutTime} minutes before trying again.`,
          ],
        });
        return;
      }
    }

    // SECURITY: Generic error message to prevent information disclosure
    const errorMessage = error?.response?.data?.message;
    const isEmailNotVerified = Array.isArray(errorMessage)
      ? errorMessage.some((msg: string) => msg.toLowerCase().includes("email not verified"))
      : errorMessage?.toLowerCase().includes("email not verified");

    if (isEmailNotVerified) {
      setAuthEmail(storedIdentifier?.value || "");
      navigate("/verify-email");
    } else {
      // Generic error message for security
      ErrorToast({
        title: "Login Failed",
        descriptions: ["Invalid credentials. Please try again."],
      });
    }
  };

  const onSuccess = async (data: any) => {
    const user: User = data?.data?.user;
    const identifier = storedIdentifier?.value || form.getValues("email") || "";
    
    // Clear rate limiting on successful login
    if (identifier) {
      const { rateLimiter, sanitizeInput } = await import("@/utils/security.utils");
      const sanitizedIdentifier = sanitizeInput(identifier);
      rateLimiter.clearAttempts(sanitizedIdentifier);
    }
    
    setAuthEmail(user?.email);
    
    // Store user temporarily (but don't set logged in yet - wait for 2FA)
    const { setInitialized } = useUserStore.getState();
    
    // DO NOT set token here - token will be set after 2FA verification
    // The login API might return a token, but we should only use it after 2FA is verified
    
    // Store user info temporarily (not logged in yet)
    setUser(user);
    setIsLoggedIn(false); // Not logged in until 2FA is verified
    setInitialized(true);
    
    // SECURITY: Clear password from memory
    form.setValue("password", "");
    form.resetField("password");

    // Store user identifier for next time
    if (user?.email) {
      storeUserIdentifier(
        {
          type: "email",
          value: user.email,
          masked: maskIdentifier(user.email, "email"),
        },
        user.fullname || user.username
      );
    } else if (user?.phoneNumber) {
      storeUserIdentifier(
        {
          type: "phone",
          value: user.phoneNumber,
          masked: maskIdentifier(user.phoneNumber, "phone"),
        },
        user.fullname || user.username
      );
    }

    // Use setTimeout to ensure state is persisted before navigation
    setTimeout(() => {
      // After login success, directly navigate to 2FA verification
      // 2FA code will be sent automatically when user lands on the screen
      SuccessToast({
        title: "Login successful!",
        description:
          "A verification code has been sent to your email. Please check and enter the code to continue.",
      });
      navigate("/two-factor-auth");
    }, 100);

    reset();
  };

  const {
    mutate: login,
    isPending: loginPending,
    isError: loginError,
  } = useLogin(onError, onSuccess);

  const loginLoading = loginPending && !loginError;

  const onSubmit = async (data: LoginFormData & { identifier?: string }) => {
    const { sanitizeInput, rateLimiter } = await import("@/utils/security.utils");
    
    const identifier = storedIdentifier
      ? storedIdentifier.value
      : data.identifier || "";

    if (!identifier) {
      ErrorToast({
        title: "Error",
        descriptions: ["Email or phone number is required"],
      });
      return;
    }

    // Sanitize inputs
    const sanitizedIdentifier = sanitizeInput(identifier);
    
    // Check rate limiting before attempting login
    const rateLimit = rateLimiter.checkRateLimit(sanitizedIdentifier);
    if (!rateLimit.allowed) {
      ErrorToast({
        title: "Account Temporarily Locked",
        descriptions: [
          `Too many failed login attempts. Please wait ${rateLimit.lockoutTime} minutes before trying again.`,
        ],
      });
      return;
    }

    login({
      identifier: sanitizedIdentifier,
      password: data.password, // Password is sent securely via HTTPS
      ipAddress: data.ipAddress || "",
      deviceName: data.deviceName || "",
      operatingSystem: data.operatingSystem || "",
    });

    // SECURITY: Clear password field after submission
    form.setValue("password", "");
  };

  const onBiometricLoginError = async (error: any) => {
    setShowBiometricModal(false);
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage) ? errorMessage : [errorMessage];

    ErrorToast({
      title: "Biometric authentication failed",
      descriptions,
    });
  };

  const onBiometricLoginSuccess = async (data: any) => {
    setShowBiometricModal(false);
    const user: User = data?.data?.user;
    const identifier = storedIdentifier?.value || user?.email || "";
    
    // Clear rate limiting on successful biometric login
    if (identifier) {
      const { rateLimiter, sanitizeInput } = await import("@/utils/security.utils");
      const sanitizedIdentifier = sanitizeInput(identifier);
      rateLimiter.clearAttempts(sanitizedIdentifier);
    }
    
    const { setInitialized } = useUserStore.getState();
    
    // DO NOT set token here - token will be set after 2FA verification
    // Biometric login also requires 2FA verification
    
    setAuthEmail(user?.email);
    
    // Store user info temporarily (not logged in yet)
    setUser(user);
    setIsLoggedIn(false); // Not logged in until 2FA is verified
    setInitialized(true);

    // Store user identifier for next time
    if (user?.email) {
      storeUserIdentifier(
        {
          type: "email",
          value: user.email,
          masked: maskIdentifier(user.email, "email"),
        },
        user.fullname || user.username
      );
    } else if (user?.phoneNumber) {
      storeUserIdentifier(
        {
          type: "phone",
          value: user.phoneNumber,
          masked: maskIdentifier(user.phoneNumber, "phone"),
        },
        user.fullname || user.username
      );
    }
    
    SuccessToast({
      title: "Login successful!",
      description:
        "A verification code has been sent to your email. Please check and enter the code to continue.",
    });

    // Use setTimeout to ensure state is persisted before navigation
    setTimeout(() => {
      // After login success, directly navigate to 2FA verification
      // 2FA code will be sent automatically when user lands on the screen
      navigate("/two-factor-auth");
    }, 100);
  };

  const {
    mutate: biometricLogin,
    isPending: biometricLoginPending,
  } = useBiometricLogin(onBiometricLoginError, onBiometricLoginSuccess);

  const handleBiometricLogin = async () => {
    setShowBiometricModal(true);
    try {
      // SECURITY: Get challenge from backend if available
      const storedCredentialId = localStorage.getItem("nattypay_credential_id");
      let challenge: string | undefined;
      
      try {
        // Try to get challenge from backend (more secure)
        const challengeResponse = await getBiometricChallengeRequest(storedCredentialId || undefined);
        challenge = challengeResponse?.data?.challenge;
      } catch (error) {
        // Backend might not have challenge endpoint yet, use fallback
        console.warn("Backend challenge endpoint not available, using client-side challenge");
      }

      // Authenticate with biometric (will use backend challenge if available)
      const credential = await authenticateBiometric(challenge, storedCredentialId || undefined);
      
      // Convert ArrayBuffers to base64 for API
      const authenticatorData = arrayBufferToBase64(credential.response.authenticatorData);
      const clientDataJSON = arrayBufferToBase64(credential.response.clientDataJSON);
      const signature = arrayBufferToBase64(credential.response.signature);
      const userHandle = credential.response.userHandle 
        ? arrayBufferToBase64(credential.response.userHandle)
        : undefined;

      // Call biometric login API
      biometricLogin({
        credentialId: credential.id,
        authenticatorData,
        clientDataJSON,
        signature,
        userHandle,
      });
    } catch (error: any) {
      setShowBiometricModal(false);
      ErrorToast({
        title: "Biometric authentication failed",
        descriptions: [error.message || "Please try again"],
      });
    }
  };

  // Helper function to convert ArrayBuffer to base64
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  return (
    <>
      <div className="relative flex h-full min-h-screen w-full overflow-hidden">
        {/* Left Panel - Yellow/Gold Background */}
        <div className="hidden lg:flex lg:w-[40%] bg-[#D4B139] relative items-center justify-center">
          <div className="w-full h-full flex flex-col items-center justify-center px-8 py-12">
            {/* Illustration placeholder */}
            <div className="w-full max-w-md mb-8 flex items-center justify-center">
              <div className="w-64 h-64 bg-white/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-48 h-48 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Transfers</h1>
            <p className="text-lg text-white/90 text-center max-w-md">
              Send and receive money locally or globally with ease and speed.
            </p>
          </div>
        </div>

        {/* Right Panel - White Background with Form */}
        <div className="w-full lg:w-[60%] bg-white flex flex-col items-center justify-center px-6 sm:px-8 py-12">
          <div className="w-full max-w-md">
            {/* Form Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg">
              {/* Logo */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center">
                  <Image
                    src={images.logo2}
                    alt="NattyPay Logo"
                    width={48}
                    height={48}
                    className="w-12 h-12"
                  />
                </div>
              </div>

              {/* Welcome Message */}
              {userName && (
                <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                  Welcome Back {userName}!
                </h2>
              )}
              {storedIdentifier && (
                <p className="text-lg font-bold text-gray-900 mb-6 text-center">
                  {storedIdentifier.masked}
                </p>
              )}

              {/* Biometric Login Option */}
              {isBiometricAvailable && (
                <div className="mb-6">
                  <div className="flex justify-center mb-4">
                    <button
                      type="button"
                      onClick={handleBiometricLogin}
                      className="w-24 h-24 rounded-full border-4 border-gray-300 flex items-center justify-center hover:border-[#D4B139] transition-colors"
                    >
                      {biometricType === "fingerprint" ? (
                        <svg
                          className="w-16 h-16 text-gray-700"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 103 0m-3-6V9m0 0a1.5 1.5 0 103 0m-3-3a1.5 1.5 0 103 0m0 3v6m0-6a1.5 1.5 0 103 0m0 0v3m0-3a1.5 1.5 0 103 0"
                          />
                        </svg>
                      ) : (
                        <div className="w-16 h-16 border-2 border-dashed border-gray-700 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-12 h-12 text-gray-700"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 text-center mb-4">
                    Click to log in with {biometricType === "fingerprint" ? "Fingerprint" : "FaceID"}
                  </p>
                  <CustomButton
                    type="button"
                    onClick={handleBiometricLogin}
                    className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black font-medium py-3 rounded-lg mb-6"
                  >
                    Login With {biometricType === "fingerprint" ? "Fingerprint" : "FaceID"}
                  </CustomButton>
                </div>
              )}

              {/* Passcode Input */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {!storedIdentifier && (
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Email or Phone Number</label>
                    <input
                      type="text"
                      placeholder="Enter your email or phone number"
                      className="w-full border border-gray-300 rounded-lg py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4B139] focus:border-transparent"
                      {...register("identifier")}
                    />
                    {errors.identifier && (
                      <p className="text-red-500 text-xs mt-1">{errors.identifier.message}</p>
                    )}
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Passcode</label>
                  <div className="relative">
                    <input
                      type={showPasscode ? "text" : "password"}
                      placeholder="At least 8 Characters"
                      className="w-full border border-gray-300 rounded-lg py-3 px-4 pr-10 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4B139] focus:border-transparent"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasscode(!showPasscode)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showPasscode ? (
                        <AiOutlineEye className="w-5 h-5" />
                      ) : (
                        <AiOutlineEyeInvisible className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                  )}
                  <Link
                    href="/forgot-passcode"
                    className="text-sm text-[#D4B139] text-right mt-1"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <CustomButton
                  type="submit"
                  disabled={!isValid || loginLoading}
                  isLoading={loginLoading}
                  className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black font-medium py-3 rounded-lg"
                >
                  Login
                </CustomButton>
              </form>

              {/* Account Options */}
              <div className="mt-6 space-y-2">
                <p className="text-sm text-gray-600 text-center">
                  Don't have a NattyPay account yet?{" "}
                  <Link href="/account-type" className="text-[#D4B139] font-medium">
                    Open account
                  </Link>
                </p>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      clearUserIdentifier();
                      setStoredIdentifier(null);
                      setUserName(null);
                      setValue("identifier", "");
                      setValue("hasStoredIdentifier", false);
                    }}
                    className="text-sm text-gray-600 mb-1 block w-full"
                  >
                    Switch account
                  </button>
                  <Link href="/login" className="text-sm text-gray-600">
                    Login with Finger Print or Face ID
                  </Link>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-xs text-gray-500 mt-8">
                <p>
                  Licenced by CBN a{" "}
                  <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>{" "}
                  Deposits Insured by{" "}
                  <span className="text-blue-600 underline">NDIC</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <VerifyingBiometricModal
        isOpen={showBiometricModal}
        onCancel={() => setShowBiometricModal(false)}
        biometricType={biometricType}
      />
    </>
  );
};

export default LoginWithBiometricContent;

