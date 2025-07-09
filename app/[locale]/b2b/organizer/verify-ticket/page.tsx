'use client';

import { useState, useEffect, useRef } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { useClerk } from '@clerk/nextjs';
import { BrowserMultiFormatReader } from '@zxing/library';
import { useTranslations } from 'next-intl';

export default function VerifyTicketPage() {
  const { t } = useTranslations('scan');
  const { user } = useClerk();
  const verifyTicket = useMutation(api.functions.verifyTicket);
  const [result, setResult] = useState<{
    eventName: string;
    ticketType: string;
    userName: string;
    purchaseDate: string;
  } | null>(null);
  const [error, setError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    codeReaderRef.current = codeReader;
    let isMounted = true;

    const startScanner = async () => {
      try {
        if (videoRef.current) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
          });
          videoRef.current.srcObject = stream;

          codeReader.decodeFromVideoDevice(undefined, videoRef.current, async (scanResult, err) => {
            if (!isMounted) return;

            if (scanResult) {
              try {
                const qrCodeData = scanResult.getText();
                if (!user) {
                  setError(t('unauthenticated'));
                  return;
                }
                const verification = await verifyTicket({
                  qrCodeData,
                  organizerId: user.id,
                });

                if (verification.success) {
                  setResult({
                    eventName: verification.eventName,
                    ticketType: verification.ticketType,
                    userName: verification.userName,
                    purchaseDate: verification.purchaseDate,
                  });
                  setError('');
                } else {
                  setError(t('ticket_invalid', { error: verification.error }));
                }
              } catch (err) {
                setError(t('scan_error'));
                setResult(null);
              }
            }
            if (err && err.name !== 'NotFoundException') {
              setError(t('camera_access_denied'));
              setResult(null);
            }
          });
        }
      } catch (err) {
        setError(t('camera_access_denied'));
        setResult(null);
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [t, verifyTicket, user]);

  return (
    <div className="min-h-screen bg-gray-100 py-8 flex flex-col items-center" aria-labelledby="verify-ticket-heading">
      <div className="w-full max-w-md px-4">
        <h1 id="verify-ticket-heading" className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          {t('scan_title')}
        </h1>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <video
            ref={videoRef}
            className="w-full h-48 sm:h-64 mb-4 rounded-lg"
            autoPlay
            muted
            style={{ objectFit: 'cover' }}
            aria-label={t('qr_scanner_label')}
          />
          {error && (
            <p className="text-red-600 mb-4 text-sm" role="alert">
              {error}
            </p>
          )}
          {result && (
            <div className="mt-4 text-sm sm:text-base" role="region" aria-live="polite">
              <p className="text-gray-700">{t('event')}: {result.eventName}</p>
              <p className="text-gray-700">{t('ticket_type')}: {result.ticketType}</p>
              <p className="text-gray-700">{t('purchaser')}: {result.userName}</p>
              <p className="text-gray-700">{t('purchased')}: {new Date(result.purchaseDate).toLocaleDateString()}</p>
              <p className="text-green-600 font-semibold">{t('ticket_valid')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}