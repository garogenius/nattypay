/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useLogin, useBiometricLoginV1 } from "@/api/auth/auth.queries";
import { biometricChallengeV1Request } from "@/api/auth/auth.apis";
import { useState, useEffect } from "react";
import Image from "next/image";
import images from "../../../public/images";
import CustomButton from "@/components/shared/Button";
import Link from "next/link";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import useNavigate from "@/hooks/useNavigate";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import useAuthEmailStore from "@/store/authEmail.store";
import { User } from "@/constants/types";
import {
  isWebAuthnSupported,
  isPlatformAuthenticatorAvailable,
  authenticateBiometric,
  hasBiometricCredential,
  getBiometricType,
  arrayBufferToBase64Url,
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
import { getDeviceId, initializeFCM } from "@/services/fcm.service";

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
  const { setAuthEmail } = useAuthEmailStore();
  const { setUser, setIsLoggedIn } = useUserStore();
  const queryClient = useQueryClient();
  const [showPasscode, setShowPasscode] = useState(false);
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [biometricType, setBiometricType] = useState<"fingerprint" | "face">("fingerprint");
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [showPasscodeForm, setShowPasscodeForm] = useState(false);
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
      // Extract username (first word) if it's a fullname (contains spaces)
      const displayName = name.includes(" ") ? name.split(" ")[0] : name;
      setUserName(displayName);
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
    const identifier = storedIdentifier?.value || (form.getValues("identifier") as string) || "";
    
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
        user.username || user.fullname
      );
    } else if (user?.phoneNumber) {
      storeUserIdentifier(
        {
          type: "phone",
          value: user.phoneNumber,
          masked: maskIdentifier(user.phoneNumber, "phone"),
        },
        user.username || user.fullname
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

    const accessToken = data?.data?.accessToken;
    const user: User = data?.data?.user;

    if (accessToken && user) {
      Cookies.set("accessToken", accessToken, {
        expires: 7,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });

      setAuthEmail(user?.email);
      setUser(user);
      setIsLoggedIn(true);
      useUserStore.getState().setInitialized(true);

      initializeFCM().catch(() => {
        // SECURITY: avoid leaking error details
      });

      setTimeout(async () => {
        await queryClient.invalidateQueries({ queryKey: ["user"] });
        await queryClient.refetchQueries({ queryKey: ["user"] });
      }, 100);

      SuccessToast({
        title: "Login successful!",
        description: "Biometric authentication verified.",
      });
      setTimeout(() => {
        navigate("/user/dashboard", "replace");
      }, 100);
      return;
    }

    // Fallback: preserve existing 2FA-required flow
    const identifier = storedIdentifier?.value || user?.email || "";
    if (identifier) {
      const { rateLimiter, sanitizeInput } = await import("@/utils/security.utils");
      const sanitizedIdentifier = sanitizeInput(identifier);
      rateLimiter.clearAttempts(sanitizedIdentifier);
    }

    const { setInitialized } = useUserStore.getState();
    setAuthEmail(user?.email);
    setUser(user);
    setIsLoggedIn(false);
    setInitialized(true);

    if (user?.email) {
      storeUserIdentifier(
        {
          type: "email",
          value: user.email,
          masked: maskIdentifier(user.email, "email"),
        },
        user.username || user.fullname
      );
    } else if (user?.phoneNumber) {
      storeUserIdentifier(
        {
          type: "phone",
          value: user.phoneNumber,
          masked: maskIdentifier(user.phoneNumber, "phone"),
        },
        user.username || user.fullname
      );
    }

    SuccessToast({
      title: "Login successful!",
      description:
        "A verification code has been sent to your email. Please check and enter the code to continue.",
    });

    setTimeout(() => {
      navigate("/two-factor-auth");
    }, 100);
  };

  const {
    mutate: biometricLogin,
    isPending: biometricLoginPending,
  } = useBiometricLoginV1(onBiometricLoginError, onBiometricLoginSuccess);

  const handleBiometricLogin = async () => {
    setShowBiometricModal(true);
    try {
      const storedCredentialId = localStorage.getItem("nattypay_credential_id");
      if (!storedCredentialId) {
        throw new Error("Biometric login is not enabled on this device. Please log in with password and enable it in Settings.");
      }

      const deviceId = getDeviceId();

      // Step 1: Generate challenge (server-side)
      const challengeResponse = await biometricChallengeV1Request({
        deviceId,
        credentialId: storedCredentialId,
      });
      const challenge = challengeResponse?.data?.challenge as string | undefined;
      if (!challenge) {
        throw new Error("Unable to start biometric login. Please try again.");
      }

      // Step 2: Sign challenge (browser)
      const assertion = await authenticateBiometric(challenge, storedCredentialId);
      
      // Convert ArrayBuffers to base64url for API
      const authenticatorData = arrayBufferToBase64Url(assertion.response.authenticatorData);
      const clientDataJSON = arrayBufferToBase64Url(assertion.response.clientDataJSON);
      const signature = arrayBufferToBase64Url(assertion.response.signature);
      const userHandle = assertion.response.userHandle 
        ? arrayBufferToBase64Url(assertion.response.userHandle)
        : undefined;

      // Step 3: Login
      biometricLogin({
        deviceId,
        credentialId: assertion.credentialId,
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

  // (duplicate onBiometricLoginSuccess removed)

  return (
    <>
      <div className="relative flex h-full min-h-screen w-full overflow-hidden">
        {/* Left Panel - Yellow/Gold Background */}
        <div className="hidden lg:flex lg:w-[40%] bg-[#D4B139] relative items-center justify-center">
          <div className="w-full h-full flex flex-col items-center justify-center px-8 py-12">
            {/* Login/Security Icon */}
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Secure Login</h1>
            <p className="text-lg text-white/90 text-center max-w-md">
              Access your account securely with biometric authentication or password. Your financial data is protected with bank-level encryption.
            </p>
          </div>
        </div>

        {/* Right Panel - White Background with Form */}
        <div className="w-full lg:w-[60%] bg-white flex flex-col items-center justify-center px-6 sm:px-8 py-12">
          <div className="w-full max-w-md">
            {/* Form Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg">
              {/* Logo Icon */}
              <div className="flex justify-center mb-6">
                  <Image
                  src={images.singleLogo}
                  alt="NattyPay Icon"
                  width={80}
                  height={80}
                  className="w-20 h-20 object-contain"
                  />
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

              {/* Biometric Login Option - Show when biometric is available and passcode form is hidden */}
              {isBiometricAvailable && !showPasscodeForm && (
                <div className="mb-6">
                  <div className="flex flex-col items-center">
                      {biometricType === "fingerprint" ? (
                      // Fingerprint Icon - Large dark gray fingerprint
                      <div className="flex flex-col items-center w-full">
                        <div className="w-40 h-40 flex items-center justify-center mb-6">
                        <svg
                            className="w-40 h-40 text-gray-700"
                          fill="none"
                          stroke="currentColor"
                            strokeWidth={1.5}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                              d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5c0 2.92.556 5.709 1.568 8.268M2 13h2a2 2 0 002-2V9a2 2 0 00-2-2H2m16 0h-2a2 2 0 00-2 2v4a2 2 0 002 2h2M7 8h2m-2 4h2m6-4h2m-2 4h2"
                          />
                        </svg>
                        </div>
                        <p className="text-base font-medium text-gray-700 mb-6">
                          Click to log in with Fingerprint
                        </p>
                        <CustomButton
                          type="button"
                          onClick={handleBiometricLogin}
                          disabled={biometricLoginPending}
                          isLoading={biometricLoginPending}
                          className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-white font-medium py-3.5 rounded-lg"
                        >
                          Login With Fingerprint
                        </CustomButton>
                      </div>
                    ) : (
                      // FaceID Icon - Dashed square with face icon and two dots below
                      <div className="flex flex-col items-center w-full">
                        <div className="w-40 h-40 flex flex-col items-center justify-center mb-6">
                          {/* Dashed square outline */}
                          <div className="relative w-28 h-28 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center">
                            {/* Face icon inside */}
                          <svg
                              className="w-20 h-20 text-gray-700"
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
                          {/* Two dots below */}
                          <div className="flex gap-1.5 mt-3">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          </div>
                        </div>
                        <p className="text-base font-medium text-gray-700 mb-6">
                          Click to log in with FaceID
                        </p>
                        <CustomButton
                          type="button"
                          onClick={handleBiometricLogin}
                          disabled={biometricLoginPending}
                          isLoading={biometricLoginPending}
                          className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-white font-medium py-3.5 rounded-lg"
                        >
                          Login With FaceID
                        </CustomButton>
                        </div>
                      )}
                  </div>

                  {/* Login with Passcode Button */}
                  <CustomButton
                    type="button"
                    onClick={() => setShowPasscodeForm(true)}
                    className="w-full bg-transparent border-2 border-gray-300 hover:border-[#D4B139] text-gray-700 hover:text-[#D4B139] font-medium py-3 rounded-lg transition-colors mt-4"
                  >
                    Login with Passcode
                  </CustomButton>
                </div>
              )}

              {/* Passcode Input - Show when passcode form is requested or biometric is not available */}
              {(showPasscodeForm || !isBiometricAvailable) && (
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
                  
                  {/* Back to Biometric Button - Only show if biometric is available */}
                  {isBiometricAvailable && (
                    <CustomButton
                      type="button"
                      onClick={() => setShowPasscodeForm(false)}
                      className="w-full bg-transparent border-2 border-gray-300 hover:border-[#D4B139] text-gray-700 hover:text-[#D4B139] font-medium py-3 rounded-lg transition-colors mt-2"
                    >
                      Use Biometric Instead
                    </CustomButton>
                  )}
              </form>
              )}

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
                <p className="flex items-center justify-center gap-2 flex-wrap">
                  <span>Licenced by</span>
                  <Image
                    src={images.cbnLogo}
                    alt="CBN Logo"
                    width={40}
                    height={20}
                    className="h-5 w-auto object-contain"
                  />
                  <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                  <span>Deposits Insured by</span>
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

