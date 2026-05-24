import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useTranslation } from 'next-i18next';

interface Props {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: Props) {
  const { t } = useTranslation('common');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Initialize the scanner
    scannerRef.current = new Html5QrcodeScanner(
      'qr-reader',
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      /* verbose= */ false
    );

    const onScanSuccess = (decodedText: string) => {
      // Handle the scanned code
      onScan(decodedText);
      // Automatically stop after a successful scan if desired, 
      // or keep scanning for more.
    };

    const onScanFailure = (error: any) => {
      // handle scan failure, usually better to ignore and keep scanning
    };

    scannerRef.current.render(onScanSuccess, onScanFailure);

    return () => {
      // Cleanup the scanner on unmount
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner", error);
        });
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-black/90 p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="text-lg font-bold text-heading">
            {t('text-scan-order', 'Scan Order')}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100 transition-colors"
          >
            <svg
              className="h-6 w-6 text-body"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        
        <div className="p-4">
          <div id="qr-reader" className="overflow-hidden rounded-lg border-2 border-dashed border-gray-200"></div>
          <p className="mt-4 text-center text-sm text-body italic">
            {t('text-scan-instruction', 'Point your camera at the order barcode or QR code')}
          </p>
        </div>
      </div>
    </div>
  );
}
