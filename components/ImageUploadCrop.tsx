'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import ReactCrop, { centerCrop, makeAspectCrop, type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload } from 'lucide-react';
import {
  ASPECT_RATIO_OPTIONS,
  ASPECT_RATIO_VALUES,
  aspectRatioClass,
  cropImageToDataUrl,
  detectClosestAspectRatio,
  formatImageSizeGuide,
  fullImageToDataUrl,
  readFileAsDataUrl,
} from '@/lib/imageCrop';
import {
  ACCEPTED_IMAGE_TYPES,
  getImageUploadValidationError,
  LARGE_IMAGE_WARN_BYTES,
} from '@/lib/imageUpload';
import { resolveImageUrlForStorage } from '@/lib/data/imageStorage';
import { ImageAspectRatio } from '@/types/content';
import { useApp } from '@/components/AppContext';

interface ImageUploadCropProps {
  open: boolean;
  onClose: () => void;
  onComplete: (result: { url: string; aspectRatio: ImageAspectRatio }) => void;
  defaultAspectRatio?: ImageAspectRatio;
  pickFileOnOpen?: boolean;
  /** แสดงกรอบ preview + คำแนะนำขนาด (ใช้กับสไลด์หน้าแรก) */
  showPreviewFrame?: boolean;
  previewFrameLabel?: string;
  cropHint?: string;
  /** ล็อกอัตราส่วน — ไม่ให้เปลี่ยน (สไลด์หน้าแรก) */
  lockAspectRatio?: boolean;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number): Crop {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight,
  );
}

