"use client";

import React, { useState, useEffect, useRef } from 'react';
import { QRCode } from 'react-qrcode-logo';
import { Button } from '@/components/ui/button';

export function DownloadQR({ pilotId }: { pilotId: string }) {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchQrUrl = async () => {
      try {
        if (!pilotId) {
          throw new Error('Missing pilot id')
        }

        const response = await fetch(`/api/pilot/qr/${encodeURIComponent(pilotId)}`);
        if (!response.ok) {
          // Try to parse JSON error, otherwise fallback to text
          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const errJson = await response.json();
            throw new Error(errJson?.error || 'Failed to fetch QR code URL')
          }
          const errText = await response.text();
          throw new Error(errText || `Failed to fetch QR code URL (status ${response.status})`)
        }

        const contentType = response.headers.get('content-type') || '';
        let data: any;
        if (contentType.includes('application/json')) {
          data = await response.json();
        } else {
          // Defensive: if server returned HTML or plain text, capture for logging
          const text = await response.text();
          try {
            data = JSON.parse(text);
          } catch (e) {
            throw new Error('Unexpected response when fetching QR URL: ' + text.substring(0, 200))
          }
        }

        if (!data || !data.url) {
          throw new Error('Invalid QR URL response')
        }

        setQrUrl(data.url);
      } catch (error) {
        console.error('fetchQrUrl error', error);
        setError((error as Error)?.message || String(error));
      }
    };

    fetchQrUrl();
  }, [pilotId]);

  const downloadQRCode = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (canvas) {
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
      let downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `pilot-${pilotId}-qr.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  if (!qrUrl) {
    return <div>Loading QR Code...</div>;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div ref={qrRef}>
        <QRCode
          value={qrUrl}
          size={256}
          logoImage="/logo1.png"
          logoWidth={80}
          logoHeight={80}
          qrStyle="squares"
          eyeRadius={10}
        />
      </div>
      <Button onClick={downloadQRCode}>
        Download QR Code
      </Button>
    </div>
  );
}
