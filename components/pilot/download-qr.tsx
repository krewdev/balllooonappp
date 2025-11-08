"use client";

import React, { useState, useEffect, useRef } from 'react';
import { QRCode } from 'react-qrcode-logo';
import { Button } from '@/components/ui/button';

export function DownloadQR({ pilotId }: { pilotId: string }) {
  const [qrUrl, setQrUrl] = useState<string>('');
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchQrUrl = async () => {
      try {
        const response = await fetch(`/api/pilot/qr/${encodeURIComponent(pilotId)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch QR code URL');
        }
        const data = await response.json();
        setQrUrl(data.url);
      } catch (error) {
        console.error(error);
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