export default function ImageUploadCrop({
  open,
  onClose,
  onComplete,
  defaultAspectRatio = '4:3',
  pickFileOnOpen = false,
  showPreviewFrame = false,
  previewFrameLabel,
  cropHint,
  lockAspectRatio = false,
}: ImageUploadCropProps) {
  const { t } = useApp();
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [src, setSrc] = useState('');
  const [aspectRatio, setAspectRatio] = useState<ImageAspectRatio>(defaultAspectRatio);
  const [useOriginalSize, setUseOriginalSize] = useState(false);
  const [detectedAspectRatio, setDetectedAspectRatio] = useState<ImageAspectRatio>(defaultAspectRatio);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open && pickFileOnOpen) {
      const timer = window.setTimeout(() => fileInputRef.current?.click(), 150);
      return () => window.clearTimeout(timer);
    }
  }, [open, pickFileOnOpen]);

  const handleClose = () => {
    setSrc('');
    setCrop(undefined);
    setCompletedCrop(undefined);
    setAspectRatio(defaultAspectRatio);
    setUseOriginalSize(false);
    setDetectedAspectRatio(defaultAspectRatio);
    onClose();
  };

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      const { naturalWidth, naturalHeight, width, height } = img;
      setDetectedAspectRatio(detectClosestAspectRatio(naturalWidth, naturalHeight));
      setCrop(centerAspectCrop(width, height, ASPECT_RATIO_VALUES[aspectRatio]));
    },
    [aspectRatio],
  );

  const handleFile = async (file: File) => {
    const validationError = getImageUploadValidationError(file);
    if (validationError === 'too_large') {
      alert(t('edit.image.fileTooLarge'));
      return;
    }
    if (validationError === 'svg') {
      alert(t('edit.image.svgNotSupported'));
      return;
    }
    if (validationError === 'invalid') {
      alert(t('edit.image.invalidType'));
      return;
    }
    if (file.size > LARGE_IMAGE_WARN_BYTES) {
      alert(t('edit.image.largeWarning'));
    }
    const dataUrl = await readFileAsDataUrl(file);
    setSrc(dataUrl);
  };

  const handleImageLoadError = () => {
    alert(t('edit.image.loadFailed'));
    setSrc('');
    setCrop(undefined);
    setCompletedCrop(undefined);
  };

  const handleAspectChange = (ratio: ImageAspectRatio) => {
    setUseOriginalSize(false);
    setAspectRatio(ratio);
    const img = imgRef.current;
    if (img) {
      setCrop(centerAspectCrop(img.width, img.height, ASPECT_RATIO_VALUES[ratio]));
    }
  };

  const handleApply = async () => {
    setBusy(true);
    try {
      if (useOriginalSize) {
        const img = imgRef.current;
        if (!img?.naturalWidth) return;
        const aspectRatio = detectClosestAspectRatio(img.naturalWidth, img.naturalHeight);
        const dataUrl = await fullImageToDataUrl(img);
        const url = await resolveImageUrlForStorage(dataUrl);
        onComplete({ url, aspectRatio });
      } else {
        const img = imgRef.current;
        if (!img || !completedCrop?.width || !completedCrop?.height) return;
        const dataUrl = await cropImageToDataUrl(img, completedCrop);
        const url = await resolveImageUrlForStorage(dataUrl);
        onComplete({ url, aspectRatio });
      }
      handleClose();
    } catch {
      alert(t('edit.image.uploadFailed'));
    } finally {
      setBusy(false);
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            className="relative z-10 bg-white w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl image-crop-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-sm uppercase tracking-widest">{t('edit.image.cropTitle')}</h3>
              <button type="button" onClick={handleClose} className="text-gray-400 hover:text-black">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {showPreviewFrame && (
                <p className="text-xs text-gray-500 leading-relaxed">
                  {formatImageSizeGuide(aspectRatio)}
                </p>
              )}

              {!src ? (
                showPreviewFrame ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full max-w-sm mx-auto block group transition-colors"
                  >
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 text-center mb-2">
                      {previewFrameLabel}
                    </p>
                    <div className="border-2 border-dashed border-gray-300 group-hover:border-black p-3 transition-colors">
                      <div
                        className={`relative w-full ${aspectRatioClass(aspectRatio)} border-2 border-black/70 bg-gray-50 overflow-hidden`}
                      >
                        <div className="absolute inset-2 border border-dashed border-black/25 pointer-events-none" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400 group-hover:text-black transition-colors">
                          <Upload size={24} />
                          <span className="text-xs font-medium">{t('edit.image.upload')}</span>
                        </div>
                      </div>
                    </div>
                    <span className="block text-[10px] text-gray-400 text-center mt-2">
                      {t('edit.image.uploadHint')}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-300 hover:border-black py-16 flex flex-col items-center gap-3 transition-colors"
                  >
                    <Upload size={28} className="text-gray-400" />
                    <span className="text-sm font-medium">{t('edit.image.upload')}</span>
                    <span className="text-xs text-gray-400">{t('edit.image.uploadHint')}</span>
                  </button>
                )
              ) : (
                <>
                  {!lockAspectRatio && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setUseOriginalSize(true)}
                        className={`px-3 py-1.5 text-xs font-semibold border transition-colors ${
                          useOriginalSize
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-black'
                        }`}
                      >
                        ใช้ขนาดปกติของภาพ
                      </button>
                      {ASPECT_RATIO_OPTIONS.map((ratio) => (
                        <button
                          key={ratio}
                          type="button"
                          onClick={() => handleAspectChange(ratio)}
                          className={`px-3 py-1.5 text-xs font-semibold border transition-colors ${
                            !useOriginalSize && aspectRatio === ratio
                              ? 'bg-black text-white border-black'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-black'
                          }`}
                        >
                          {ratio}
                        </button>
                      ))}
                    </div>
                  )}

                  {lockAspectRatio && (
                    <p className="text-xs font-semibold text-gray-700">
                      {aspectRatio}
                    </p>
                  )}

                  {showPreviewFrame && (
                    <p className="text-xs text-gray-500">
                      {useOriginalSize
                        ? `ใช้สัดส่วนจริงของรูป (${detectedAspectRatio}) · ไม่ครอบตัด · บันทึกเป็น WebP`
                        : formatImageSizeGuide(aspectRatio)}
                    </p>
                  )}

                  <div className="relative">
                    {useOriginalSize ? (
                      <div className="max-h-[50vh] overflow-auto border border-gray-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          ref={imgRef}
                          src={src}
                          alt=""
                          onLoad={onImageLoad}
                          onError={handleImageLoadError}
                          className="max-h-[50vh] w-auto mx-auto"
                        />
                      </div>
                    ) : (
                      <ReactCrop
                        crop={crop}
                        onChange={(c) => setCrop(c)}
                        onComplete={(c) => setCompletedCrop(c)}
                        aspect={ASPECT_RATIO_VALUES[aspectRatio]}
                        className="max-h-[50vh]"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          ref={imgRef}
                          src={src}
                          alt=""
                          onLoad={onImageLoad}
                          onError={handleImageLoadError}
                          className="max-h-[50vh] w-auto"
                        />
                      </ReactCrop>
                    )}
                    {showPreviewFrame && (
                      <p className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 pointer-events-none text-[10px] uppercase tracking-widest font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] px-2 py-0.5 bg-black/40 rounded">
                        {previewFrameLabel}
                      </p>
                    )}
                  </div>

                  {cropHint && (
                    <p className="text-xs text-gray-500 leading-relaxed">{cropHint}</p>
                  )}
                </>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2.5 text-xs font-semibold uppercase tracking-widest border border-gray-200"
              >
                {t('common.cancel')}
              </button>
              {src && (
                <button
                  type="button"
                  disabled={busy || (!useOriginalSize && !completedCrop?.width)}
                  onClick={handleApply}
                  className="px-5 py-2.5 text-xs font-semibold uppercase tracking-widest bg-black text-white disabled:opacity-40"
                >
                  {t('edit.image.applyCrop')}
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFile(file);
                e.target.value = '';
              }}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
