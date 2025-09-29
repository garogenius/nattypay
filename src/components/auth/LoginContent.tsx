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
import { useEffect } from "react";
import { User } from "@/constants/types";

const schema = yup.object().shape({
  email: yup
    .string()
    .email("Email format is not valid")
    .required("Email is required"),

  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
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

  const form = useForm<LoginFormData>({
    defaultValues: {
      email: "",
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
      if (/Mac/.test(userAgent)) return "MacOS";
      if (/Linux/.test(userAgent)) return "Linux";
      if (/Android/.test(userAgent)) return "Android";
      if (/iPhone|iPad|iPod/.test(userAgent)) return "iOS";

      return "Unknown OS";
    };

    // Get device name
    const getDeviceName = () => {
      const userAgent = window.navigator.userAgent;
      // Extract device info from user agent string
      const deviceInfo =
        userAgent.split(") ")[0].split("(")[1] || "Unknown Device";
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
        setValue("ipAddress", "Unable to fetch IP");
      }
    };

    setValue("operatingSystem", getOS());
    setValue("deviceName", getDeviceName());
    getIpAddress();
  }, [setValue]); // Run once when component mounts

  const onError = async (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage];

    if (descriptions.includes("Email not verified")) {
      setAuthEmail(form.getValues("email"));
      navigate("/verify-email");
    } else {
      ErrorToast({
        title: "Error during login",
        descriptions,
      });
    }
  };

  const onSuccess = (data: any) => {
    const user: User = data?.data?.user;
    setAuthEmail(user?.email);

    if (user?.isPhoneVerified) {
      SuccessToast({
        title: "Login successful!",
        description:
          "Check your email for verification code to continue with your two-factor authentication.",
      });
      navigate("/two-factor-auth");
    } else {
      navigate("/validate-phoneNumber");
    }

    reset();
  };

  const {
    mutate: login,
    isPending: loginPending,
    isError: loginError,
  } = useLogin(onError, onSuccess);

  const loginLoading = loginPending && !loginError;

  const onSubmit = async (data: LoginFormData) => {
    login({
      email: data.email,
      password: data.password,
      ipAddress: data.ipAddress || "",
      deviceName: data.deviceName || "",
      operatingSystem: data.operatingSystem || "",
    });
  };

  return (
    <div className="relative flex h-full min-h-screen w-full overflow-hidden bg-black">
      {/* Mobile Logo */}
      <div className="absolute top-6 left-6 z-50 lg:hidden">
        <Image
          src={images.logo2}
          alt="logo"
          className="w-24 h-12 cursor-pointer"
          onClick={() => navigate("/")}
        />
      </div>

      {/* Left side - Image with overlay and content */}
      <div className="hidden lg:block lg:w-7/12 relative">
        {/* Desktop Logo at top-left */}
        <div className="absolute top-6 left-6 z-50 hidden lg:block">
          <Image
            src={images.logo2}
            alt="logo"
            className="w-28 h-14 cursor-pointer"
            onClick={() => navigate("/")}
          />
        </div>
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
              id="email"
              label="Email"
              type="email"
              htmlFor="email"
              placeholder="Email"
              icon={
                <Image
                  src={theme === "dark" ? icons.authIcons.mailDark : icons.authIcons.mail}
                  alt="email"
                  className="w-5 h-5 sm:w-6 sm:h-6"
                />
              }
              error={errors.email?.message}
              {...register("email")}
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
