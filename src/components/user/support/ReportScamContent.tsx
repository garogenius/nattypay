/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import { useReportScam } from "@/api/user/user.queries";
import CustomButton from "@/components/shared/Button";
import { FaPaperclip, FaImage } from "react-icons/fa6";
import { useState } from "react";
import { FiAlertTriangle, FiX } from "react-icons/fi";
import useNavigate from "@/hooks/useNavigate";

const schema = yup.object().shape({
  title: yup.string().required("Title is required"),
  description: yup.string().required("Description is required"),
});

type FormData = yup.InferType<typeof schema>;

const ReportScamContent = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      const selectedFile = event.target.files[0];
      
      // Validate file type (images only)
      if (!selectedFile.type.startsWith("image/")) {
        ErrorToast({
          title: "Invalid file type",
          descriptions: ["Please upload an image file"],
        });
        return;
      }

      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        ErrorToast({
          title: "File too large",
          descriptions: ["Please upload an image smaller than 5MB"],
        });
        return;
      }

      setFile(selectedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
  };

  const form = useForm<FormData>({
    defaultValues: {
      title: "",
      description: "",
    },
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const { register, handleSubmit, formState, reset } = form;
  const { errors, isValid } = formState;

  const onSuccess = () => {
    SuccessToast({
      title: "Report Submitted",
      description: "Your scam report has been successfully submitted. Our team will review it shortly.",
    });
    reset();
    setFile(null);
    setPreview(null);
    // Navigate back to support page after 2 seconds
    setTimeout(() => {
      navigate("/user/support", "replace");
    }, 2000);
  };

  const onError = (error: any) => {
    const errorMessage =
      (error as { response?: { data?: { message?: string | string[] } } })
        ?.response?.data?.message ?? "Something went wrong";

    ErrorToast({
      title: "Error submitting report",
      descriptions: Array.isArray(errorMessage) ? errorMessage : [errorMessage],
    });
  };

  const {
    mutate: sendReport,
    isPending: sendingPending,
  } = useReportScam(onError, onSuccess);

  const onSubmit = async (data: yup.InferType<typeof schema>) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);

    if (file) {
      formData.append("screenshot", file);
    }

    sendReport(formData);
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Header */}
      <div className="w-full flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-500/20 grid place-items-center">
            <FiAlertTriangle className="text-red-500 text-xl" />
          </div>
          <div>
            <h1 className="text-white text-xl sm:text-2xl font-semibold">Report Scam</h1>
            <p className="text-white/60 text-sm">Report any suspicious activity or fraudulent transaction</p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="w-full bg-bg-600 dark:bg-bg-1100 border border-white/10 rounded-2xl p-4 sm:p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          {/* Title Input */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="title"
              className="text-white font-medium text-sm"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <div className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg px-4 py-3">
              <input
                id="title"
                type="text"
                placeholder="Enter a brief title for your report"
                className="w-full bg-transparent border-none outline-none text-white placeholder:text-white/50 text-sm"
                {...register("title")}
              />
            </div>
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Description Input */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="description"
              className="text-white font-medium text-sm"
            >
              Description <span className="text-red-500">*</span>
            </label>
            <div className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg px-4 py-3">
              <textarea
                id="description"
                rows={6}
                placeholder="Provide detailed information about the suspicious activity or fraudulent transaction..."
                className="w-full bg-transparent border-none outline-none text-white placeholder:text-white/50 text-sm resize-none"
                {...register("description")}
              />
            </div>
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* File Upload Section */}
          <div className="flex flex-col gap-2">
            <label className="text-white font-medium text-sm">
              Screenshot/Evidence (Optional)
            </label>
            {!file ? (
              <label
                htmlFor="file-upload"
                className="w-full border-2 border-dashed border-white/20 rounded-lg p-6 sm:p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#D4B139] transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-white/10 grid place-items-center">
                  <FaImage className="text-white/60 text-xl" />
                </div>
                <div className="text-center">
                  <p className="text-white font-medium text-sm mb-1">Click to upload screenshot</p>
                  <p className="text-white/50 text-xs">PNG, JPG up to 5MB</p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            ) : (
              <div className="relative w-full border border-white/10 rounded-lg p-4 bg-white/5">
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-white/5">
                    {preview && (
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium truncate">{file.name}</p>
                    <p className="text-white/50 text-xs">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="w-8 h-8 rounded-full bg-red-500/20 grid place-items-center hover:bg-red-500/30 transition-colors"
                  >
                    <FiX className="text-red-500 text-sm" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FiAlertTriangle className="text-blue-400 text-lg mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-blue-400 font-medium text-sm mb-1">Important Information</p>
                <p className="text-blue-300/80 text-xs leading-relaxed">
                  Please provide as much detail as possible. Include transaction references, dates, amounts, and any other relevant information. Our security team will review your report and take appropriate action.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center gap-3 pt-2">
            <CustomButton
              type="button"
              onClick={() => navigate("/user/support", "replace")}
              className="flex-1 bg-transparent border border-white/20 text-white hover:bg-white/5"
            >
              Cancel
            </CustomButton>
            <CustomButton
              type="submit"
              disabled={!isValid || sendingPending}
              isLoading={sendingPending}
              className="flex-1 bg-[#D4B139] hover:bg-[#c7a42f] text-black font-semibold"
            >
              Submit Report
            </CustomButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportScamContent;

