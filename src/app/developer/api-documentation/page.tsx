"use client";

import Link from "next/link";
import { useState } from "react";
import { BsFileEarmarkText, BsPlayFill } from "react-icons/bs";
import { FiExternalLink } from "react-icons/fi";
import DeveloperHeader from "@/components/developer/DeveloperHeader";

const POSTMAN_DOC_URL =
  "https://documenter.getpostman.com/view/28187920/2sB2qfBzzM#intro";

const SidebarLink = ({ href, label, icon: Icon }: { href: string; label: string; icon?: any }) => (
  <Link
    href={href}
    target={href.startsWith("http") ? "_blank" : undefined}
    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-200 dark:text-text-400 hover:bg-bg-1500 dark:hover:bg-bg-1700"
  >
    {Icon ? <Icon className="text-secondary" /> : null}
    <span>{label}</span>
    {href.startsWith("http") ? <FiExternalLink className="ml-auto opacity-70" /> : null}
  </Link>
);

const introductionContent = (
  <div className="space-y-8 break-words">
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Introduction</h1>
      <p className="text-gray-600 text-base sm:text-lg mb-6">
        Welcome to NattyPay API Documentation. NattyPay is a comprehensive fintech API platform designed to facilitate seamless financial transactions and services in Nigeria.
      </p>
    </div>

    <div>
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">What is NattyPay?</h2>
      <p className="text-gray-600 text-base sm:text-lg mb-4">
        NattyPay provides developers with powerful APIs to integrate payment processing, wallet management, bill payments, and financial services into their applications. Our platform enables businesses to offer their users a complete financial ecosystem with features like airtime and data purchases, school fee payments, secure transfers, and QR code payments.
      </p>
    </div>

    <div>
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">Key Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">User Management</h3>
            <p className="text-gray-600 text-sm sm:text-base">Complete user authentication, verification (phone, NIN), and account management with support for both personal and business accounts.</p>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Wallet Operations</h3>
            <p className="text-gray-600 text-sm sm:text-base">Secure wallet management with PIN protection, multi-currency support, QR code payments, and comprehensive transaction tracking.</p>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Bill Payments</h3>
            <p className="text-gray-600 text-sm sm:text-base">Pay for airtime, data bundles, electricity, cable TV, and school fees across multiple Nigerian service providers.</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Secure Transactions</h3>
            <p className="text-gray-600 text-sm sm:text-base">Bank-grade security with encrypted communications, PIN verification, and comprehensive fraud prevention measures.</p>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Real-time Processing</h3>
            <p className="text-gray-600 text-sm sm:text-base">Instant transaction processing with real-time status updates and webhook notifications for all payment events.</p>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Developer-Friendly</h3>
            <p className="text-gray-600 text-sm sm:text-base">RESTful API design with comprehensive documentation, sandbox environment, and multiple language SDKs.</p>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">API Overview</h2>
      <p className="text-gray-600 text-base sm:text-lg mb-4">
        Our API is organized into several key categories:
      </p>
      <ul className="list-disc list-inside text-gray-600 space-y-2">
        <li><strong>Auth:</strong> User registration, login, and authentication</li>
        <li><strong>User:</strong> Profile management, verification, and account operations</li>
        <li><strong>Bill:</strong> Airtime, data, electricity, cable, and school fee payments</li>
        <li><strong>Wallet:</strong> Balance management, transfers, and transaction history</li>
      </ul>
    </div>

    <div>
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">Supported Currencies</h2>
      <p className="text-gray-600 text-base sm:text-lg mb-4">
        NattyPay primarily supports Nigerian Naira (NGN) with plans for multi-currency expansion. All transactions are processed in real-time with competitive exchange rates.
      </p>
    </div>
  </div>
);

