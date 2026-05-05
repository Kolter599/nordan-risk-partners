"use client";

import { useEffect, useState } from "react";

type Props = {
  file: File | null;
  onClose: () => void;
};

export function FilePreviewDialog({ file, onClose }: Props) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }
    const objUrl = URL.createObjectURL(file);
    setUrl(objUrl);
    return () => URL.revokeObjectURL(objUrl);
  }, [file]);

  useEffect(() => {
    if (!file) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [file, onClose]);

  if (!file || !url) return null;

  const isImage = file.type.startsWith("image/");
  const isPdf = file.type === "application/pdf";

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center px-3 py-6 sm:p-6 bg-black/65 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[920px] max-h-[92vh] bg-white rounded-[12px] shadow-[0_30px_80px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-7 py-4 border-b border-[color:var(--color-nordan-line)] flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[0.7rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--color-nordan-muted)]">
              Preview
            </div>
            <div className="font-semibold text-[1.02rem] text-[color:var(--color-nordan-ink)] truncate">
              {file.name}
            </div>
            <div className="text-[0.78rem] text-[color:var(--color-nordan-muted)] mt-0.5">
              {Math.round(file.size / 1024)} KB · {file.type || "ukendt type"}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={url}
              download={file.name}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[6px] border border-[color:var(--color-nordan-line)] text-[0.82rem] font-semibold text-[color:var(--color-nordan-ink-soft)] hover:border-[color:var(--color-nordan-ink-soft)]"
            >
              Hent
            </a>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full grid place-items-center hover:bg-[color:var(--color-nordan-soft)] text-[color:var(--color-nordan-muted)] text-xl"
              aria-label="Luk"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto bg-[color:var(--color-nordan-soft)]/40">
          {isImage ? (
            <div className="flex items-center justify-center p-4 min-h-[60vh]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={file.name}
                className="max-w-full max-h-[78vh] object-contain rounded shadow-sm"
              />
            </div>
          ) : isPdf ? (
            <iframe
              src={url}
              title={file.name}
              className="w-full h-[80vh] border-0 bg-white"
            />
          ) : (
            <div className="p-10 text-center text-[color:var(--color-nordan-ink-soft)]">
              <div className="text-[0.95rem] mb-2">
                Vi kan ikke vise denne filtype direkte i browseren.
              </div>
              <div className="text-[0.85rem] text-[color:var(--color-nordan-muted)]">
                Klik <strong>Hent</strong> ovenfor for at downloade og åbne den lokalt.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
