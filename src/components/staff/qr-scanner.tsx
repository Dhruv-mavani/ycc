"use client";

import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";

export function QrScanner({
  onScan,
  onClose,
  onError,
}: {
  onScan: (text: string) => void;
  onClose: () => void;
  onError?: (message: string) => void;
}) {
  const onScanRef = useRef(onScan);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const stoppedRef = useRef(false);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    const containerId = "qr-reader";
    const scanner = new Html5Qrcode(containerId);
    scannerRef.current = scanner;
    stoppedRef.current = false;

    const startPromise = scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          if (!stoppedRef.current) {
            stoppedRef.current = true;
            try {
              // Pause immediately so it doesn't keep scanning while stopping
              scanner.pause(true);
            } catch {}
            
            // Stop gracefully BEFORE triggering the parent's unmount
            scanner
              .stop()
              .then(() => scanner.clear())
              .catch(() => {})
              .finally(() => {
                onScanRef.current(decodedText);
              });
          }
        },
        () => {
          // per-frame "no QR found" callback — expected, not an error
        },
      )
      .catch(() => {
        if (!stoppedRef.current) {
          onError?.("Could not access the camera. Check permissions and try again.");
        }
      });

    return () => {
      stoppedRef.current = true;
      startPromise.finally(() => {
        try {
          if (scannerRef.current) {
            scannerRef.current
              .stop()
              .then(() => {
                scannerRef.current?.clear();
              })
              .catch(() => {});
          }
        } catch {
          try {
            scannerRef.current?.clear();
          } catch {}
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-2">
      <div
        id="qr-reader"
        className="mx-auto w-full max-w-sm overflow-hidden rounded-lg"
      />
      <Button variant="outline" className="w-full" onClick={onClose}>
        Close scanner
      </Button>
    </div>
  );
}
