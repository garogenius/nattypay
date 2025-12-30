import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import NextTopLoader from "nextjs-toploader";
import "react-loading-skeleton/dist/skeleton.css";
import { Toaster } from "react-hot-toast";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import UserProvider from "@/providers/UserProvider";
import "react-datepicker/dist/react-datepicker.css";
import ClientOnlyWelcome from "@/components/ClientOnlyWelcome";
import TransactionViewModal from "@/components/modals/transactions/TransactionViewModal";
import ClipboardDetector from "@/components/ClipboardDetector";

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
    <html lang="en" suppressHydrationWarning className="dark" data-mode="dark">
      <body className={inter.className}>
        <ThemeProvider>
          <ReactQueryProvider>
            <UserProvider>
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
                  duration: 100,
                }}
              />
              <NextTopLoader color="#D4B139" showSpinner={false} />
              <ClientOnlyWelcome />
              <main className="w-full overflow-hidden">{children}</main>
              <TransactionViewModal />
              <ClipboardDetector />
            </UserProvider>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
