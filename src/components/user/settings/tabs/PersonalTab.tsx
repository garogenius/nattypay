"use client";

import React from "react";
import Image from "next/image";
import { BsCamera } from "react-icons/bs";
import { FiUpload, FiTrash2, FiEdit2 } from "react-icons/fi";
import CustomButton from "@/components/shared/Button";
import DatePicker from "react-datepicker";

type Props = {
  userFullname: string;
  userEmail: string;
  imgUrl: string;
  onUploadClick: () => void;
  onRemovePhoto: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileSelected: (e: React.ChangeEvent<HTMLInputElement>) => void;

  register: any;
  errors: any;
  isValid: boolean;
  updateLoading: boolean;
  onSubmit: (data: any) => void;
  handleSubmit: any;

  watchedDateOfBirth: string;
  showDatePicker: boolean;
  setShowDatePicker: (v: boolean) => void;
  datePickerRef: React.RefObject<HTMLDivElement>;
  handleDateChange: (date: Date | null) => void;

  addressDisplay: string;
  onOpenUpdateUsername: () => void;
  onOpenChangeEmail: () => void;
  onOpenChangePhone: () => void;
  onOpenUpdateAddress: () => void;
};

const PersonalTab: React.FC<Props> = ({
  userFullname,
  userEmail,
  imgUrl,
  onUploadClick,
  onRemovePhoto,
  fileInputRef,
  onFileSelected,
  register,
  errors,
  isValid,
  updateLoading,
  onSubmit,
  handleSubmit,
  watchedDateOfBirth,
  showDatePicker,
  setShowDatePicker,
  datePickerRef,
  handleDateChange,
  addressDisplay,
  onOpenUpdateUsername,
  onOpenChangeEmail,
  onOpenChangePhone,
  onOpenUpdateAddress,
}) => {
  return (
    <>
      {/* Header Card */}
      <div className="w-full bg-bg-600 dark:bg-bg-1100 border border-white/10 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-white/5">
            {imgUrl ? (
              <Image src={imgUrl} alt="profile" fill className="object-cover" />
            ) : (
              <div className="uppercase w-full h-full flex justify-center items-center text-text-200 dark:text-text-400 text-2xl sm:text-3xl">
                {userFullname?.slice(0, 2)}
              </div>
            )}
            <button
              type="button"
              onClick={onUploadClick}
              className="absolute bottom-0 right-0 p-2 rounded-full bg-secondary text-white text-base shadow"
              title="Upload photo"
            >
              <BsCamera />
            </button>
            <input type="file" style={{ display: "none" }} ref={fileInputRef} onChange={onFileSelected} />
          </div>
          <div className="flex-1 w-full">
            <p className="text-white font-semibold text-base sm:text-lg">{userFullname}</p>
            <p className="text-white/70 text-sm">{userEmail}</p>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={onUploadClick}
                className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm inline-flex items-center gap-2"
              >
                <FiUpload className="text-base" />
                <span>Upload Photo</span>
              </button>
              <button
                type="button"
                onClick={onRemovePhoto}
                className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 text-sm inline-flex items-center gap-2"
              >
                <FiTrash2 className="text-base" />
                <span>Remove Photo</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-8">
        <div className="w-full bg-bg-600 dark:bg-bg-1100 border border-white/10 rounded-2xl p-4 sm:p-5">
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {/* Full Name */}
            <div className="flex flex-col justify-center items-center gap-1 w-full text-black dark:text-white">
              <label className="w-full text-sm font-medium  text-text-200 dark:text-text-800 mb-0 flex items-start ">Full Name </label>
              <div className="relative w-full flex gap-2 justify-center items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-4 px-3">
                <input className="disabled:opacity-60 w-full bg-transparent p-0 border-none outline-none text-base text-text-200 dark:text-white placeholder:text-text-200 dark:placeholder:text-text-1000 placeholder:text-sm" placeholder="Full name" type="text" {...register("fullname")} />
                <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 grid place-items-center rounded-md bg-[#D4B139]/15 text-[#D4B139] border border-[#D4B139]/30">
                  <FiEdit2 className="text-xs" />
                </button>
              </div>
              {errors?.fullname?.message ? (<p className="flex self-start text-red-500 font-semibold mt-0.5 text-sm">{errors?.fullname?.message}</p>) : null}
            </div>

            {/* Nickname */}
            <div className="flex flex-col justify-center items-center gap-1 w-full text-black dark:text-white">
              <label className="w-full text-sm font-medium  text-text-200 dark:text-text-800 mb-0 flex items-start ">Nickname </label>
              <div className="relative w-full flex gap-2 justify-center items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-4 px-3">
                <input className="disabled:opacity-60 w-full bg-transparent p-0 border-none outline-none text-base text-text-200 dark:text-white placeholder:text-text-200 dark:placeholder:text-text-1000 placeholder:text-sm" placeholder="Username" disabled type="text" {...register("username")} />
                <button type="button" onClick={onOpenUpdateUsername} className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 grid place-items-center rounded-md bg-[#D4B139]/15 text-[#D4B139] border border-[#D4B139]/30">
                  <FiEdit2 className="text-xs" />
                </button>
              </div>
              {errors?.username?.message ? (<p className="flex self-start text-red-500 font-semibold mt-0.5 text-sm">{errors?.username?.message}</p>) : null}
            </div>

            {/* Email */}
            <div className="flex flex-col justify-center items-center gap-1 w-full text-black dark:text-white">
              <label className="w-full text-sm font-medium  text-text-200 dark:text-text-800 mb-0 flex items-start ">Email address </label>
              <div className="relative w-full flex gap-2 justify-center items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-4 px-3">
                <input className="disabled:opacity-60 w-full bg-transparent p-0 border-none outline-none text-base text-text-200 dark:text-white placeholder:text-text-200 dark:placeholder:text-text-1000 placeholder:text-sm" placeholder="Email" disabled type="email" {...register("email")} />
                <button type="button" onClick={onOpenChangeEmail} className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 grid place-items-center rounded-md bg-[#D4B139]/15 text-[#D4B139] border border-[#D4B139]/30">
                  <FiEdit2 className="text-xs" />
                </button>
              </div>
              {errors?.email?.message ? (<p className="flex self-start text-red-500 font-semibold mt-0.5 text-sm">{errors?.email?.message}</p>) : null}
            </div>

            {/* Mobile Number */}
            <div className="flex flex-col justify-center items-center gap-1 w-full text-black dark:text-white">
              <label className="w-full text-sm font-medium  text-text-200 dark:text-text-800 mb-0 flex items-start ">Mobile Number </label>
              <div className="relative w-full flex gap-2 justify-center items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-4 px-3">
                <input className="disabled:opacity-60 w-full bg-transparent p-0 border-none outline-none text-base text-text-200 dark:text-white placeholder:text-text-200 dark:placeholder:text-text-1000 placeholder:text-sm" placeholder="Phone Number" type="text" {...register("phoneNumber")} />
                <button type="button" onClick={onOpenChangePhone} className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 grid place-items-center rounded-md bg-[#D4B139]/15 text-[#D4B139] border border-[#D4B139]/30">
                  <FiEdit2 className="text-xs" />
                </button>
              </div>
              {errors?.phoneNumber?.message ? (<p className="flex self-start text-red-500 font-semibold mt-0.5 text-sm">{errors?.phoneNumber?.message}</p>) : null}
            </div>

            {/* DOB */}
            <div className="w-full relative">
              <div className="flex flex-col justify-center items-center gap-1 w-full text-black dark:text-white">
                <label className="w-full text-sm font-medium  text-text-200 dark:text-text-800 mb-0 flex items-start ">Date Of Birth</label>
                <div onClick={() => setShowDatePicker(!showDatePicker)} className="cursor-pointer w-full flex gap-2 justify-center items-center bg-bg-2000 dark:bg-bg-2100 border border-border-600 rounded-lg py-4 px-3">
                  {watchedDateOfBirth ? (
                    <div className="w-full bg-transparent p-0 border-none outline-none text-base text-text-200 dark:text-white placeholder:text-text-700 dark:placeholder:text-text-1000 placeholder:text-sm">{watchedDateOfBirth}</div>
                  ) : (
                    <div className="w-full bg-transparent p-0 border-none outline-none text-base text-text-200 dark:text-white placeholder:text-text-700 dark:placeholder:text-text-1000 placeholder:text-sm">Select Date of Birth</div>
                  )}
                </div>
                {errors?.dateOfBirth?.message ? (<p className="flex self-start text-red-500 font-semibold mt-0.5 text-sm">{errors?.dateOfBirth?.message}</p>) : null}
              </div>
              {showDatePicker && (
                <div ref={datePickerRef} className="absolute z-10 mt-1">
                  <DatePicker 
                    selected={watchedDateOfBirth ? new Date(watchedDateOfBirth) : null} 
                    onChange={handleDateChange} 
                    inline 
                    calendarClassName="custom-calendar"
                    showYearDropdown
                    scrollableYearDropdown
                    yearDropdownItemNumber={100}
                    dropdownMode="select"
                    maxDate={new Date()}
                  />
                </div>
              )}
            </div>

            {/* Address (display only) */}
            <div className="sm:col-span-2 flex flex-col justify-center items-center gap-1 w-full text-black dark:text-white">
              <label className="w-full text-sm font-medium  text-text-200 dark:text-text-800 mb-0 flex items-start ">Residential Address </label>
              <div className="relative w-full flex gap-2 justify-center items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-4 px-3">
                <input className="disabled:opacity-60 w-full bg-transparent p-0 border-none outline-none text-base text-text-200 dark:text-white placeholder:text-text-200 dark:placeholder:text-text-1000 placeholder:text-sm" placeholder="Residential Address" type="text" disabled value={addressDisplay} readOnly />
                <button type="button" onClick={onOpenUpdateAddress} className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 grid place-items-center rounded-md bg-[#D4B139]/15 text-[#D4B139] border border-[#D4B139]/30">
                  <FiEdit2 className="text-xs" />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full">
          <CustomButton type="submit" disabled={!isValid || updateLoading} isLoading={updateLoading} className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black font-semibold text-base sm:text-lg py-3 rounded-xl">Save</CustomButton>
        </div>
      </form>
    </>
  );
};

export default PersonalTab;
