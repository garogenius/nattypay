"use client";

import React, { useState, useRef, ChangeEvent } from "react";
import { CgClose } from "react-icons/cg";
import { FiUpload, FiTrash2 } from "react-icons/fi";
import CustomButton from "@/components/shared/Button";
import ErrorToast from "@/components/toast/ErrorToast";

interface PassportUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: {
    passportDocumentUrl: string;
    file: File | null;
  }) => Promise<void> | void;
  initialData?: {
    passportDocumentUrl?: string;
  };
  isLoading?: boolean;
}

const PassportUploadModal: React.FC<PassportUploadModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string>(initialData?.passportDocumentUrl || "");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setFileUrl(initialData?.passportDocumentUrl || "");
      setSelectedFile(null);
    }
  }, [isOpen, initialData]);

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      const extension = file.name.split(".").pop()?.toLowerCase();
      if (extension && (extension === "jpg" || extension === "jpeg" || extension === "png" || extension === "pdf")) {
        const fileSize = file.size / 1024 / 1024; // Convert to MB
        const maxSizeMB = 5;
        if (fileSize <= maxSizeMB) {
          setSelectedFile(file);
          setFileUrl(URL.createObjectURL(file));
        } else {
          ErrorToast({
            title: "File Too Large",
            descriptions: [`Selected file size exceeds the limit (${maxSizeMB}MB).`],
          });
        }
      } else {
        ErrorToast({
          title: "Invalid File Type",
          descriptions: ["Selected file is not a supported format (JPEG, JPG, PNG, or PDF)."],
        });
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isValid = selectedFile !== null || fileUrl.length > 0;

  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    try {
      setSubmitting(true);
      if (onSubmit) {
        await onSubmit({
          passportDocumentUrl: fileUrl,
          file: selectedFile,
        });
      }
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="z-[999999] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 flex justify-center items-center w-full md:inset-0 h-[100dvh]">
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div className="absolute inset-0 bg-black/80 dark:bg-black/60" onClick={onClose} />
      </div>
      <div className="relative mx-2.5 2xs:mx-4 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 px-0 pt-4 pb-5 w-full max-w-md max-h-[92vh] rounded-2xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 cursor-pointer bg-bg-1400 rounded-full hover:bg-bg-1200 transition-colors z-10"
        >
          <CgClose className="text-xl text-text-200 dark:text-text-400" />
        </button>

        <div className="px-5 sm:px-6 pt-1 pb-3">
          <h2 className="text-white text-base sm:text-lg font-semibold">Upload Passport Document</h2>
          <p className="text-white/60 text-sm">Upload your passport document file for verification</p>
        </div>

        <div className="px-5 sm:px-6 pb-2 space-y-4 overflow-y-auto max-h-[calc(92vh-200px)]">
          {/* File Upload */}
          <div>
            <label className="block text-sm text-white/80 mb-1.5">Passport Document <span className="text-red-500">*</span></label>
            <div className="w-full flex flex-col gap-3">
              <div className="relative w-full flex items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3.5 px-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*,.pdf"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#D4B139]/15 text-[#D4B139] border border-[#D4B139]/30 hover:bg-[#D4B139]/25 transition-colors"
                >
                  <FiUpload className="text-base" />
                  <span>{selectedFile ? selectedFile.name : "Upload Passport (JPG, PNG, PDF)"}</span>
                </button>
              </div>
              {fileUrl && (
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <span>✓ {selectedFile ? `File selected: ${selectedFile.name}` : "Document uploaded"}</span>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="text-red-400 hover:text-red-300"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-5 sm:px-6 pt-2">
          <CustomButton
            onClick={handleSubmit}
            disabled={!isValid || submitting || isLoading}
            isLoading={submitting || isLoading}
            className={`w-full rounded-xl py-3 font-semibold ${
              !isValid || submitting
                ? "bg-[#D4B139]/60 text-black/70"
                : "bg-[#D4B139] hover:bg-[#c7a42f] text-black"
            }`}
          >
            {submitting ? "Uploading..." : "Upload Document"}
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default PassportUploadModal;




