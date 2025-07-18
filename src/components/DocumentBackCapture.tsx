import React, { useEffect, useState } from 'react';
import { CreditCard } from 'lucide-react';
import { useCamera } from '../hooks/useCamera';
import { CapturedImage } from '../types/kyc';
import { kycApiService } from '../services/kycApi';
import { ErrorPage, CaptureError } from './ErrorPage';

interface DocumentBackCaptureProps {
  onCapture: (image: CapturedImage) => void;
  onNext: () => void;
  verificationId: string;
  onError?: (errorMessage: string) => void;
}

export const DocumentBackCapture: React.FC<DocumentBackCaptureProps> = ({
  onCapture,
  onNext,
  verificationId,
  onError
}) => {
  const {
    videoRef,
    isStreaming,
    isLoading,
    error,
    startCamera,
    stopCamera,
    captureImage
  } = useCamera();

  const [capturedImage, setCapturedImage] = useState<CapturedImage | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isClearImage, setIsClearImage] = useState(false);
  const [captureError, setCaptureError] = useState<CaptureError | null>(null);

  useEffect(() => {
    startCamera('environment');
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const handleCapture = async () => {
    setIsCapturing(true);
    const result = await captureImage();

    if (result) {
      const image: CapturedImage = {
        blob: result.blob,
        url: result.url,
        timestamp: new Date()
      };
      setCapturedImage(image);
      onCapture(image);
      await handleCheckQuality(image);
    }
    setIsCapturing(false);
  };

  const handleRetake = () => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage.url);
    }
    setCapturedImage(null);
    setUploadError(null);
    setIsClearImage(false);
    setCaptureError(null);
    startCamera('environment');
  };

  const handleCheckQuality = async (image: CapturedImage) => {
    if (!image) return;

    setIsUploading(true);
    setUploadError(null);
    setIsClearImage(false);
    setCaptureError(null);

    try {
      const response = await kycApiService.processDocument({
        image: image.blob,
        type: 'document-back',
        verificationId
      });

      if (response.message === 'CLEAR IMAGE') {
        setIsClearImage(true);

        const uuid = 'ML_' + (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15));

        const ocrResponse = await kycApiService.processOCRDocument(image.blob, uuid);
        stopCamera();
        onNext();
      } else {
        setUploadError(response.message || 'Document is not clear. Please retake.');
        setCaptureError({
          type: 'validation',
          message: response.message || 'Document is not clear. Please retake.',
          tips: ['Ensure the document is fully visible.', 'Avoid glare or shadows.'],
        });
        if (onError) onError(response.message || 'Document is not clear. Please retake.');
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Network error. Please try again.';
      setUploadError(errorMessage);
      setCaptureError({
        type: 'network',
        message: errorMessage,
        tips: ['Check your internet connection.', 'Try again later.'],
      });
      if (onError) onError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  if (captureError) {
    return (
      <div className="h-screen flex items-center justify-center bg-white p-3">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex justify-center">
              <img
                className="h-8"
                src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
                alt="IDMerit Logo"
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <ErrorPage
              error={captureError}
              onRetry={() => {
                setCaptureError(null);
                handleRetake();
              }}
              onBack={() => {
                setCaptureError(null);
                handleRetake();
              }}
            />
          </div>

          {/* Footer */}
          <div className="bg-white border-t border-gray-200 px-4 py-3">
            <div className="flex justify-center items-center gap-2">
              <span className="text-xs text-gray-500">Powered by</span>
              <img
                className="h-6"
                src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
                alt="IDMerit Logo"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center bg-white p-3">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex justify-center">
            <img
              className="h-8"
              src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
              alt="IDMerit Logo"
            />
          </div>
        </div>

        {/* Title Section */}
        <div className="bg-blue-600 px-4 py-4 text-center">
          <CreditCard className="w-8 h-8 mx-auto mb-2 text-white" />
          <h1 className="text-lg font-bold text-white mb-1">Document Back</h1>
          <p className="text-blue-100 text-xs">Align your ID back within the frame</p>
        </div>

        {/* Camera Section */}
        <div className="p-3">
          <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-[4/3] mb-3">
            {!capturedImage ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-60 h-36 border-3 border-white/60 rounded-xl flex items-center justify-center">
                    <div className="text-white/80 text-center">
                      <CreditCard className="w-8 h-8 mx-auto mb-1" />
                      <p className="text-xs font-medium">Align ID Back</p>
                    </div>
                  </div>
                </div>
                {isLoading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-3 border-white border-t-transparent"></div>
                  </div>
                )}
              </>
            ) : (
              <img
                src={capturedImage.url}
                alt="Document back"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg mb-3 text-xs">
              {error}
            </div>
          )}

          {uploadError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg mb-3 text-xs">
              {uploadError}
            </div>
          )}

          {isUploading && (
            <div className="bg-blue-50 border border-blue-200 text-blue-600 px-3 py-2 rounded-lg mb-3 text-xs text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent"></div>
                Processing document...
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            {!capturedImage && (
              <button
                onClick={handleCapture}
                disabled={!isStreaming || isCapturing || isUploading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
              >
                {isCapturing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Capturing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Capture Document
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-200 px-4 py-3">
          <div className="flex justify-center items-center gap-2">
            <span className="text-xs text-gray-500">Powered by</span>
            <img
              className="h-6"
              src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
              alt="IDMerit Logo"
            />
          </div>
        </div>
      </div>
    </div>
  );
};