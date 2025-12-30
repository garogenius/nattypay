/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import { useTier3Verification } from "@/api/user/user.queries";
import CustomButton from "@/components/shared/Button";
import { IoChevronBack } from "react-icons/io5";
import useNavigate from "@/hooks/useNavigate";
import { useEffect } from "react";
import useUserStore from "@/store/user.store";

// Schema definition
const schema = yup.object().shape({
  state: yup.string().required("State is required"),
  city: yup.string().required("City is required"),
  address: yup.string().required("Address is required"),
});

type FormData = yup.InferType<typeof schema>;

const Tier3Content = () => {
  const { user } = useUserStore();
  const navigate = useNavigate();

  const form = useForm<FormData>({
    defaultValues: {
      state: "",
      city: "",
      address: "",
    },
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const { register, handleSubmit, formState } = form;
  const { errors, isValid } = formState;

  const onSuccess = () => {
    SuccessToast({
      title: "Upgraded successfully",
      description: "Successfully upgraded to tier three",
    });
    form.reset();
  };

  const onError = (error: any) => {
    const errorMessage =
      (error as { response?: { data?: { message?: string | string[] } } })
        ?.response?.data?.message ?? "Something went wrong";

    ErrorToast({
      title: "Error verifying location",
      descriptions: Array.isArray(errorMessage) ? errorMessage : [errorMessage],
    });
  };

  const {
    mutate: verify,
    isPending: verifyPending,
    isError: verifyError,
  } = useTier3Verification(onError, onSuccess);

  const onSubmit = async (data: FormData) => {
    try {
      verify({
        state: data.state,
        city: data.city,
        address: data.address,
      });
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  useEffect(() => {
    if (user && (user.tierLevel === "one" || user.tierLevel === "three")) {
      ErrorToast({
        title: "Error",
        descriptions: ["Unauthorized"],
      });
      navigate("/user/settings/tiers", "replace");
    }
  }, [user, navigate]);

  return (
    <div className="flex flex-col gap-2.5 xs:gap-4 py-4">
      <div
        onClick={() => navigate("/user/settings/tiers")}
        className="w-fit flex items-center gap-1 sm:gap-2 cursor-pointer text-text-200 dark:text-text-400"
      >
        <IoChevronBack className="text-xl sm:text-2xl" />
        <h2 className="text-lg sm:text-xl font-bold text-text-200 dark:text-text-400">
          Tier Three Verification
        </h2>
      </div>

      <div className="w-full h-full 2xs:bg-bg-600 2xs:dark:bg-bg-1100 py-4 md:py-8 px-1 2xs:px-5 lg:px-8 flex justify-center rounded-xl sm:rounded-2xl">
        <div className="flex flex-col justify-center items-center gap-6 xs:gap-10 w-full xl:w-[80%] 2xl:w-[70%] bg-transparent lg:bg-bg-400 dark:bg-transparent lg:dark:bg-black rounded-lg sm:rounded-xl p-0 2xs:p-4 md:p-8">
          <h2 className="w-full xs:w-[80%] text-center text-xl xs:text-2xl text-text-200 dark:text-text-400 ">
            Input your state, city and address to verify your location
          </h2>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full flex flex-col gap-10 md:gap-12"
          >
            <div className="w-full grid grid-cols-1 gap-4 md:gap-6">
              <div className="flex flex-col justify-center items-center gap-1 w-full text-black dark:text-white">
                <label
                  className="w-full text-sm font-medium text-text-200 dark:text-text-800 mb-0 flex items-start"
                  htmlFor="state"
                >
                  State
                </label>
                <div className="w-full flex gap-2 justify-center items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-4 px-3">
                  <input
                    id="state"
                    className="disabled:opacity-60 w-full bg-transparent p-0 border-none outline-none text-base text-text-200 dark:text-white placeholder:text-text-200 dark:placeholder:text-text-1000 placeholder:text-sm"
                    placeholder="Enter State"
                    type="text"
                    {...register("state")}
                  />
                </div>
                {errors.state && (
                  <p className="flex self-start text-red-500 font-semibold mt-0.5 text-sm">
                    {errors.state.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col justify-center items-center gap-1 w-full text-black dark:text-white">
                <label
                  className="w-full text-sm font-medium text-text-200 dark:text-text-800 mb-0 flex items-start"
                  htmlFor="city"
                >
                  City
                </label>
                <div className="w-full flex gap-2 justify-center items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-4 px-3">
                  <input
                    id="city"
                    className="disabled:opacity-60 w-full bg-transparent p-0 border-none outline-none text-base text-text-200 dark:text-white placeholder:text-text-200 dark:placeholder:text-text-1000 placeholder:text-sm"
                    placeholder="Enter City"
                    type="text"
                    {...register("city")}
                  />
                </div>
                {errors.city && (
                  <p className="flex self-start text-red-500 font-semibold mt-0.5 text-sm">
                    {errors.city.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col justify-center items-center gap-1 w-full text-black dark:text-white">
                <label
                  className="w-full text-sm font-medium text-text-200 dark:text-text-800 mb-0 flex items-start"
                  htmlFor="address"
                >
                  Address
                </label>
                <div className="w-full flex gap-2 justify-center items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-4 px-3">
                  <input
                    id="address"
                    className="disabled:opacity-60 w-full bg-transparent p-0 border-none outline-none text-base text-text-200 dark:text-white placeholder:text-text-200 dark:placeholder:text-text-1000 placeholder:text-sm"
                    placeholder="Enter Address"
                    type="text"
                    {...register("address")}
                  />
                </div>
                {errors.address && (
                  <p className="flex self-start text-red-500 font-semibold mt-0.5 text-sm">
                    {errors.address.message}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="w-full flex">
              <CustomButton
                type="submit"
                disabled={!isValid || (verifyPending && !verifyError)}
                isLoading={verifyPending}
                className="w-full border-2 dark:text-black dark:font-bold border-primary text-white text-base 2xs:text-lg max-2xs:px-6 py-3"
              >
                Upgrade
              </CustomButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Tier3Content;
