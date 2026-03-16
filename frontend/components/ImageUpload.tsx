// frontend/components/ImageUpload.tsx
"use client";

import { useState, useRef } from "react";

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  currentImage?: string;
  name?: string;
}

export default function ImageUpload({
  onUploadComplete,
  currentImage,
  name = "User",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi ukuran file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    // Validasi tipe file
    if (!file.type.startsWith("image/")) {
      setError("File must be an image");
      return;
    }

    // Preview lokal
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload ke Cloudinary
    await uploadToCloudinary(file);
  };

  const uploadToCloudinary = async (file: File) => {
    setUploading(true);
    setError("");

    try {
      // Buat FormData untuk upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "smartresume"); // Ganti dengan upload preset Anda

      // Upload ke Cloudinary
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dlruguhkq/image/upload",
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Upload failed");
      }

      console.log("✅ Image uploaded to Cloudinary:", data.secure_url);
      onUploadComplete(data.secure_url);
      setError("");
    } catch (err: any) {
      console.error("Upload error:", err);
      setError("Upload failed. Please try again.");
      setPreview(currentImage || null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onUploadComplete("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6">
        {/* Preview Circle */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={() => {
                  console.error("Preview image failed to load");
                  setPreview(null);
                }}
              />
            ) : (
              <span className="text-3xl text-white">
                {name ? name.charAt(0).toUpperCase() : "👤"}
              </span>
            )}
          </div>
          {preview && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 flex items-center justify-center shadow-lg"
            >
              ×
            </button>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
            id="photo-upload"
          />

          <div className="flex gap-3">
            <label
              htmlFor="photo-upload"
              className={`px-4 py-2 rounded-lg font-medium cursor-pointer transition-all ${
                uploading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
              }`}
            >
              {uploading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Uploading...
                </span>
              ) : (
                "📸 Choose Photo"
              )}
            </label>
          </div>

          <p className="text-xs text-white/50 mt-2">
            Max 5MB. Photos stored securely in Cloudinary
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
          ❌ {error}
        </div>
      )}
    </div>
  );
}
