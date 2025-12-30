import images from "../../public/images";
import { IoSettingsOutline, IoWalletOutline } from "react-icons/io5";
import { RxDashboard } from "react-icons/rx";
import { PiCellSignalFullBold, PiHandWithdraw } from "react-icons/pi";
import { FaWifi, FaChartLine } from "react-icons/fa6";
import { LiaMoneyBillWaveSolid, LiaPiggyBankSolid } from "react-icons/lia";
import { LuTicket } from "react-icons/lu";
import { TfiList } from "react-icons/tfi";
import { CiCreditCard1 } from "react-icons/ci";
import { GiSettingsKnobs } from "react-icons/gi";
import { FiLogOut, FiHelpCircle } from "react-icons/fi";
import { BENEFICIARY_TYPE, BeneficiaryProps, NETWORK } from "./types";

export const statusStyles = {
  success: "text-text-1600",
  failed: "text-red-500",
  pending: "text-yellow-500",
};

export const NavItems = [
  {
    id: 1,
    title: "Home",
    path: "/",
  },
  {
    id: 2,
    title: "About",
    path: "/about",
  },
  {
    id: 3,
    title: "FAQs",
    path: "/faqs",
  },

  {
    id: 4,
    title: "Contact Us",
    path: "/contact-us",
  },
];

export const ServicesData = [
  {
    id: 1,
    title: "Airtime Top Ups",
    image: images.landingPage.servicesAirtimeIcon,
    description:
      "Top up your mobile phone with airtime from your favorite network service providers locally and internationally",
  },
  {
    id: 2,
    title: "Mobile Data Top Up",
    image: images.landingPage.servicesDataIcon,
    description:
      "Top up your mobile devices with your favorite internet subscription plans from all internet network providers",
  },
  {
    id: 3,
    title: "Internets",
    image: images.landingPage.servicesInternetsIcon,
    description:
      "Pay for internet subscriptions from internet routers and network internet cables like Smile, Swift, Mobitel etc.",
  },

  {
    id: 4,
    title: "Savings & Investments",
    image: images.landingPage.servicesSavingsIcon,
    description:
      "Create savings goals and track your progress. Earn attractive interest rates on your savings, and Manage your investment portfolios",
  },

  {
    id: 5,
    title: "Instant Transfers",
    image: images.landingPage.servicesTransferIcon,
    description:
      "Send money to friends and family instantly to any bank or physically through cash pickups. Receive funds quickly and securely.",
  },

  {
    id: 6,
    title: "Instant Virtual Cards",
    image: images.landingPage.servicesCardsIcon,
    description:
      "Create Naira and USD virtual cards for secure online shopping. Set spending limits and track your expenses effortlessly",
  },

  {
    id: 7,
    title: "Flight/Bus Tickets",
    image: images.landingPage.servicesTicketsIcon,
    description:
      "Book bus tickets for intercity travel within Nigeria. Book domestic and international flights at competitive rates.",
  },

  {
    id: 8,
    title: "Healthcare & Insurance",
    image: images.landingPage.servicesInsuranceIcon,
    description:
      "Access healthcare services and purchase insurance plans. Find the best options for your health and insurance needs",
  },

  {
    id: 9,
    title: "Other Bills",
    image: images.landingPage.servicesOthersIcon,
    description:
      "Pay for Movie tickets, TV subscriptions, school fees, WAEC PIN, JAMB registrations, electricity, Govt fees, and many more",
  },
];

export const WcuData = [
  {
    id: 1,
    title: "Fast Transactions",
    description:
      "Nattypay offers a one-stop solution for all your financial needs. our platform is designed to simplify your financial life.",
  },
  {
    id: 2,
    title: "Convenience",
    description:
      "With NattyPay, you can manage your finances anytime, anywhere by eliminating the need to visit a bank or service provider.",
  },
  {
    id: 3,
    title: "Security",
    description:
      "We prioritize the security of your financial information, by employing advanced encryption and fraud detection technologies to safeguard your transactions, giving you peace of mind",
  },

  {
    id: 4,
    title: "Customer Support",
    description:
      "Our dedicated support team is always ready to help. Whether you have a question about a transaction or need assistance with our services, we are here to provide prompt and effective solutions.",
  },
];

export const CoreValuesData = [
  {
    id: 1,
    title: "Customer-Centricity",
    image: images.about.coreValues1,
    description:
      "At the heart of everything we do is our commitment to our customers. We listen to their needs, understand their challenges, and tailor our services to provide the best possible solutions",
  },
  {
    id: 2,
    title: "Innovation",
    image: images.about.coreValues2,
    description:
      "We believe in the power of technology to transform lives. NattyPay is built on a foundation of continuous innovation, leveraging the latest advancements in fintech to offer cutting-edge services",
  },
  {
    id: 3,
    title: "Integrity",
    image: images.about.coreValues3,
    description:
      "Trust is the cornerstone of our business. We operate with the highest standards of honesty, transparency, and ethical behavior.",
  },

  {
    id: 4,
    title: "Inclusivity",
    image: images.about.coreValues1,
    description:
      "We are dedicated to making financial services accessible to all Nigerians, regardless of their location or economic status",
  },
];

