"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import DeveloperHeader from "@/components/developer/DeveloperHeader";

const CopyButton = ({ text }: { text: string }) => (
  <button
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      navigator.clipboard.writeText(text);
    }}
    className="text-[11px] px-2 py-1 rounded border border-white/20 hover:bg-white/10"
  >
    Copy
  </button>
);

const Badge = ({ method }: { method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" }) => {
  const color = useMemo(() => {
    switch (method) {
      case "GET":
        return "bg-emerald-600";
      case "POST":
        return "bg-blue-600";
      case "PUT":
      case "PATCH":
        return "bg-yellow-600";
      case "DELETE":
        return "bg-rose-600";
    }
  }, [method]);
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold text-white ${color}`}>
      {method}
    </span>
  );
};

// Types
type ApiEndpoint = {
  title: string;
  description: string;
  method: string;
  endpoint: string;
  headers: { name: string; type: string; example: string }[];
  body: string;
  curl: string;
  response: string;
};

type ApiData = {
  [key: string]: ApiEndpoint[];
};

// API DATA CONFIG
const apiData: ApiData = {
  Auth: [
    {
      title: "Register User",
      description: "Register a new user.",
      method: "POST",
      endpoint: "https://backend-api-production-e3f2.up.railway.app/api/v1/auth/register-user",
      headers: [
        { name: "authorization", type: "Bearer Token", example: "Bearer <token>" },
        { name: "x-api-key", type: "string", example: "2442555352662653" },
      ],
      body: `{
  "username": "AbuksLC",
  "fullname": "Abuks Inc",
  "email": "abuksinccc@gmail.com",
  "password": "Caicedo123",
  "dateOfBirth": "8-Mar-1996",
  "countryCode": "NGN",
  "companyRegistrationNumber":"RC-234555",
  "accountType":"BUSINESS",
  "referralCode": ""
}`,
      curl: `curl --location 'https://backend-api-production-e3f2.up.railway.app/api/v1/auth/register-business' \\
--header 'x-api-key: 2442555352662653' \\
--data-raw '{
  "username": "AbuksLC",
  "fullname": "Abuks Inc",
  "email": "abuksinccc@gmail.com",
  "password": "Caicedo123",
  "dateOfBirth": "8-Mar-1996",
  "countryCode": "NGN",
  "companyRegistrationNumber":"RC-234555",
  "accountType":"BUSINESS",
  "referralCode": ""
}'`,
      response: `{
  "message": "User created successfully",
  "user": {
    "id": "4c8c3a7e-58a8-4c3c-8915-d73317ae4f43",
    "email": "abuksinccc@gmail.com",
    "username": "AbuksLC",
    "fullname": "Abuks Inc",
    "createdAt": "2025-06-01T20:55:55.374Z",
    "status": "active",
    "accountType": "BUSINESS"
  },
  "statusCode": 200
}`,
    },
  ],
  User: [
    {
      title: "Verify Phone Number",
      description: "Verify user phone number with OTP.",
      method: "POST",
      endpoint: "https://backend-api-production-e3f2.up.railway.app/api/v1/user/verify-phoneNumber",
      headers: [
        { name: "authorization", type: "Bearer Token", example: "Bearer <token>" },
        { name: "x-api-key", type: "string", example: "2442555352662653" },
      ],
      body: `{
  "email": "abrahamosazee3@gmail.com",
  "otp": "8773"
}`,
      curl: `curl --location 'https://backend-api-production-e3f2.up.railway.app/api/v1/user/verify-phoneNumber' \\
--header 'x-api-key: 2442555352662653' \\
--data '{
  "email": "abrahamosazee3@gmail.com",
  "otp": "8773"
}'`,
      response: `{
  "message": "Phone number verified successfully",
  "statusCode": 200
}`,
    },
    {
      title: "Verify NIN",
      description: "Verify user's National Identity Number (NIN).",
      method: "POST",
      endpoint: "https://backend-api-production-e3f2.up.railway.app/api/v1/user/verify-nin",
      headers: [
        { name: "authorization", type: "Bearer Token", example: "Bearer <token>" },
        { name: "x-api-key", type: "string", example: "2442555352662653" },
      ],
      body: `{
  "nin": ""
}`,
      curl: `curl --location 'https://backend-api-production-e3f2.up.railway.app/api/v1/user/verify-nin' \\
--header 'x-api-key: 2442555352662653' \\
--data '{
  "nin": ""
}'`,
      response: `{
  "message": "NIN verified successfully",
  "statusCode": 200
}`,
    },
    {
      title: "Report Scam",
      description: "Report a scam incident.",
      method: "POST",
      endpoint: "https://backend-api-production-e3f2.up.railway.app/api/v1/user/report-scam",
      headers: [
        { name: "authorization", type: "Bearer Token", example: "Bearer <token>" },
        { name: "x-api-key", type: "string", example: "2442555352662653" },
      ],
      body: `{
  "screenshot": "[File]",
  "title": "title of the report scam",
  "description": "description"
}`,
      curl: `curl --location 'https://backend-api-production-e3f2.up.railway.app/api/v1/user/report-scam' \\
--header 'x-api-key: 2442555352662653' \\
--form 'screenshot=@"path/to/file"' \\
--form 'title="title of the report scam"' \\
--form 'description="description"'`,
      response: `{
  "message": "Information retrieve successfully",
  "statusCode": 200
}`,
    },
    {
      title: "Create Business Account",
      description: "Create a business account for a user.",
      method: "POST",
      endpoint: "https://backend-api-production-e3f2.up.railway.app/api/v1/user/create-business-account",
      headers: [
        { name: "authorization", type: "Bearer Token", example: "Bearer <token>" },
        { name: "x-api-key", type: "string", example: "2442555352662653" },
      ],
      body: `{
  "bvn": "22222222226",
  "companyRegistrationNumber": "RC34564567"
}`,
      curl: `curl --location 'https://backend-api-production-e3f2.up.railway.app/api/v1/user/create-business-account' \\
--header 'x-api-key: 2442555352662653' \\
--data '{
  "bvn": "22222222226",
  "companyRegistrationNumber": "RC34564567"
}'`,
      response: `{
  "message": "Business wallet created successfully",
  "statusCode": 201,
  "data": {
    "id": "65754e0b-43b8-458a-8ef5-36f6753c38a3",
    "userId": "790aebfd-316b-4bcf-88ee-5a64beea797c",
    "balance": "0",
    "currency": "NGN",
    "accountName": "nattypay/Abuks llc",
    "bankName": "WEMA BANK",
    "bankCode": null,
    "accountNumber": "8548729462",
    "createdAt": "2024-12-27T01:53:45.847Z",
    "updatedAt": "2024-12-27T01:53:45.847Z",
    "accountRef": "URF_1735264416834_7779635"
  }
}`,
    },
    {
      title: "Change Passcode",
      description: "Change the user's passcode.",
      method: "PUT",
      endpoint: "https://backend-api-production-e3f2.up.railway.app/api/v1/user/change-passcode",
      headers: [
        { name: "authorization", type: "Bearer Token", example: "Bearer <token>" },
        { name: "x-api-key", type: "string", example: "2442555352662653" },
      ],
      body: `{
  "oldPasscode": "123456",
  "newPasscode": "123452"
}`,
      curl: `curl --location --request PUT 'https://backend-api-production-e3f2.up.railway.app/api/v1/user/change-passcode' \\
--header 'x-api-key: 2442555352662653' \\
--data '{
  "oldPasscode": "123456",
  "newPasscode": "123452"
}'`,
      response: `{
  "message": "Passcode updated successfully",
  "statusCode": 200
}`
    },
    {
      title: "Create Foreign Account",
      description: "Create a foreign currency account.",
      method: "POST",
      endpoint: "https://backend-api-production-e3f2.up.railway.app/api/v1/user/create-foreign-account",
      headers: [
        { name: "authorization", type: "Bearer Token", example: "Bearer <token>" },
        { name: "x-api-key", type: "string", example: "2442555352662653" }
      ],
      body: `{
  "currency": "USD"
}`,
      curl: `curl --location 'https://backend-api-production-e3f2.up.railway.app/api/v1/user/create-foreign-account' \\
--header 'x-api-key: 2442555352662653' \\
--data '{
  "currency": "USD"
}'`,
      response: `{
  "message": "Account must be of USD type",
  "error": "Bad Request",
  "statusCode": 400
}`
    }
  ],
  Bill: [
    {
      title: "Get Airtime Variation",
      description: "Retrieve airtime variation details for a specific operator.",
      method: "GET",
      endpoint: "https://backend-api-production-e3f2.up.railway.app/api/v1/bill/airtime/get-variation?operatorId=341",
      headers: [
        { name: "authorization", type: "Bearer Token", example: "Bearer <token>" },
        { name: "x-api-key", type: "string", example: "2442555352662653" }
      ],
      body: "",
      curl: `curl --location 'https://backend-api-production-e3f2.up.railway.app/api/v1/bill/airtime/get-variation?operatorId=341' \
--header 'x-api-key: 2442555352662653'`,
      response: `{
  "message": "Variation retrieve successfully",
  "statusCode": 200,
  "data": {
    "id": 341,
    "operatorId": 341,
    "name": "MTN Nigeria",
    "bundle": false,
    "data": false,
    "pin": false,
    "comboProduct": false,
    "supportsLocalAmounts": true,
    "supportsGeographicalRechargePlans": false,
    "denominationType": "RANGE",
    "senderCurrencyCode": "NGN",
    "senderCurrencySymbol": "₦",
    "destinationCurrencyCode": "NGN",
    "destinationCurrencySymbol": "₦",
    "commission": 5,
    "internationalDiscount": 5,
    "localDiscount": 0,
    "mostPopularAmount": null,
    "mostPopularLocalAmount": null,
    "minAmount": 50,
    "maxAmount": 200000,
    "localMinAmount": null,
    "localMaxAmount": null,
    "country": {
      "isoName": "NG",
      "name": "Nigeria"
    },
    "fx": {
      "rate": 1,
      "currencyCode": "NGN"
    }
  }
}`
    },
    {
      title: "Get Airtime Plan",
      description: "Retrieve available airtime plans for a specific operator.",
      method: "GET",
      endpoint: "https://backend-api-production-e3f2.up.railway.app/api/v1/bill/airtime/get-plans?operatorId=341",
      headers: [
        { name: "authorization", type: "Bearer Token", example: "Bearer <token>" },
        { name: "x-api-key", type: "string", example: "2442555352662653" }
      ],
      body: "",
      curl: `curl --location 'https://backend-api-production-e3f2.up.railway.app/api/v1/bill/airtime/get-plans?operatorId=341' \
--header 'x-api-key: 2442555352662653'`,
      response: `{
  "message": "Plans retrieved successfully",
  "statusCode": 200,
  "data": [
    {
      "id": 1,
      "name": "MTN 1GB Data Plan",
      "amount": 1000,
      "validity": "30 days",
      "description": "1GB data bundle valid for 30 days"
    },
    {
      "id": 2,
      "name": "MTN 2.5GB Data Plan",
      "amount": 2000,
      "validity": "30 days",
      "description": "2.5GB data bundle valid for 30 days"
    }
  ]
}`
    },
    {
      title: "Pay for School Fee",
      description: "Make a school fee payment.",
      method: "POST",
      endpoint: "https://backend-api-production-e3f2.up.railway.app/api/v1/bill/pay/school-fee",
      headers: [
        { name: "authorization", type: "Bearer Token", example: "Bearer <token>" },
        { name: "x-api-key", type: "string", example: "2442555352662653" }
      ],
      body: `{
  "schoolId": "12345",
  "studentId": "STU123",
  "amount": 50000,
  "term": "First Term",
  "session": "2023/2024",
  "pin": "1234"
}`,
      curl: `curl --location 'https://backend-api-production-e3f2.up.railway.app/api/v1/bill/pay/school-fee' \
--header 'x-api-key: 2442555352662653' \
--data '{
  "schoolId": "12345",
  "studentId": "STU123",
  "amount": 50000,
  "term": "First Term",
  "session": "2023/2024",
  "pin": "1234"
}'`,
      response: `{
  "message": "School fee payment successful",
  "statusCode": 200,
  "data": {
    "transactionId": "TXN123456789",
    "amount": 50000,
    "fee": 100,
    "totalAmount": 50100,
    "status": "success",
    "date": "2023-06-15T10:30:00.000Z"
  }
}`
    },
    {
      title: "Get Data Plans",
      description: "Retrieve available data plans for a specific network.",
      method: "GET",
      endpoint: "https://backend-api-production-e3f2.up.railway.app/api/v1/bill/data/plans?network=MTN",
      headers: [
        { name: "authorization", type: "Bearer Token", example: "Bearer <token>" },
        { name: "x-api-key", type: "string", example: "2442555352662653" }
      ],
      body: "",
      curl: `curl --location 'https://backend-api-production-e3f2.up.railway.app/api/v1/bill/data/plans?network=MTN' \
--header 'x-api-key: 2442555352662653'`,
      response: `{
  "message": "Data plans retrieved successfully",
  "statusCode": 200,
  "data": [
    {
      "planId": "MTN-1GB",
      "name": "1GB Data Plan",
      "amount": 1000,
      "validity": "30 days",
      "description": "1GB data bundle valid for 30 days"
    },
    {
      "planId": "MTN-2.5GB",
      "name": "2.5GB Data Plan",
      "amount": 2000,
      "validity": "30 days",
      "description": "2.5GB data bundle valid for 30 days"
    }
  ]
}`
    },
    {
      title: "Buy Data",
      description: "Purchase a data plan.",
      method: "POST",
      endpoint: "https://backend-api-production-e3f2.up.railway.app/api/v1/bill/data/buy",
      headers: [
        { name: "authorization", type: "Bearer Token", example: "Bearer <token>" },
        { name: "x-api-key", type: "string", example: "2442555352662653" }
      ],
      body: `{
  "network": "MTN",
  "phoneNumber": "08012345678",
  "planId": "MTN-1GB",
  "amount": 1000,
  "pin": "1234"
}`,
      curl: `curl --location 'https://backend-api-production-e3f2.up.railway.app/api/v1/bill/data/buy' \
--header 'x-api-key: 2442555352662653' \
--data '{
  "network": "MTN",
  "phoneNumber": "08012345678",
  "planId": "MTN-1GB",
  "amount": 1000,
  "pin": "1234"
}'`,
      response: `{
  "message": "Data purchase successful",
  "statusCode": 200,
  "data": {
    "transactionId": "TXN987654321",
    "network": "MTN",
    "phoneNumber": "08012345678",
    "plan": "1GB Data Plan",
    "amount": 1000,
    "validity": "30 days",
    "status": "success",
    "date": "2023-06-15T10:30:00.000Z"
  }
}`
    }
  ],
  Wallet: [
    {
      title: "Set Wallet PIN",
      description: "Set a new wallet PIN.",
      method: "POST",
      endpoint: "https://backend-api-production-e3f2.up.railway.app/api/v1/wallet/set-pin",
      headers: [
        { name: "authorization", type: "Bearer Token", example: "Bearer <token>" },
        { name: "x-api-key", type: "string", example: "2442555352662653" }
      ],
      body: `{
  "pin": "1234"
}`,
      curl: `curl --location 'https://backend-api-production-e3f2.up.railway.app/api/v1/wallet/set-pin' \
--header 'x-api-key: 2442555352662653' \
--data '{
  "pin": "1234"
}'`,
      response: "No response body (204 No Content)"
    },
    {
      title: "Change Wallet PIN",
      description: "Change the user's wallet PIN.",
      method: "PUT",
      endpoint: "https://backend-api-production-e3f2.up.railway.app/api/v1/wallet/change-pin",
      headers: [
        { name: "authorization", type: "Bearer Token", example: "Bearer <token>" },
        { name: "x-api-key", type: "string", example: "2442555352662653" }
      ],
      body: `{
  "oldPin": "1234",
  "newPin": "5678"
}`,
      curl: `curl --location --request PUT 'https://backend-api-production-e3f2.up.railway.app/api/v1/wallet/change-pin' \
--header 'x-api-key: 2442555352662653' \
--data '{
  "oldPin": "1234",
  "newPin": "5678"
}'`,
      response: "No response body (204 No Content)"
    },
    {
      title: "Decode QR Code",
      description: "Decode a QR code to get bank details.",
      method: "POST",
      endpoint: "https://backend-api-production-e3f2.up.railway.app/api/v1/wallet/decode-qr",
      headers: [
        { name: "authorization", type: "Bearer Token", example: "Bearer <token>" },
        { name: "x-api-key", type: "string", example: "2442555352662653" }
      ],
      body: `{
  "qrCode": "data:image/png;base64,iVBOR..."
}`,
      curl: `curl --location 'https://backend-api-production-e3f2.up.railway.app/api/v1/wallet/decode-qr' \
--header 'x-api-key: 2442555352662653' \
--data '{
  "qrCode": "data:image/png;base64,iVBOR..."
}'`,
      response: `{
  "message": "QR Code decoded successfully",
  "statusCode": 200,
  "data": {
    "bankCode": "090286",
    "accountNumber": "8024123703",
    "currency": "NGN",
    "amount": "500"
  }
}`
    },
    {
      title: "Generate QR Code",
      description: "Generate a QR code for receiving payments.",
      method: "GET",
      endpoint: "https://backend-api-production-e3f2.up.railway.app/api/v1/wallet/generate-qrcode?amount=500",
      headers: [
        { name: "authorization", type: "Bearer Token", example: "Bearer <token>" },
        { name: "x-api-key", type: "string", example: "2442555352662653" }
      ],
      body: "",
      curl: `curl --location 'https://backend-api-production-e3f2.up.railway.app/api/v1/wallet/generate-qrcode?amount=500' \
--header 'x-api-key: 2442555352662653'`,
      response: `{
  "message": "Qrcode generated successfully",
  "statusCode": 200,
  "data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANQAAADUCAYAAADk3g0YAAAAAklEQVR4AewaftIAAAqZSURBVO3BQY7gRpIAQXei/v9l3z7GKQGCWS1pNszsD9ZaVzusta55WGtd87DWuuZhrXXNw1rrmoe11jUPa61rHtZa1zysta55WGtd87DWuuZhrXXNw1rrmoe11jUPa61rfvhI5W+qOFE5qZhUpopJ5aRiUjmpmFTeqJhUpopJ5Y2KSWWqOFGZKk5UpopJ5W+q+OJhrXXNw1rrmoe11jU/XFZxk8obFTdVvFHxRsWkMlWcVJxUnKhMKr9JZap4o+ImlZse1lrXPKy1rnlYa13zwy9TeaPiDZU3Kk5UpopJZaqYVE4qJpWpYlJ5o+KNikllqphU/k1U3qj4TQ9rrWse1lrXPKy1rvnh/7mKNyq+UJkqTiomlaniRGWqeEPlpGJSeUNlqvgve1hrXfOw1rrmYa11zQ//YyomlROVLyq+UPlC5TdVfKHy/8nDWuuah7XWNQ9rrWt++GUVf5PKGxWTyknFGxWTyknFGypTxaRyojJVTCpTxaQyVfxNFf8mD2utax7WWtc8rLWu+eEylX9SxaRyojJVTConKlPFpDJVTConKlPFf4nKVDGpTBUnKv9mD2utax7WWtc8rLWusT/4D1O5qeJE5aTiROWk4g2VqWJSOal4Q2WqeEPlpOK/7GGtdc3DWuuah7XWNfYHH6hMFZPKTRVvqLxRMal8UXGiclPFicobFZPKVDGpTBUnKlPFpHJTxW96WGtd87DWuuZhrXXNDx9VvFFxojJVnKicVEwqX1S8oTJVfFHxhspJxaTyhspU8UbFpDJVTCo3qUwVXzysta55WGtd87DWusb+4CKVqeJE5Y2KL1TeqPhC5aRiUpkqTlTeqJhU3qiYVN6oeENlqphU3qj4TQ9rrWse1lrXPKy1rrE/+ItUTipOVKaKSeWNiknlpOJE5aTiROWNikllqjhReaNiUpkqJpWpYlKZKk5UpopJ5aaHtdY1D2utax7WWtf88C9XMalMFScqU8Wk8kbFpHJTxRsqU8WkMlW8UTGpTBUnKlPFpDJVnKhMFV88rLWueVhrXfOw1rrmh/8xKicVk8pUMalMFZPKScWkMlVMKlPFpDJVnKhMFZPKVHGiMlW8UTGpTBWTylQxqUwVJypTxRcPa61rHtZa1zysta754X+cylRxUjGpTBVvqEwVk8pJxRsqU8WkMlW8UTGpTBUnKlPFpDJVnKhMFV88rLWueVhrXfOw1rrmYa11zcNa65qHtdY1D2utax7WWtc8rLWueVhrXfOw1rrmYa11zcNa65qHtdY1D2utax7WWtc8rLWueVhrXfOw1rrmYa11zf8BfXc8XQmZq8EAAAAASUVORK5CYII="
}`
    },
    {
      title: "Initiate Transfer",
      description: "Initiate a transfer to a bank account.",
      method: "POST",
      endpoint: "https://backend-api-production-e3f2.up.railway.app/api/v1/wallet/initiate-transfer",
      headers: [
        { name: "authorization", type: "Bearer Token", example: "Bearer <token>" },
        { name: "x-api-key", type: "string", example: "2442555352662653" }
      ],
      body: `{
  "bankCode": "035",
  "accountNumber": "8548737465",
  "amount": 500,
  "currency": "NGN",
  "description": ""
}`,
      curl: `curl --location 'https://backend-api-production-e3f2.up.railway.app/api/v1/wallet/initiate-transfer' \
--header 'x-api-key: 2442555352662653' \
--data '{
  "bankCode": "035",
  "accountNumber": "8548737465",
  "amount": 500,
  "currency": "NGN",
  "description": ""
}'`,
      response: `{
  "message": "Minimun amount for transfer is 50",
  "error": "Bad Request",
  "statusCode": 400
}`
    },
    {
      title: "Get All Transactions",
      description: "Get a list of all wallet transactions with pagination and filtering.",
      method: "GET",
      endpoint: "https://backend-api-production-e3f2.up.railway.app/api/v1/wallet/transaction?page=1&limit=2&type=CREDIT&category=DEPOSIT",
      headers: [
        { name: "authorization", type: "Bearer Token", example: "Bearer <token>" },
        { name: "x-api-key", type: "string", example: "2442555352662653" }
      ],
      body: "",
      curl: `curl --location 'https://backend-api-production-e3f2.up.railway.app/api/v1/wallet/transaction?page=1&limit=2&type=CREDIT&category=DEPOSIT' \
--header 'x-api-key: 2442555352662653'`,
      response: `{
  "transactions": [
    {
      "id": "1f074049-ec63-40f9-b929-530087e57f82",
      "walletId": "a6991eeb-2132-4b8d-9544-86a9a337c06a",
      "transactionRef": null,
      "type": "CREDIT",
      "category": "DEPOSIT",
      "currency": "NGN",
      "status": "success",
      "description": "Safe-",
      "previousBal": "0.00",
      "currentBal": "0.00",
      "amount": "500.00",
      "createdAt": "2025-03-14T11:23:45.000Z",
      "updatedAt": "2025-03-14T11:23:45.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 2,
    "totalPages": 1
  }
}`
    }
  ]
};

