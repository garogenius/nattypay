import { create } from "zustand";

interface RegistrationData {
  username: string;
  fullname: string;
  email?: string; // Optional - use when registering with email
  phoneNumber?: string; // Optional - use when registering with phone (format: "+2348012345678")
  password: string;
  dateOfBirth: string;
  accountType: "PERSONAL" | "BUSINESS";
  companyRegistrationNumber?: string; // Only for BUSINESS
  invitationCode?: string; // Optional - referral/invitation code
}

interface States {
  registrationData: RegistrationData | null;
  verified: boolean;
  countryCode: string | null;
  currency: string | null;
  selectedAccountType: "PERSONAL" | "BUSINESS" | null;
}

interface Actions {
  setRegistrationData: (data: RegistrationData) => void;
  setVerified: (verified: boolean) => void;
  setCountryCode: (code: string) => void;
  setCurrency: (currency: string) => void;
  setSelectedAccountType: (type: "PERSONAL" | "BUSINESS") => void;
  clearRegistrationData: () => void;
}

const useRegistrationStore = create<States & Actions>()((set) => ({
  registrationData: null,
  verified: false,
  countryCode: null,
  currency: null,
  selectedAccountType: null,
  setRegistrationData: (data: RegistrationData) => {
    set({ registrationData: data });
  },
  setVerified: (verified: boolean) => {
    set({ verified });
  },
  setCountryCode: (code: string) => {
    set({ countryCode: code });
  },
  setCurrency: (currency: string) => {
    set({ currency });
  },
  setSelectedAccountType: (type: "PERSONAL" | "BUSINESS") => {
    set({ selectedAccountType: type });
  },
  clearRegistrationData: () => {
    set({
      registrationData: null,
      verified: false,
      countryCode: null,
      currency: null,
      selectedAccountType: null,
    });
  },
}));

export default useRegistrationStore;