const gettingStartedContent = (
  <div className="space-y-8 break-words">
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Getting Started</h1>
      <p className="text-gray-600 text-base sm:text-lg mb-6">
        Follow these steps to quickly integrate NattyPay into your application and start processing payments.
      </p>
    </div>

    <div>
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">Prerequisites</h2>
      <ul className="list-disc list-inside text-gray-600 space-y-2">
        <li>A valid business registration or personal account</li>
        <li>Basic knowledge of REST APIs and HTTP requests</li>
        <li>A development environment with your preferred programming language</li>
        <li>Familiarity with JSON data format</li>
      </ul>
    </div>

    <div>
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">1. Create a Developer Account</h2>
      <p className="text-gray-600 text-base sm:text-lg mb-4 break-words">
        Sign up for a NattyPay developer account at our registration page. You'll need to provide basic business information and verify your identity.
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 w-full max-w-full break-words">
        <p className="text-blue-800 break-all">
          <strong>Note:</strong> During registration, specify whether you're creating a personal or business account, as this affects available features and limits.
        </p>
      </div>
    </div>

    <div>
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">2. Obtain Your API Keys</h2>
      <p className="text-gray-600 mb-4">
        After account creation, you'll receive two sets of API keys:
      </p>
      <ul className="list-disc list-inside text-gray-600 space-y-2">
        <li><strong>Sandbox Keys:</strong> For testing and development</li>
        <li><strong>Production Keys:</strong> For live transactions</li>
      </ul>
      <p className="text-gray-600 mb-4">
        Always use sandbox keys during development to avoid real transactions.
      </p>
    </div>

    <div>
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">3. Authentication</h2>
      <p className="text-gray-600 mb-4 break-words">
        All API requests require authentication using Bearer tokens. Include your API key in the Authorization header:
      </p>
      <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm w-full max-w-full overflow-x-auto">
        <p>Authorization: Bearer YOUR_API_KEY</p>
      </div>
      <p className="text-gray-600 mt-4 break-all">
        Additionally, include your API key in the x-api-key header for enhanced security.
      </p>
    </div>

    <div>
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">4. Make Your First API Call</h2>
      <p className="text-gray-600 mb-4 break-words">
        Let's start with a simple request to get airtime variations for MTN Nigeria:
      </p>
      <div className="bg-gray-100 rounded-lg p-4 w-full max-w-full overflow-x-auto">
        <pre className="text-sm overflow-x-auto max-w-full">
{`curl --location 'https://backend-api-production-e3f2.up.railway.app/api/v1/bill/airtime/get-variation?operatorId=341' \\
--header 'Authorization: Bearer YOUR_API_KEY' \\
--header 'x-api-key: YOUR_API_KEY'`}
        </pre>
      </div>
      <p className="text-gray-600 mt-4">
        This request will return available airtime plans and pricing for MTN Nigeria.
      </p>
    </div>

    <div>
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">5. Handle Responses</h2>
      <p className="text-gray-600 mb-4 break-words">
        All API responses follow a consistent JSON format:
      </p>
      <div className="bg-gray-100 rounded-lg p-4 w-full max-w-full overflow-x-auto">
        <pre className="text-sm overflow-x-auto max-w-full">
{`{
  "message": "Success message",
  "statusCode": 200,
  "data": {
    // Response data
  }
}`}
        </pre>
      </div>
    </div>

    <div>
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">6. Error Handling</h2>
      <p className="text-gray-600 mb-4">
        Handle errors gracefully by checking the statusCode and message fields:
      </p>
      <ul className="list-disc list-inside text-gray-600 space-y-2">
        <li><strong>200:</strong> Success</li>
        <li><strong>400:</strong> Bad Request (invalid parameters)</li>
        <li><strong>401:</strong> Unauthorized (invalid API key)</li>
        <li><strong>500:</strong> Internal Server Error</li>
      </ul>
    </div>

    <div>
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">Next Steps</h2>
      <p className="text-gray-600 mb-4">
        Now that you have the basics:
      </p>
      <ul className="list-disc list-inside text-gray-600 space-y-2">
        <li>Explore the full API reference for detailed endpoint documentation</li>
        <li>Test all endpoints in the sandbox environment</li>
        <li>Implement proper error handling and logging</li>
        <li>Set up webhook endpoints for real-time notifications</li>
        <li>Apply for production access when ready</li>
      </ul>
    </div>
  </div>
);

export default function ApiDocumentationPage() {
  const [activeTab, setActiveTab] = useState("introduction");

  return (
    <div className="w-full bg-white text-gray-900 overflow-x-hidden">
      <DeveloperHeader />

      <main className="w-full flex py-8 md:py-12 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 overflow-x-hidden max-w-full">
        {/* Sidebar */}
        <aside className="w-64 border-r border-gray-200 hidden md:block">
          <nav className="p-4 space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Documentation</h3>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setActiveTab("introduction")}
                    className={`w-full text-left text-sm px-2 py-1 rounded hover:bg-gray-100 ${
                      activeTab === "introduction" ? "bg-gray-200" : ""
                    }`}
                  >
                    Introduction
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab("getting-started")}
                    className={`w-full text-left text-sm px-2 py-1 rounded hover:bg-gray-100 ${
                      activeTab === "getting-started" ? "bg-gray-200" : ""
                    }`}
                  >
                    Getting Started
                  </button>
                </li>
              </ul>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-semibold text-gray-800 mb-2">Quick Links</h3>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/developer/api-reference"
                    className="w-full text-left text-sm px-2 py-1 rounded hover:bg-gray-100 block"
                  >
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link
                    href={POSTMAN_DOC_URL}
                    target="_blank"
                    className="w-full text-left text-sm px-2 py-1 rounded hover:bg-gray-100 block"
                  >
                    Postman Collection
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0 px-4 sm:px-4 md:px-6 max-w-screen-xl mx-auto break-words">
          {/* Mobile Tab Toggle */}
          <div className="md:hidden mb-6">
            <div role="tablist" aria-label="Documentation sections" className="w-full inline-flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "introduction"}
                onClick={() => setActiveTab("introduction")}
                className={`${activeTab === "introduction" ? "bg-gray-900 text-white" : "bg-white text-gray-700"} flex-1 px-3 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400`}
              >
                Introduction
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "getting-started"}
                onClick={() => setActiveTab("getting-started")}
                className={`${activeTab === "getting-started" ? "bg-gray-900 text-white" : "bg-white text-gray-700"} flex-1 px-3 py-2 text-sm font-medium border-l border-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400`}
              >
                Getting Started
              </button>
            </div>
          </div>
          {activeTab === "introduction" ? introductionContent : gettingStartedContent}
        </div>
      </main>
    </div>
  );
}
