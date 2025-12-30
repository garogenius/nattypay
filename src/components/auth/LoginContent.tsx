/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useLogin } from "@/api/auth/auth.queries";
import { motion } from "framer-motion";
import images from "../../../public/images";
import Image from "next/image";
import AuthInput from "./AuthInput";
import CustomButton from "@/components/shared/Button";
import Link from "next/link";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import useNavigate from "@/hooks/useNavigate";
import icons from "../../../public/icons";
import { useTheme } from "@/store/theme.store";
import useAuthEmailStore from "@/store/authEmail.store";
import useUserStore from "@/store/user.store";
import { useEffect, useState } from "react";
import { User } from "@/constants/types";
import Cookies from "js-cookie";
import { useQueryClient } from "@tanstack/react-query";
import { rateLimiter, sanitizeInput } from "@/utils/security.utils";

const schema = yup.object().shape({
  identifier: yup
    .string()
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

  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be less than 128 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/,
      "Password must contain uppercase, lowercase, number, and special character"
    )
    .required("Password is required"),

  ipAddress: yup.string(),
  deviceName: yup.string(),
  operatingSystem: yup.string(),
});

type LoginFormData = yup.InferType<typeof schema>;

const LoginContent = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { setAuthEmail } = useAuthEmailStore();
  const queryClient = useQueryClient();
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);

  const form = useForm<LoginFormData>({
    defaultValues: {
      identifier: "",
      password: "",
      ipAddress: "",
      deviceName: "",
      operatingSystem: "",
    },
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const { register, handleSubmit, formState, reset, setValue } = form;
  const { errors, isValid } = formState;

  useEffect(() => {
    // Get operating system
    const getOS = () => {
      const userAgent = window.navigator.userAgent;

      if (/Windows/.test(userAgent)) return "Windows";
      if (/Mac/.test(userAgent)) return "Macintosh";
      if (/Linux/.test(userAgent)) return "Linux";
      if (/Android/.test(userAgent)) return "Android";
      if (/iPhone|iPad|iPod/.test(userAgent)) return "iOS";

      return "Unknown OS";
    };

    // Get device name
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

    // Get IP address
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
  }, [setValue]); // Run once when component mounts

  const onError = async (error: any) => {
    const identifier = form.getValues("identifier");
    const sanitizedIdentifier = sanitizeInput(identifier);
    
    // Record failed attempt for rate limiting
    rateLimiter.recordFailedAttempt(sanitizedIdentifier);
    
    // Check rate limit
    const rateLimit = rateLimiter.checkRateLimit(sanitizedIdentifier);
    if (!rateLimit.allowed) {
      setRateLimitError(
        `Too many login attempts. Please try again in ${rateLimit.lockoutTime} minutes.`
      );
      ErrorToast({
        title: "Account Temporarily Locked",
        descriptions: [
          `Too many failed login attempts. Please wait ${rateLimit.lockoutTime} minutes before trying again.`,
        ],
      });
      return;
    }

    // SECURITY: Generic error message to prevent information disclosure
    // Don't reveal if email exists or password is wrong
    const errorMessage = error?.response?.data?.message;
    const isEmailNotVerified = Array.isArray(errorMessage)
      ? errorMessage.some((msg: string) => msg.toLowerCase().includes("email not verified"))
      : errorMessage?.toLowerCase().includes("email not verified");

    if (isEmailNotVerified) {
      // Only handle email verification case specifically
      const email = identifier.includes("@") ? identifier : "";
      setAuthEmail(email);
      navigate("/verify-email");
    } else {
      // Generic error message for security
      ErrorToast({
        title: "Login Failed",
        descriptions: [
          `Invalid credentials. ${rateLimit.remainingAttempts} attempt${rateLimit.remainingAttempts !== 1 ? "s" : ""} remaining.`,
        ],
      });
    }
  };

  const onSuccess = async (data: any) => {
    const user: User = data?.data?.user;
    const identifier = form.getValues("identifier");
    const sanitizedIdentifier = sanitizeInput(identifier);
    
    // Clear rate limiting on successful login
    rateLimiter.clearAttempts(sanitizedIdentifier);
    setRateLimitError(null);
    
    setAuthEmail(user?.email);
    
    // Store user temporarily (but don't set logged in yet - wait for 2FA)
    const { setUser, setIsLoggedIn, setInitialized } = useUserStore.getState();
    
    // DO NOT set token here - token will be set after 2FA verification
    // The login API might return a token, but we should only use it after 2FA is verified
    
    // Store user info temporarily (not logged in yet)
    setUser(user);
    setIsLoggedIn(false); // Not logged in until 2FA is verified
    setInitialized(true);
    
    // SECURITY: Clear password from memory
    form.setValue("password", "");
    form.resetField("password");

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

  const onSubmit = async (data: LoginFormData) => {
    // Sanitize inputs
    const sanitizedIdentifier = sanitizeInput(data.identifier);
    
    // Check rate limiting before attempting login
    const rateLimit = rateLimiter.checkRateLimit(sanitizedIdentifier);
    if (!rateLimit.allowed) {
      setRateLimitError(
        `Too many login attempts. Please try again in ${rateLimit.lockoutTime} minutes.`
      );
      ErrorToast({
        title: "Account Temporarily Locked",
        descriptions: [
          `Too many failed login attempts. Please wait ${rateLimit.lockoutTime} minutes before trying again.`,
        ],
      });
      return;
    }

    setRateLimitError(null);

    // SECURITY: Clear password from form after submission (best effort)
    login({
      identifier: sanitizedIdentifier,
      password: data.password, // Password is sent securely via HTTPS
      ipAddress: data.ipAddress || "",
      deviceName: data.deviceName || "",
      operatingSystem: data.operatingSystem || "",
    });

    // Clear password field after submission
    form.setValue("password", "");
  };

  return (
    <div className="relative flex h-full min-h-screen w-full overflow-hidden bg-black">
      {/* Mobile Logo */}
      {/* <div className="absolute top-6 left-6 z-50 lg:hidden">
        <Image
          src={images.logo2}
          alt="logo"
          className="w-24 h-12 cursor-pointer"
          onClick={() => navigate("/")}
        />
      </div> */}

      {/* Left side - Image with overlay and content */}
      <div className="hidden lg:block lg:w-7/12 relative">
        {/* Desktop Logo at top-left */}
        <Image
          src={images.logo2}
          alt="logo"
          className="w-24 h-12 cursor-pointer"
          onClick={() => navigate("/")}
        />
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src={images.auth.accountTypeDescription}
            alt="auth background"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/80" />
        </div>
        {/* Overlay text */}
        <div className="relative z-10 h-full w-full flex items-center">
          <div className="px-6 2xs:px-8 sm:px-12 md:px-16 lg:px-20 py-20 max-w-2xl">
            <h1 className="text-3xl 2xs:text-4xl xs:text-5xl md:text-6xl font-bold text-white mb-4">
              Welcome to Nattypay
            </h1>
            <p className="text-base 2xs:text-lg xl:text-xl text-gray-200 leading-relaxed max-w-xl">
              Global Payments, Local Convenience. Send money, pay bills, buy airtime and manage savings effortlessly.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex w-full flex-col items-center justify-center bg-black p-6 sm:p-8 lg:w-5/12 lg:overflow-y-auto">
        <motion.div
          whileInView={{ opacity: [0, 1] }}
          transition={{ duration: 0.5, type: "tween" }}
          className="w-full max-w-md sm:max-w-lg space-y-8 bg-bg-600 dark:bg-bg-1100 border border-border-600 rounded-2xl px-6 2xs:px-8 sm:px-8 py-6 2xs:py-8"
        >
          <div className="text-white flex flex-col items-center justify-center w-full text-center">
            {/* <Image
              className="w-20 2xs:w-24 xs:w-28"
              src={images.singleLogo}
              alt="logo"
              onClick={() => {
                navigate("/");
              }}
            />
            <h2 className="mt-2 text-xl xs:text-2xl lg:text-3xl text-text-200 dark:text-white font-semibold">
              Welcome Back
            </h2> */}
          </div>

          <form
            className="flex flex-col justify-start items-start w-full gap-7"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <AuthInput
              id="identifier"
              label="Email or Phone Number"
              type="text"
              htmlFor="identifier"
              placeholder="Email or Phone Number"
              icon={
                <Image
                  src={theme === "dark" ? icons.authIcons.mailDark : icons.authIcons.mail}
                  alt="identifier"
                  className="w-5 h-5 sm:w-6 sm:h-6"
                />
              }
              error={errors.identifier?.message}
              {...register("identifier")}
            />

            <AuthInput
              id="password"
              label="Password"
              type="password"
              htmlFor="password"
              placeholder="Password"
              autoComplete="off"
              forgotPassword={true}
              icon={
                <Image
                  src={theme === "dark" ? icons.authIcons.lockDark : icons.authIcons.lock}
                  alt="password"
                  className="w-5 h-5 sm:w-6 sm:h-6"
                />
              }
              error={errors.password?.message}
              {...register("password")}
            />

            {/* Rate Limit Error Display */}
            {rateLimitError && (
              <div className="w-full p-3 bg-red-500/10 border border-red-500 rounded-lg">
                <p className="text-red-500 text-sm text-center">{rateLimitError}</p>
              </div>
            )}

            <p className="w-full flex justify-center items-center gap-1 text-base sm:text-lg text-text-200 dark:text-white">
              Don&apos;t have an account?{' '}
              <Link className="text-primary" href="/account-type">
                Get started
              </Link>
            </p>

            <CustomButton
              type="submit"
              disabled={!isValid || loginLoading}
              isLoading={loginLoading}
              className="mb-2 w-full border-2 border-primary text-black text-base 2xs:text-lg py-3.5 xs:py-4"
            >
              Sign In
            </CustomButton>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginContent;
