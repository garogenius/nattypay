import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import Image from "next/image";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import NextTopLoader from "nextjs-toploader";
import "react-loading-skeleton/dist/skeleton.css";
import { Toaster } from "react-hot-toast";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import UserProvider from "@/providers/UserProvider";
import AdModalsProvider from "@/providers/AdModalsProvider";
import "react-datepicker/dist/react-datepicker.css";
import ClientOnlyWelcome from "@/components/ClientOnlyWelcome";
import TransactionViewModal from "@/components/modals/transactions/TransactionViewModal";
import InsufficientBalanceModal from "@/components/modals/finance/InsufficientBalanceModal";
import ClipboardDetector from "@/components/ClipboardDetector";
import TransactionProcessingModal from "@/components/modals/TransactionProcessingModal";

// Initialize Inter font
const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nattypay – Beyond Banking for a Smarter Financial Future",
  description:
    "Experience seamless financial transactions with Nattypay, a local and global leading financial service provider, We make the best and easiest banking for you",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedTheme = localStorage.getItem('theme');
                  // Default theme is DARK for now (light mode toggle hidden in settings)
                  const isDark = savedTheme ? savedTheme === 'dark' : true;
                  
                  if (isDark) {
                    document.documentElement.setAttribute("data-mode", "dark");
                    document.documentElement.className = "dark";
                  } else {
                    document.documentElement.setAttribute("data-mode", "light");
                    document.documentElement.className = "";
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <ThemeProvider>
          <ReactQueryProvider>
            <UserProvider>
              <AdModalsProvider>
                <Toaster
                  position="top-center"
                  reverseOrder={false}
                  toastOptions={{
                    style: {
                      border: "1px solid #E4E7EC",
                      borderRadius: 15,
                      padding: "16px",
                      color: "#000",
                      fontSize: 15,
                      fontWeight: 400,
                    },
                    duration: 10000,
                  }}
                />
                <NextTopLoader color="#D4B139" showSpinner={false} />
                <ClientOnlyWelcome />
                {/* Preload global transaction loader GIF so it appears instantly when needed */}
                <Image
                  src="/images/natty01.gif"
                  alt=""
                  width={1}
                  height={1}
                  priority
                  unoptimized
                  className="hidden"
                />
                <main className="w-full overflow-hidden">{children}</main>
                <TransactionViewModal />
                <InsufficientBalanceModal />
                <TransactionProcessingModal />
                <ClipboardDetector />
              </AdModalsProvider>
            </UserProvider>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
