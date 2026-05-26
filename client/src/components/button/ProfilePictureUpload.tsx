import { useState, useCallback, useRef } from "react";
import Cropper from "react-easy-crop";
import Modal from "../Modal/index";

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ProfilePictureUploadProps {
  currentImageUrl?: string | null;
  initials: string;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => Promise<void>;
  isLoading?: boolean;
}

// ── Helper: crop the image using a canvas ────────────────────────────────────
const createCroppedImage = (
  imageSrc: string,
  pixelCrop: Area
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    // FIX: Set crossOrigin before src to prevent canvas taint on blob URLs
    image.crossOrigin = "anonymous";

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Could not get canvas context"));

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error("Canvas is empty"));
        const file = new File([blob], "profile_picture.jpg", {
          type: "image/jpeg",
        });
        resolve(file);
      }, "image/jpeg");
    };

    image.onerror = () => reject(new Error("Failed to load image"));

    // FIX: Assign src AFTER onload/onerror are bound so they always fire
    image.src = imageSrc;

    // FIX: If image is already cached and complete, onload won't fire —
    // manually trigger it
    if (image.complete && image.naturalWidth !== 0) {
      image.onload(new Event("load"));
    }
  });
};

const ProfilePictureUpload = ({
  currentImageUrl,
  initials,
  onUpload,
  onRemove,
  isLoading = false,
}: ProfilePictureUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Crop modal state ───────────────────────────────────────────────────────
  const [showCropModal, setShowCropModal] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string>("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [cropLoading, setCropLoading] = useState(false);

  // ── Confirm modal state ────────────────────────────────────────────────────
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [croppedPreviewUrl, setCroppedPreviewUrl] = useState<string>("");
  const [croppedFile, setCroppedFile] = useState<File | null>(null);

  // ── Remove confirm state ───────────────────────────────────────────────────
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [removePreviewUrl, setRemovePreviewUrl] = useState<string | null>(null);

  // ── File selected → open crop modal ───────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setRawImageSrc(objectUrl);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setShowCropModal(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  // ── Crop confirmed → show preview confirm modal ────────────────────────────
  const handleCropConfirm = async () => {
    if (!croppedAreaPixels || !rawImageSrc) return;
    setCropLoading(true);
    try {
      const file = await createCroppedImage(rawImageSrc, croppedAreaPixels);
      const previewUrl = URL.createObjectURL(file);
      setCroppedFile(file);
      setCroppedPreviewUrl(previewUrl);
      setShowCropModal(false);
      setShowConfirmModal(true);
    } catch (err) {
      console.error("Crop failed:", err);
    } finally {
      setCropLoading(false);
    }
  };

  // ── Crop cancelled ─────────────────────────────────────────────────────────
  const handleCropCancel = () => {
    setShowCropModal(false);
    URL.revokeObjectURL(rawImageSrc);
    setRawImageSrc("");
  };

  // ── Upload confirmed (Yes) ─────────────────────────────────────────────────
  const handleUploadConfirm = async () => {
    if (!croppedFile) return;
    setShowConfirmModal(false);
    await onUpload(croppedFile);
    URL.revokeObjectURL(croppedPreviewUrl);
    setCroppedPreviewUrl("");
    setCroppedFile(null);
  };

  // ── Upload cancelled (No) ──────────────────────────────────────────────────
  const handleUploadCancel = () => {
    setShowConfirmModal(false);
    URL.revokeObjectURL(croppedPreviewUrl);
    setCroppedPreviewUrl("");
    setCroppedFile(null);
    setShowCropModal(true);
  };

  // ── Open remove confirm ────────────────────────────────────────────────────
  const handleOpenRemoveConfirm = () => {
    setRemovePreviewUrl(currentImageUrl ?? null);
    setShowRemoveConfirm(true);
  };

  // ── Remove confirm closed without action ──────────────────────────────────
  const handleRemoveCancel = () => {
    setShowRemoveConfirm(false);
    setTimeout(() => setRemovePreviewUrl(null), 300);
  };

  // ── Remove confirmed ───────────────────────────────────────────────────────
  const handleRemoveConfirm = async () => {
    setShowRemoveConfirm(false);
    await onRemove();
    setTimeout(() => setRemovePreviewUrl(null), 300);
  };

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* ── Avatar ── */}
      <div className="relative inline-block mb-4">
        <div className="h-24 w-24 rounded-full overflow-hidden bg-gradient-to-br from-[#4A7BA7] via-[#3d6a8f] to-[#4A7BA7] shadow-lg flex items-center justify-center">
          {currentImageUrl ? (
            <img
              key={currentImageUrl}
              src={currentImageUrl}
              alt="Profile"
              className="h-full w-full object-cover"
              onError={(e) => {
                // FIX: If the proxied URL fails to load, hide broken image
                // and fall back to initials by clearing the src
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <span className="text-3xl font-bold text-white">{initials}</span>
          )}
        </div>

        {/* Hover overlay */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="absolute inset-0 rounded-full bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer disabled:cursor-not-allowed"
          title="Upload profile picture"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
          ) : (
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          )}
        </button>

        {/* Camera badge */}
        <span
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-[#4A7BA7] border-2 border-white flex items-center justify-center cursor-pointer shadow"
          title="Change photo"
        >
          <svg
            className="w-3.5 h-3.5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </span>
      </div>

      {/* Upload / Remove buttons */}
      <div className="flex justify-center gap-2 mb-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="px-3 py-1.5 text-xs font-bold bg-[#4A7BA7] text-white rounded-lg hover:bg-[#3d6a8f] disabled:opacity-50 transition-all shadow"
        >
          {currentImageUrl ? "Change Photo" : "Upload Photo"}
        </button>
        {currentImageUrl && (
          <button
            type="button"
            onClick={handleOpenRemoveConfirm}
            disabled={isLoading}
            className="px-3 py-1.5 text-xs font-bold bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-all shadow"
          >
            Remove
          </button>
        )}
      </div>
      <p className="text-xs text-gray-400 mb-4">JPG, PNG or WebP · max 2 MB</p>

      {/* ── Crop Modal ─────────────────────────────────────────────────────── */}
      <Modal
        isOpen={showCropModal}
        onClose={handleCropCancel}
        showCloseButton
        size="medium"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#4A7BA7]/10">
              <svg
                className="w-5 h-5 text-[#4A7BA7]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Crop Photo</h3>
              <p className="text-sm text-gray-500">
                Drag to reposition · Scroll to zoom
              </p>
            </div>
          </div>

          {/* Crop area */}
          <div
            className="relative w-full bg-gray-900 rounded-xl overflow-hidden mb-4"
            style={{ height: "340px" }}
          >
            <Cropper
              image={rawImageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          {/* Zoom slider */}
          <div className="flex items-center gap-3 mb-6 px-1">
            <svg
              className="w-4 h-4 text-gray-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
              />
            </svg>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#4A7BA7]"
            />
            <svg
              className="w-5 h-5 text-gray-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
              />
            </svg>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCropCancel}
              className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-bold text-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCropConfirm}
              disabled={cropLoading}
              className="flex-1 px-4 py-2.5 bg-[#4A7BA7] text-white rounded-xl hover:bg-[#3d6a8f] font-bold text-sm disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2"
            >
              {cropLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Processing...
                </>
              ) : (
                "Next"
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Confirm Upload Modal ───────────────────────────────────────────── */}
      <Modal
        isOpen={showConfirmModal}
        onClose={handleUploadCancel}
        showCloseButton
        size="small"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#4A7BA7]/10">
              <svg
                className="w-5 h-5 text-[#4A7BA7]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Use this photo?
              </h3>
              <p className="text-sm text-gray-500">
                This will replace your current profile picture.
              </p>
            </div>
          </div>

          {/* Preview */}
          <div className="flex justify-center mb-6">
            <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-[#4A7BA7]/20 shadow-lg">
              {croppedPreviewUrl && (
                <img
                  src={croppedPreviewUrl}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleUploadCancel}
              className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-bold text-sm transition-all"
            >
              No, Re-crop
            </button>
            <button
              type="button"
              onClick={handleUploadConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-[#4A7BA7] text-white rounded-xl hover:bg-[#3d6a8f] font-bold text-sm disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Saving...
                </>
              ) : (
                "Yes, Use Photo"
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Remove Confirm Modal ───────────────────────────────────────────── */}
      <Modal
        isOpen={showRemoveConfirm}
        onClose={handleRemoveCancel}
        showCloseButton
        size="small"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-100">
              <svg
                className="w-5 h-5 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Remove Photo?</h3>
              <p className="text-sm text-gray-500">
                This will delete your profile picture.
              </p>
            </div>
          </div>

          {removePreviewUrl && (
            <div className="flex justify-center mb-5">
              <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-red-100 shadow opacity-60">
                <img
                  src={removePreviewUrl}
                  alt="Current"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleRemoveCancel}
              className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-bold text-sm transition-all"
            >
              No, Keep It
            </button>
            <button
              type="button"
              onClick={handleRemoveConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold text-sm disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Removing...
                </>
              ) : (
                "Yes, Remove"
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ProfilePictureUpload;