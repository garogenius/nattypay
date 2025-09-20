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
    <div className="relative flex justify-center items-center w-full bg-bg-400 dark:bg-black">
      <div className="absolute top-4 left-4 z-20">
        <Image src={images.logo2} alt="logo" className="w-30 h-20 cursor-pointer" onClick={() => navigate("/")} />
      </div>
      <div className="flex flex-col justify-center items-center w-full gap-8 mt-16 sm:mt-20 lg:mt-24 xl:mt-28 mb-8 sm:mb-10 lg:mb-12 xl:mb-14">
        <motion.div
          whileInView={{ opacity: [0, 1] }}
          transition={{ duration: 0.5, type: "tween" }}
          className="z-10 flex flex-col justify-start items-start w-full xs:w-[90%] md:w-[80%] lg:w-[55%] xl:w-[45%] 2xl:w-[35%]  bg-transparent xs:bg-bg-600 xs:dark:bg-bg-1100 dark:xs:border dark:border-border-600 rounded-2xl px-6 2xs:px-8 sm:px-10 py-2.5 2xs:py-4 sm:py-6 gap-6 2xs:gap-8 sm:gap-10 md:gap-12"
        >
          <div className="text-white flex flex-col items-center justify-center w-full text-center">
            <Image
              className="w-20 2xs:w-24 xs:w-28 "
              src={images.singleLogo}
              alt="logo"
              onClick={() => {
                navigate("/");
              }}
            />{" "}
            <h2 className="text-xl xs:text-2xl lg:text-3xl text-text-200 dark:text-white font-semibold">
              Welcome Back{" "}
            </h2>
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
                  src={
                    theme === "dark"
                      ? icons.authIcons.mailDark
                      : icons.authIcons.mail
                  }
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
                  src={
                    theme === "dark"
                      ? icons.authIcons.lockDark
                      : icons.authIcons.lock
                  }
                  alt="password"
                  className="w-5 h-5 sm:w-6 sm:h-6"
                />
              }
              error={errors.password?.message}
              {...register("password")}
            />

            <p className="w-full flex justify-center items-center gap-1 text-base sm:text-lg text-text-200 dark:text-white ">
              Don&apos;t have an account?{" "}
              <Link className="text-primary" href="/account-type">
                Get started{" "}
              </Link>
            </p>

            <CustomButton
              type="submit"
              disabled={!isValid || loginLoading}
              isLoading={loginLoading}
              className="mb-4  w-full  border-2 border-primary text-black text-base 2xs:text-lg max-2xs:px-6 py-3.5 xs:py-4"
            >
              Sign In{" "}
            </CustomButton>
          </form>
        </motion.div>
      </div>
      <div
        className=" absolute bottom-0 left-0 inset-[60rem] opacity-60"
        style={{
          background: `
                radial-gradient(
                  circle at bottom left,
                  rgba(212, 177, 57, 0.4) 0%,
                  rgba(212, 177, 57, 0.2) 40%,
                  rgba(212, 177, 57, 0.1) 60%,
                  rgba(212, 177, 57, 0) 80%
                )
              `,
          filter: "blur(60px)",
          transform: "scale(1.1)",
        }}
      />
    </div>
  );
};

export default LoginContent;