export default function ApiReferencePage() {
  const [activeCategory, setActiveCategory] = useState("Auth");
  const [activeEndpoint, setActiveEndpoint] = useState(apiData["Auth"][0]);

  return (
    <div className="w-full bg-white text-gray-900 overflow-x-hidden">
      <DeveloperHeader />

      <main className="w-full flex py-8 md:py-12 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24">
        {/* Sidebar */}
        <aside className="w-64 border-r border-gray-200 hidden md:block">
          <nav className="p-4 space-y-4">
            {Object.keys(apiData).map((category) => (
              <div key={category}>
                <h3 className="font-semibold text-gray-800 mb-2">{category}</h3>
                <ul className="space-y-1">
                  {(apiData[category as keyof typeof apiData]).map((endpoint, idx) => (
                    <li key={idx}>
                      <button
                        onClick={() => {
                          setActiveCategory(category);
                          setActiveEndpoint(endpoint);
                        }}
                        className={`w-full text-left text-sm px-2 py-1 rounded hover:bg-gray-100 ${
                          activeEndpoint.title === endpoint.title ? "bg-gray-200" : ""
                        }`}
                      >
                        {endpoint.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 px-0 sm:px-4 md:px-6 max-w-screen-xl mx-auto">
          <div className="space-y-8">
            {/* Mobile: Show ALL categories and endpoints in one scrollable page */}
            <div className="md:hidden space-y-10">
              {Object.entries(apiData).map(([category, endpoints]) => (
                <section key={category} className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">{category}</h2>
                  <div className="space-y-8">
                    {endpoints.map((ep) => (
                      <article key={ep.title} className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Badge method={ep.method as any} />
                            <span>{ep.title}</span>
                          </h3>
                          <p className="text-gray-600 text-sm mt-1">{ep.description}</p>
                        </div>

                        {/* Headers and cURL */}
                        <div className="grid grid-cols-1 gap-6">
                          <div>
                            <h4 className="text-base font-semibold text-gray-900 mb-3">Headers</h4>
                            <div className="space-y-3">
                              {ep.headers.map((header, idx) => (
                                <div key={idx} className="flex items-start gap-4">
                                  <div className="min-w-32">
                                    <p className="text-sm font-medium text-gray-900">{header.name}</p>
                                    <p className="text-xs text-gray-500">{header.type}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600">
                                      Set value to <code className="px-1 py-0.5 bg-gray-100 rounded text-sm">{header.example}</code>
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-base font-semibold text-gray-900 mb-3">cURL Request</h4>
                            <div className="rounded-xl border border-gray-200 bg-[#334155] text-white overflow-hidden">
                              <div className="flex items-center justify-between px-4 py-2 text-xs bg-[#475569]">
                                <div className="flex items-center gap-2">
                                  <Badge method={ep.method as any} />
                                  <span>{ep.endpoint.replace("https://backend-api-production-e3f2.up.railway.app", "")}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span>cURL</span>
                                  <CopyButton text={ep.curl} />
                                </div>
                              </div>
                              <pre className="px-4 py-4 text-xs overflow-x-auto whitespace-pre text-green-300">{ep.curl}</pre>
                            </div>
                          </div>
                        </div>

                        {/* Body and Response */}
                        <div className="grid grid-cols-1 gap-6">
                          <div>
                            <h4 className="text-base font-semibold text-gray-900 mb-3">Body Parameters</h4>
                            <pre className="px-4 py-3 bg-gray-100 rounded text-sm overflow-x-auto whitespace-pre">{ep.body}</pre>
                          </div>
                          <div className="rounded-xl border border-gray-200 bg-[#334155] text-white overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-2 text-xs bg-[#475569]">
                              <span>Sample Response</span>
                              <div className="flex items-center gap-2">
                                <span>200 OK</span>
                                <CopyButton text={ep.response} />
                              </div>
                            </div>
                            <pre className="px-4 py-4 text-xs overflow-x-auto whitespace-pre text-green-300">{ep.response}</pre>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {/* Desktop/Tablet: Single endpoint view with sidebar selection */}
            <div className="hidden md:block space-y-8">
              {/* Page Header */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{activeEndpoint.title}</h1>
                <p className="text-gray-600 text-lg">{activeEndpoint.description}</p>
              </div>

              {/* Headers and cURL Request */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Headers Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Headers</h3>
                  <div className="space-y-3">
                    {activeEndpoint.headers.map((header, idx) => (
                      <div key={idx} className="flex items-start gap-4">
                        <div className="min-w-32">
                          <p className="text-sm font-medium text-gray-900">{header.name}</p>
                          <p className="text-xs text-gray-500">{header.type}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Set value to <code className="px-1 py-0.5 bg-gray-100 rounded text-sm">{header.example}</code>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* cURL Request */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">cURL Request</h3>
                  <div className="rounded-xl border border-gray-200 bg-[#334155] text-white overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 text-xs bg-[#475569]">
                      <div className="flex items-center gap-2">
                        <Badge method={activeEndpoint.method as any} />
                        <span>{activeEndpoint.endpoint.replace("https://backend-api-production-e3f2.up.railway.app", "")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>cURL</span>
                        <CopyButton text={activeEndpoint.curl} />
                      </div>
                    </div>
                    <pre className="px-4 py-4 text-xs overflow-x-auto whitespace-pre text-green-300">{activeEndpoint.curl}</pre>
                  </div>
                </div>
              </div>

              {/* Body Parameters and Sample Response */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {/* Body Parameters Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Body Parameters</h3>
                  <div className="h-full">
                    <pre className="h-full px-4 py-3 bg-gray-100 rounded text-sm overflow-x-auto whitespace-pre">{activeEndpoint.body}</pre>
                  </div>
                </div>

                {/* Sample Response */}
                <div className="rounded-xl border border-gray-200 bg-[#334155] text-white overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 text-xs bg-[#475569]">
                    <span>Sample Response</span>
                    <div className="flex items-center gap-2">
                      <span>200 OK</span>
                      <CopyButton text={activeEndpoint.response} />
                    </div>
                  </div>
                  <pre className="px-4 py-4 text-xs overflow-x-auto whitespace-pre text-green-300">{activeEndpoint.response}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
