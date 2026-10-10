"use client";
import {useEffect,useRef} from "react";
import {useApp} from "@/components/app/provider";
export function LocalPreview({ blob, label }: { blob: Blob; label: string }) {
  const { t } = useApp();
  const image = useRef<HTMLImageElement | null>(null);
  const link = useRef<HTMLAnchorElement | null>(null);
  useEffect(() => {
    const url = URL.createObjectURL(blob);
    if (image.current) image.current.src = url;
    if (link.current) link.current.href = url;
    return () => URL.revokeObjectURL(url);
  }, [blob]);
  // Only validated local blobs; the effect owns their URL lifecycle.
  return (
    <a ref={link} target="_blank" rel="noreferrer" aria-label={label}>
      {/* eslint-disable-next-line @next/next/no-img-element -- validated local Blob; no remote optimizer */}
      <img ref={image} className="capture-image" alt={label} />
      <span>{t("Mở ảnh để phóng to", "Open image to zoom")}</span>
    </a>
  );
}
