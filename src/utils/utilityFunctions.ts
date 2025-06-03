import { StaticImageData } from "next/image";
import icons from "../../public/icons";
import images from "../../public/images";

const currencyIcons = {
  ngnIcon: icons.currenciesIcons.ngnIcon,
  usdIcon: icons.currenciesIcons.usdIcon,
  eurIcon: icons.currenciesIcons.eurIcon,
  gbpIcon: icons.currenciesIcons.gbpIcon,
};

const networkIcons = {
  mtnIcon: images.airtime.mtnLogo,
  gloIcon: images.airtime.gloLogo,
  airtelIcon: images.airtime.airtelLogo,
  "9mobile": images.airtime.etisalatLogo,
};

const cableIcons = {
  dstvIcon: icons.userIcons.dstvIcon,
  gotvIcon: icons.userIcons.gotvIcon,
  startimesIcon: icons.userIcons.startimesIcon,
};

// For email masking and initials
export function getInitials(firstName: string, lastName: string): string {
  const firstInitial = firstName.charAt(0).toUpperCase();
  const lastInitial = lastName.charAt(0).toUpperCase();

  return `${firstInitial}${lastInitial}`;
}

export function maskEmail(email: string): string {
  const [localPart, domain] = email.split("@");
  const maskedLocalPart = `${localPart[0]}${"*".repeat(
    localPart.length - 2
  )}${localPart.slice(-1)}`;
  return `${maskedLocalPart}@${domain}`;
}

// For clipboard operations
export const handleCopy = (value: string, callback: () => void): void => {
  navigator.clipboard.writeText(value).then(() => {
    callback();
  });
};

export const formatNumberWithCommas = (value: string) => {
  // Remove existing commas and get the number
  const numberValue = value.replace(/,/g, '');
  // Format with commas
  return numberValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// For numeric input handling
export const handleNumericKeyDown = (
  e: React.KeyboardEvent<HTMLInputElement>
): void => {
  if (
    e.key === "Backspace" ||
    e.key === "Tab" ||
    e.key === "Enter" ||
    e.ctrlKey ||
    e.metaKey
  ) {
    return;
  }

  if (!/[0-9]/.test(e.key)) {
    e.preventDefault();
  }
};

export const handleNumericPaste = (
  e: React.ClipboardEvent<HTMLInputElement>
): void => {
  const pastedData = e.clipboardData.getData("text");

  if (!/^\d+$/.test(pastedData)) {
    e.preventDefault();
  }
};

// For file downloads
export const handleDownload = (url: string, fileName: string): void => {
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  link.setAttribute("target", "_blank");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// For transforming arrays
interface LabelValue {
  value: string | number;
  label: string;
}

export const transformToLabelValue = <T extends Record<string, unknown>>(
  array: T[],
  valueKey: keyof T,
  labelKey: keyof T
): LabelValue[] => {
  return array?.map((item) => ({
    value: item[valueKey] as string | number,
    label: item[labelKey] as string,
  }));
};

// For number formatting
export function formatNumberWithoutExponential(
  number: number,
  decimalPlaces: number
): string {
  if (typeof number !== "number" || isNaN(number)) {
    return "Invalid number";
  }

  let formattedNumber: string = number.toString();

  if (Math.abs(number) < 1 && formattedNumber.length > decimalPlaces + 2) {
    formattedNumber = number.toFixed(decimalPlaces + 5).replace(/\.?0*$/, "");
  } else {
    formattedNumber = number.toFixed(decimalPlaces);
  }

  return formattedNumber;
}

type CurrencyIconKey = "ngn" | "usd" | "eur" | "gbp";

export const getCurrencyIconByString = (currency: string): string | null => {
  const iconMap: Record<CurrencyIconKey, string> = {
    ngn: currencyIcons.ngnIcon,
    usd: currencyIcons.usdIcon,
    eur: currencyIcons.eurIcon,
    gbp: currencyIcons.gbpIcon,
  };

  return iconMap[currency as CurrencyIconKey] || null;
};

type NetworkIconKey = "mtn" | "glo" | "airtel" | "9mobile";

export const getNetworkIconByString = (
  network: string
): string | StaticImageData | null => {
  const iconMap: Record<NetworkIconKey, string | StaticImageData> = {
    mtn: networkIcons.mtnIcon,
    glo: networkIcons.gloIcon,
    airtel: networkIcons.airtelIcon,
    "9mobile": networkIcons["9mobile"],
  };

  return iconMap[network as NetworkIconKey] || null;
};

type CableIconsKey = "dstv" | "gotv" | "startimes";

export const getCableIconByString = (
  provider: string
): string | StaticImageData | null => {
  const iconMap: Record<CableIconsKey, string | StaticImageData> = {
    dstv: cableIcons.dstvIcon,
    gotv: cableIcons.gotvIcon,
    startimes: cableIcons.startimesIcon,
  };

  return iconMap[provider as CableIconsKey] || null;
};

export const shortenReference = ({
  ref,
  first = 4,
  last = 4,
  limit = 2,
}: {
  ref: string;
  first?: number;
  last?: number;
  limit?: number;
}) => {
  if (!ref) return "";

  if (ref.length > limit) {
    return `${ref.slice(0, first)}...${ref.slice(-last)}`;
  }

  return ref;
};

export const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
  e.target.value = e.target.value.replace(/[^0-9+]/g, "");
};
