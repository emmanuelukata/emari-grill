'use client';

import React, { useState, useRef } from 'react';
import { compressImage } from '@/lib/utils/image';
import { useAnnouncer } from './Announcer';
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  Camera,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';

interface PaymentProofUploaderProps {
  orderCode: string;
  onUploadSuccess: (newStatus: string) => void;
  alreadyUploaded?: boolean;
}

export function PaymentProofUploader({
  orderCode,
  onUploadSuccess,
  alreadyUploaded = false,
}: PaymentProofUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(alreadyUploaded);
  const { announce } = useAnnouncer();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setIsCompressing(true);
    announce('Optimizing payment screenshot for upload...');

    try {
      // Compress image client side
      const { file: compressed, previewUrl: preview } = await compressImage(file, {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.8,
      });

      setSelectedFile(compressed);
      setPreviewUrl(preview);
      announce('Screenshot ready for upload.');
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg('Failed to process image. Please try selecting a different photo.');
      announce('Failed to process image.', 'assertive');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setErrorMsg(null);
    announce('Uploading payment screenshot, please wait...');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch(`/api/orders/${orderCode}/upload-proof`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload payment proof.');
      }

      setUploadSuccess(true);
      announce('Payment screenshot uploaded successfully! Order status updated to Awaiting Confirmation.', 'polite');
      onUploadSuccess('Awaiting Confirmation');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setErrorMsg(msg);
      announce(`Upload failed: ${msg}. You can retry or chat on WhatsApp.`, 'assertive');
    } finally {
      setIsUploading(false);
    }
  };

  if (uploadSuccess) {
    return (
      <div
        role="status"
        aria-label="Payment Screenshot Uploaded"
        className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3"
      >
        <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-bold text-emerald-950">
          Payment Screenshot Received!
        </h3>
        <p className="text-sm text-emerald-900 max-w-md mx-auto">
          Thank you! Our kitchen team has received your proof and is confirming the transfer. Your order status is now{' '}
          <strong className="underline">Awaiting Confirmation</strong>.
        </p>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="Upload payment screenshot"
      className="bg-brand-offwhite-card border border-brand-offwhite-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-4"
    >
      <div className="flex items-center justify-between border-b border-brand-offwhite-subtle pb-3">
        <h3 className="text-base sm:text-lg font-bold text-brand-charcoal-900 flex items-center gap-2">
          <Camera className="w-5 h-5 text-brand-fire-700" aria-hidden="true" />
          <span>Upload Payment Screenshot</span>
        </h3>
        <span className="text-xs font-semibold px-2 py-0.5 bg-brand-fire-50 text-brand-fire-800 rounded">
          Required to confirm
        </span>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
          <p>{errorMsg}</p>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="sr-only"
        id="payment-proof-input"
        aria-label="Select payment screenshot image"
      />

      {/* Preview Area */}
      {previewUrl ? (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden border border-brand-offwhite-border bg-black max-h-72 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Payment screenshot preview"
              className="max-h-72 object-contain"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex-1 py-3 px-4 border border-brand-offwhite-border bg-brand-offwhite hover:bg-brand-offwhite-subtle rounded-xl text-sm font-semibold text-brand-charcoal-900 min-touch-target transition-colors"
            >
              Change Photo
            </button>

            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading || isCompressing}
              className="flex-2 py-3 px-6 bg-brand-fire-700 hover:bg-brand-fire-800 disabled:opacity-50 text-white font-extrabold text-sm sm:text-base rounded-xl shadow-md min-touch-target transition-all flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" aria-hidden="true" />
                  <span>Submit Payment Proof</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Empty State / Select Photo Button */
        <div className="border-2 border-dashed border-brand-offwhite-border rounded-xl p-6 text-center space-y-3 hover:border-brand-fire-500 transition-colors">
          <div className="w-12 h-12 mx-auto rounded-full bg-brand-fire-50 text-brand-fire-700 flex items-center justify-center">
            <ImageIcon className="w-6 h-6" aria-hidden="true" />
          </div>

          <div>
            <p className="text-sm font-bold text-brand-charcoal-900">
              Have you made the bank transfer?
            </p>
            <p className="text-xs text-brand-charcoal-700 mt-1">
              Take a screenshot from your banking app or snap a photo of the receipt.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isCompressing}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-6 bg-brand-charcoal-900 hover:bg-brand-charcoal-800 text-white font-bold rounded-xl text-sm min-touch-target transition-all shadow-sm"
          >
            {isCompressing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Processing photo...</span>
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" aria-hidden="true" />
                <span>Upload Payment Screenshot</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

