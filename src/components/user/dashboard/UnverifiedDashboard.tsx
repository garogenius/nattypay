"use client";
import Image from "next/image";
import icons from "../../../../public/icons";
import CustomButton from "@/components/shared/Button";
import { useState } from "react";
import VerificationNav from "./VerificationNav";
import BvnForm from "./BvnForm";
import VerifyBvnForm from "./VerifyBvnForm";
import CreatePinForm from "./CreatePinForm";
import useUserStore from "@/store/user.store";
import { TIER_LEVEL } from "@/constants/types";
import useNavigate from "@/hooks/useNavigate";

const UnverifiedDashboard = ({
  setVerified,
}: {
  setVerified: (status: boolean) => void;
}) => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const isBvnVerified =
    user?.tierLevel !== TIER_LEVEL.notSet && user?.isBvnVerified;
  const isPinCreated = user?.isWalletPinSet;

  const isVerified = isBvnVerified && isPinCreated;

  const [steps, setSteps] = useState([
    {
      value: 1,
      clickable: true,
      completed: isBvnVerified || false,
    },
    {
      value: 2,
      clickable: false,
      completed: isBvnVerified || false,
    },
    {
      value: 3,
      clickable: false,
      completed: isPinCreated || false,
    },
  ]);
  const [currentStep, setCurrentStep] = useState(
    (isBvnVerified && !isPinCreated) || isVerified ? 3 : 1
  );
  const [verificationStatus, setVerificationStatus] = useState(
    isBvnVerified ? true : false
  );
  const [bvnDetails, setBvnDetails] = useState({
    bvn: "",
    verificationId: "",
  });

  const handleStepClick = (step: number) => {
    const stepIndex = steps.findIndex((s) => s.value === step);
    if (stepIndex === 0 || steps[stepIndex - 1].completed) {
      setCurrentStep(step);
    }
  };

  // console.log(bvnDetails);

  const handleComplete = (step: number) => {
    setSteps((prevSteps) =>
      prevSteps.map((s) => (s.value === step ? { ...s, completed: true } : s))
    );

    if (step === 1) {
      setCurrentStep(2);
    } else if (step === 2) {
      setCurrentStep(3);
    } else if (step === 3) {
      setVerificationStatus(false);
      setVerified(true);
    }
  };

  return (
    <div className="bg-bg-600 dark:bg-bg-1100 rounded-xl h-full w-full flex flex-col px-4">
      {verificationStatus === false ? (
        <div className="py-40 flex flex-col justify-center items-center gap-6 sm:gap-8">
          <div className="p-5 rounded-full bg-bg-2300">
            <Image
              src={icons.userIcons.plusIcon}
              alt="add-icon"
              className="w-8 sm:w-10"
            />
          </div>
          <h2 className="text-2xl sm:text-3xl text-text-200 dark:text-text-1400">
            No Data Yet
          </h2>

          <CustomButton
            type="button"
            onClick={() => {
              // Navigate to open-account page to complete BVN/NIN verification
              navigate("/open-account");
            }}
            className="w-fit border-2 border-primary text-black font-semibold text-base 2xs:text-lg px-8 sm:px-12 xl:px-20 py-3.5 xs:py-4"
          >
            Complete your Profile
          </CustomButton>
        </div>
      ) : (
        <div className="py-8 flex flex-col h-full gap-10 sm:gap-16">
          <div className="flex flex-col gap-3 justify-center items-center">
            <h2 className="text-xl sm:text-2xl text-text-200 dark:text-text-900 font-semibold">
              {currentStep === 1 && "Enter your BVN"}
              {currentStep === 2 && "Verify your BVN"}
              {currentStep === 3 && "Create transaction PIN"}
            </h2>

            <VerificationNav
              currentStep={currentStep}
              steps={steps}
              handleStepClick={handleStepClick}
            />

            <p className="w=[90%] 2xs:w-[80%] xs:w-[70%] sm:w-[60%] md:w-[50%] lg:w-[40%] xl:w-[30%] text-center text-text-200 dark:text-text-400 text-sm sm:text-base">
              {currentStep === 1 &&
                "Your Bank Verification Number is required to confirm who you are"}
              {currentStep === 2 &&
                "Enter the verification code sent to the phone number linked to your BVN"}
              {currentStep === 3 &&
                "This 4 digit PIN will be used for all transactions and payment confirmations"}
            </p>
          </div>{" "}
          {currentStep === 1 && (
            <div className="w-full max-w-xl mx-auto flex flex-col h-full items-center gap-6 sm:gap-8">
              <BvnForm
                handleComplete={handleComplete}
                setBvnDetails={(bvnDetails) => {
                  setBvnDetails(bvnDetails);
                }}
              />
            </div>
          )}
          {currentStep === 2 && (
            <div className="w-full max-w-xl mx-auto flex flex-col h-full items-center gap-6 sm:gap-8">
              <VerifyBvnForm
                bvnDetails={bvnDetails}
                handleComplete={handleComplete}
                user={user!}
              />
            </div>
          )}
          {currentStep === 3 && (
            <div className="w-full max-w-xl mx-auto flex flex-col h-full items-center gap-6 sm:gap-8">
              <CreatePinForm handleComplete={handleComplete} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UnverifiedDashboard;
