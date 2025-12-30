import { create } from "zustand";

interface States {
  authEmail: string;
  authPhoneNumber: string;
  authCode: string;
  registrationMethod: "email" | "phone" | null;
}

interface Actions {
  setAuthEmail: (email: string) => void;
  setAuthPhoneNumber: (phoneNumber: string) => void;
  setAuthCode: (code: string) => void;
  setRegistrationMethod: (method: "email" | "phone" | null) => void;
}

const useAuthEmailStore = create<States & Actions>()((set) => ({
  authEmail: "",
  authPhoneNumber: "",
  authCode: "",
  registrationMethod: null,
  setAuthEmail: (authEmail: string) => {
    set({ authEmail });
  },
  setAuthCode: (authCode: string) => {
    set({ authCode });
  },
  setAuthPhoneNumber: (authPhoneNumber: string) => {
    set({ authPhoneNumber });
  },
  setRegistrationMethod: (registrationMethod: "email" | "phone" | null) => {
    set({ registrationMethod });
  },
}));

export default useAuthEmailStore;