export const SidebarData = [
  {
    id: 1,
    data: [
      {
        id: 1,
        title: "Dashboard",
        path: "/user/dashboard",
        icon: RxDashboard,
      },
      {
        id: 100,
        title: "Payment",
        path: "/user/payments",
        icon: IoWalletOutline,
      },
      {
        id: 101,
        title: "Savings",
        path: "/user/savings",
        icon: LiaPiggyBankSolid,
      },
      {
        id: 102,
        title: "Finance",
        path: "/user/finance",
        icon: FaChartLine,
      },
      {
        id: 103,
        title: "Cards",
        path: "/user/cards",
        icon: CiCreditCard1,
      },
      {
        id: 104,
        title: "Accounts",
        path: "/user/account",
        icon: IoWalletOutline,
      },
      {
        id: 105,
        title: "Transactions",
        path: "/user/transactions",
        icon: TfiList,
      },
      {
        id: 106,
        title: "Support",
        path: "/user/support",
        icon: FiHelpCircle,
      },
      {
        id: 2,
        title: "Send Money",
        path: "/user/send-money",
        icon: IoWalletOutline,
      },
      {
        id: 3,
        title: "Withdraw",
        path: "/user/withdraw",
        icon: PiHandWithdraw,
      },
      {
        id: 4,
        title: "Airtime",
        path: "/user/airtime",
        icon: PiCellSignalFullBold,
      },

      {
        id: 5,
        title: "Internet",
        path: "/user/internet/mobile-data",
        icon: FaWifi,
      },
    ],
  },
  {
    id: 2,
    data: [
      {
        id: 2,
        title: "Wallet",
        path: "/user/wallet",
        icon: LuTicket,
      },
      

    ],
  },
  {
    id: 3,
    data: [
      {
        id: 2,
        title: "Invest",
        path: "/user/invest",
        icon: GiSettingsKnobs,
      },
    ],
  },
  {
    id: 4,
    data: [
      {
        id: 1,
        title: "Settings",
        path: "/user/settings/profile",
        icon: IoSettingsOutline,
      },
      {
        id: 2,
        title: "Logout",
        path: "/logout",
        icon: FiLogOut,
      },
    ],
  },
];

export const DashboardSortList = [
  {
    id: 1,
    label: "All Time",
    value: "all",
  },
  {
    id: 2,
    label: "Today",
    value: "today",
  },
  {
    id: 3,
    label: "Last 7 days",
    value: "week",
  },
  {
    id: 4,
    label: "This Month",
    value: "month",
  },
  {
    id: 5,
    label: "This Year",
    value: "year",
  },
];

export const dummyBeneficiaries: BeneficiaryProps[] = [
  {
    id: "1",
    userId: "user_001",
    type: BENEFICIARY_TYPE.TRANSFER,
    bankName: "Bank A",
    bankCode: "BA001",
    accountNumber: "1234567890",
    accountName: "John Doe",
    network: NETWORK.mtn,
    billerNumber: "BN001",
    operatorId: 1,
    billerCode: "BC001",
    itemCode: "IC001",
    currency: "USD",
    createdAt: new Date("2023-01-01T10:00:00Z"),
    updatedAt: new Date("2023-01-02T10:00:00Z"),
  },
  {
    id: "2",
    userId: "user_002",
    type: BENEFICIARY_TYPE.BILL,
    bankName: "Bank B",
    bankCode: "BB002",
    accountNumber: "0987654321",
    accountName: "Jane Smith",
    network: NETWORK.airtel,
    billerNumber: "BN002",
    operatorId: 2,
    billerCode: "BC002",
    itemCode: "IC002",
    currency: "EUR",
    createdAt: new Date("2023-02-01T10:00:00Z"),
    updatedAt: new Date("2023-02-02T10:00:00Z"),
  },
  {
    id: "3",
    userId: "user_003",
    type: BENEFICIARY_TYPE.TRANSFER,
    bankName: "Bank C",
    bankCode: "BC003",
    accountNumber: "1122334455",
    accountName: "Alice Johnson",
    network: NETWORK.etisalat,
    billerNumber: "BN003",
    operatorId: 3,
    billerCode: "BC003",
    itemCode: "IC003",
    currency: "GBP",
    createdAt: new Date("2023-03-01T10:00:00Z"),
    updatedAt: new Date("2023-03-02T10:00:00Z"),
  },
  {
    id: "4",
    userId: "user_004",
    type: BENEFICIARY_TYPE.BILL,
    bankName: "Bank D",
    bankCode: "BD004",
    accountNumber: "2233445566",
    accountName: "Bob Brown",
    network: NETWORK.glo,
    billerNumber: "BN004",
    operatorId: 4,
    billerCode: "BC004",
    itemCode: "IC004",
    currency: "NGN",
    createdAt: new Date("2023-04-01T10:00:00Z"),
    updatedAt: new Date("2023-04-02T10:00:00Z"),
  },
  {
    id: "5",
    userId: "user_005",
    type: BENEFICIARY_TYPE.TRANSFER,
    bankName: "Bank E",
    bankCode: "BE005",
    accountNumber: "3344556677",
    accountName: "Charlie Davis",
    network: NETWORK.mtn,
    billerNumber: "BN005",
    operatorId: 5,
    billerCode: "BC005",
    itemCode: "IC005",
    currency: "USD",
    createdAt: new Date("2023-05-01T10:00:00Z"),
    updatedAt: new Date("2023-05-02T10:00:00Z"),
  },
];
