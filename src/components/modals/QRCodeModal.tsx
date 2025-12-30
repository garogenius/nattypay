"use client";

import React, { useState, useRef, useEffect } from "react";
import { CgClose } from "react-icons/cg";
import { FiCamera, FiDownload, FiUpload } from "react-icons/fi";
import { IoQrCodeOutline } from "react-icons/io5";
import CustomButton from "@/components/shared/Button";
import { useGenerateQRCode, useDecodeQRCode } from "@/api/wallet/wallet.queries";
import { useGetAllBanks } from "@/api/wallet/wallet.queries";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import SpinnerLoader from "@/components/Loader/SpinnerLoader";
import { QRCodeSVG } from "qrcode.react";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQRDecoded?: (data: any) => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, onQRDecoded }) => {
  const [mode, setMode] = useState<"scan" | "generate">("scan");
  const [amount, setAmount] = useState<string>("");
  const [qrCodeData, setQrCodeData] = useState<string>("");
  const [decodedData, setDecodedData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string>("");
  const [cameraLoading, setCameraLoading] = useState(false);

  const { qrCode, isPending: generatingQR, isError: qrError } = useGenerateQRCode({
    amount: Number(amount) || 0,
    enabled: mode === "generate" && Number(amount) > 0,
  });

  const onDecodeSuccess = (data: any) => {
    const decoded = data?.data?.data;
    setDecodedData(decoded);
    SuccessToast({
      title: "QR Code Decoded",
      description: "Payment details extracted successfully",
    });
    if (onQRDecoded) {
      onQRDecoded(decoded);
    }
  };

  const onDecodeError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    ErrorToast({
      title: "Decode Failed",
      descriptions: Array.isArray(errorMessage) ? errorMessage : [errorMessage || "Failed to decode QR code"],
    });
    setDecodedData(null);
  };

  const { mutate: decodeQR, isPending: decoding } = useDecodeQRCode(onDecodeError, onDecodeSuccess);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === "string") {
          setQrCodeData(result);
          decodeQR({ qrCode: result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Stop camera when modal closes or component unmounts
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setCameraError("");
  };

  const startCamera = async () => {
    try {
      setCameraError("");
      setCameraLoading(true);
      
      // Stop any existing stream first
      if (streamRef.current) {
        stopCamera();
        // Wait a bit for cleanup
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      
      // Wait for React to render the video element (since we set cameraLoading to true)
      // Use requestAnimationFrame to ensure DOM is updated
      await new Promise(resolve => requestAnimationFrame(resolve));
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Retry logic to find video element
      let attempts = 0;
      const maxAttempts = 10;
      
      while (!videoRef.current && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 50));
        attempts++;
      }
      
      if (videoRef.current) {
        const video = videoRef.current;
        
        // Set the stream
        video.srcObject = stream;
        video.style.display = 'block';
        video.style.visibility = 'visible';
        
        // Set up event listeners
        const playVideo = async () => {
          try {
            await video.play();
            setCameraActive(true);
            setCameraError("");
            setCameraLoading(false);
          } catch (playError: any) {
            console.error("Error playing video:", playError);
            setCameraError("Failed to start video playback");
            setCameraActive(false);
            setCameraLoading(false);
            stopCamera();
          }
        };

        // Wait for metadata and play
        if (video.readyState >= 2) {
          // Video is already loaded
          await playVideo();
        } else {
          // Wait for metadata
          const metadataPromise = new Promise<void>((resolve) => {
            const onLoadedMetadata = () => {
              video.removeEventListener('loadedmetadata', onLoadedMetadata);
              resolve();
            };
            video.addEventListener('loadedmetadata', onLoadedMetadata);
            
            // Fallback timeout
            setTimeout(() => {
              video.removeEventListener('loadedmetadata', onLoadedMetadata);
              resolve();
            }, 2000);
          });
          
          await metadataPromise;
          await playVideo();
        }
      } else {
        throw new Error("Video element not found in DOM after multiple attempts");
      }
    } catch (error: any) {
      console.error("Camera error:", error);
      setCameraError(error.message || "Failed to access camera");
      setCameraActive(false);
      setCameraLoading(false);
      stopCamera();
      
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        ErrorToast({
          title: "Camera Access Denied",
          descriptions: ["Please allow camera access in your browser settings to scan QR codes"],
        });
      } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        ErrorToast({
          title: "No Camera Found",
          descriptions: ["No camera device found. Please connect a camera and try again."],
        });
      } else {
        ErrorToast({
          title: "Camera Error",
          descriptions: [error.message || "Unable to access camera. Please check your device settings."],
        });
      }
    }
  };

  const captureFrame = () => {
    if (!videoRef.current || !cameraActive) return;
    
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/png');
      decodeQR({ qrCode: imageData });
    }
  };

  const handleClose = () => {
    stopCamera();
    setMode("scan");
    setAmount("");
    setQrCodeData("");
    setDecodedData(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  const handleDownloadQR = () => {
    if (!qrCode) return;
    
    // If qrCode is already a base64 image, download it directly
    if (qrCode.startsWith("data:image")) {
      const link = document.createElement("a");
      link.download = `qr-code-${amount || "payment"}.png`;
      link.href = qrCode;
      link.click();
      SuccessToast({
        title: "Downloaded",
        description: "QR code downloaded successfully",
      });
      return;
    }
    
    // Otherwise, create SVG element and convert to image
    const svgElement = document.querySelector("#qr-code-svg svg") as SVGElement;
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const url = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = `qr-code-${amount || "payment"}.png`;
        link.href = url;
        link.click();
        SuccessToast({
          title: "Downloaded",
          description: "QR code downloaded successfully",
        });
      };
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    } else {
      // Fallback: just copy the QR code data
      navigator.clipboard.writeText(qrCode);
      SuccessToast({
        title: "Copied",
        description: "QR code data copied to clipboard",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="z-[999999] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 flex justify-center items-center w-full md:inset-0 h-[100dvh]">
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div className="absolute inset-0 bg-black/80 dark:bg-black/60" onClick={handleClose} />
      </div>
      <div className="relative mx-4 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 w-full max-w-md rounded-2xl overflow-visible">
        <div className="flex items-center justify-between p-4 pb-2">
          <div>
            <h2 className="text-white text-lg font-semibold">QR Code</h2>
            <p className="text-white/60 text-sm">
              {mode === "scan" ? "Scan or upload QR code" : "Generate payment QR code"}
            </p>
          </div>
          <button onClick={handleClose} className="p-1 hover:bg-white/10 rounded transition-colors">
            <CgClose className="text-xl text-white/70" />
          </button>
        </div>

        <div className="px-4 pb-4">
          {/* Mode Toggle */}
          <div className="grid grid-cols-2 gap-3 mb-4 bg-white/5 p-1.5 rounded-xl">
            <button
              onClick={() => setMode("scan")}
              className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
                mode === "scan"
                  ? "bg-[#D4B139] text-black"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FiCamera />
                <span>Scan QR</span>
              </div>
            </button>
            <button
              onClick={() => setMode("generate")}
              className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
                mode === "generate"
                  ? "bg-[#D4B139] text-black"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <IoQrCodeOutline />
                <span>Generate QR</span>
              </div>
            </button>
          </div>

          {/* Scan Mode */}
          {mode === "scan" && (
            <div className="flex flex-col gap-4">
              {/* Camera Preview - Always render video element in DOM */}
              <div className={`relative w-full aspect-square bg-black rounded-lg overflow-hidden ${
                (cameraActive || cameraLoading) ? 'block' : 'hidden'
              }`}>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                  autoPlay
                  style={{ 
                    display: (cameraActive || cameraLoading) ? 'block' : 'none',
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    visibility: (cameraActive || cameraLoading) ? 'visible' : 'hidden'
                  }}
                />
                {cameraLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                    <div className="flex flex-col items-center gap-3">
                      <SpinnerLoader width={40} height={40} color="#D4B139" />
                      <p className="text-white text-sm">Starting camera...</p>
                    </div>
                  </div>
                )}
                {cameraActive && !cameraLoading && (
                  <>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                      <div className="w-64 h-64 border-2 border-[#D4B139] rounded-lg" />
                    </div>
                    <button
                      onClick={captureFrame}
                      disabled={decoding}
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-[#D4B139] border-4 border-white flex items-center justify-center disabled:opacity-50 z-20 hover:scale-105 transition-transform"
                    >
                      {decoding ? (
                        <SpinnerLoader width={24} height={24} color="#000" />
                      ) : (
                        <FiCamera className="text-2xl text-black" />
                      )}
                    </button>
                    <button
                      onClick={stopCamera}
                      className="absolute top-4 right-4 w-10 h-10 rounded-full bg-red-500 flex items-center justify-center z-20 hover:bg-red-600 transition-colors"
                    >
                      <CgClose className="text-white text-lg" />
                    </button>
                  </>
                )}
              </div>

              {!cameraActive && !cameraLoading && (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-white/70 text-sm font-medium">Scan with Camera</label>
                    <button
                      onClick={startCamera}
                      disabled={cameraLoading}
                      className="w-full bg-[#D4B139] hover:bg-[#c7a42f] border border-[#D4B139] rounded-lg py-4 px-4 text-black text-sm font-medium outline-none cursor-pointer flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cameraLoading ? (
                        <>
                          <SpinnerLoader width={20} height={20} color="#000" />
                          <span>Starting Camera...</span>
                        </>
                      ) : (
                        <>
                          <FiCamera className="text-xl" />
                          <span>Open Camera</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-white/40 text-xs">OR</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-white/70 text-sm font-medium">Upload QR Code Image</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-4 px-4 text-white text-sm outline-none cursor-pointer flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
                    >
                      <FiUpload className="text-xl" />
                      <span>{selectedFile ? selectedFile.name : "Choose QR Code Image"}</span>
                    </button>
                  </div>
                </>
              )}

              {cameraError && (
                <div className="text-red-400 text-sm text-center py-2">{cameraError}</div>
              )}

              {decoding && (
                <div className="flex items-center justify-center gap-2 py-4">
                  <SpinnerLoader width={20} height={20} color="#D4B139" />
                  <span className="text-white/70 text-sm">Decoding QR code...</span>
                </div>
              )}

              {decodedData && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 space-y-3">
                  <h3 className="text-green-400 text-sm font-semibold mb-2">Payment Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/70">Account Number</span>
                      <span className="text-white font-medium">{decodedData.accountNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Account Name</span>
                      <span className="text-white font-medium">{decodedData.accountName}</span>
                    </div>
                    {decodedData.amount && (
                      <div className="flex justify-between">
                        <span className="text-white/70">Amount</span>
                        <span className="text-white font-medium">₦{Number(decodedData.amount).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-white/70">Currency</span>
                      <span className="text-white font-medium">{decodedData.currency}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Generate Mode */}
          {mode === "generate" && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-white/70 text-sm font-medium">Amount</label>
                <input
                  type="number"
                  className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white placeholder:text-white/60 text-sm outline-none"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                />
              </div>

              {generatingQR ? (
                <div className="flex items-center justify-center py-12">
                  <SpinnerLoader width={32} height={32} color="#D4B139" />
                </div>
              ) : qrError ? (
                <div className="text-center py-8 text-red-400 text-sm">Failed to generate QR code</div>
              ) : qrCode ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-white p-4 rounded-xl flex items-center justify-center">
                    {/* Check if qrCode is a base64 image string or QR code data */}
                    {qrCode.startsWith("data:image") ? (
                      // API returned a base64 image - display it directly
                      <img
                        src={qrCode}
                        alt="QR Code"
                        className="w-[200px] h-[200px] object-contain"
                      />
                    ) : qrCode.length > 2953 ? (
                      // QR code data is too long
                      <div className="text-center p-8 max-w-xs">
                        <p className="text-red-400 text-sm mb-2">
                          QR code data is too long to generate.
                        </p>
                        <p className="text-gray-600 text-xs mb-4">
                          The payment data exceeds QR code capacity. Please try with a smaller amount or contact support.
                        </p>
                        <div className="bg-gray-100 p-3 rounded text-left">
                          <p className="text-xs text-gray-600 font-mono break-all">
                            {qrCode.substring(0, 100)}...
                          </p>
                        </div>
                      </div>
                    ) : (
                      // Generate QR code from data
                      <div id="qr-code-svg">
                        <QRCodeSVG
                          value={qrCode}
                          size={200}
                          level="H"
                          includeMargin={true}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 w-full">
                    <CustomButton
                      onClick={handleDownloadQR}
                      className="flex-1 bg-transparent border border-white/15 text-white rounded-lg py-2.5 flex items-center justify-center gap-2"
                    >
                      <FiDownload />
                      <span>Download</span>
                    </CustomButton>
                    <CustomButton
                      onClick={() => {
                        navigator.clipboard.writeText(qrCode);
                        SuccessToast({
                          title: "Copied",
                          description: "QR code data copied to clipboard",
                        });
                      }}
                      className="flex-1 bg-[#D4B139] hover:bg-[#c7a42f] text-black rounded-lg py-2.5"
                    >
                      Copy Data
                    </CustomButton>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-white/60 text-sm">
                  Enter an amount to generate QR code
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;

