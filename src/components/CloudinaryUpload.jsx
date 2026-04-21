import React, { useState } from "react";
import { uploadToCloudinary } from "../services/cloudinaryService";

/**
 * CloudinaryUpload Component
 * Reusable component for uploading images to Cloudinary
 * 
 * Usage:
 * <CloudinaryUpload 
 *   onUpload={(url) => setImageUrl(url)} 
 *   folder="products"
 *   multiple={false}
 * />
 */
export default function CloudinaryUpload({
  onUpload,
  folder = "makeauditeasy",
  multiple = false,
  accept = "image/*",
  className = "",
  buttonText = "Upload Image",
  previewUrl = null,
  onRemove = null,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(previewUrl);

  const handleFileSelect = async (e) => {
    const files = e.target.files;
    if (!files) return;

    setLoading(true);
    setError(null);

    try {
      if (multiple) {
        const uploadedUrls = [];
        for (let i = 0; i < files.length; i++) {
          const result = await uploadToCloudinary(files[i], folder);
          uploadedUrls.push(result.secure_url);
        }
        onUpload(uploadedUrls);
      } else {
        const result = await uploadToCloudinary(files[0], folder);
        setPreview(result.secure_url);
        onUpload(result.secure_url);
      }
    } catch (err) {
      setError(err.message);
      console.error("Upload error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (onRemove) onRemove();
    onUpload(null);
  };

  return (
    <div className={`cloudinary-upload ${className}`}>
      {preview ? (
        <div className="preview-container" style={{ position: "relative" }}>
          <img
            src={preview}
            alt="Preview"
            style={{
              maxWidth: "200px",
              maxHeight: "200px",
              borderRadius: "8px",
              marginBottom: "10px",
            }}
          />
          <button
            type="button"
            onClick={handleRemove}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              background: "red",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "30px",
              height: "30px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      ) : (
        <label
          style={{
            display: "inline-block",
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Uploading..." : buttonText}
          <input
            type="file"
            multiple={multiple}
            accept={accept}
            onChange={handleFileSelect}
            disabled={loading}
            style={{ display: "none" }}
          />
        </label>
      )}
      {error && (
        <div style={{ color: "red", marginTop: "10px", fontSize: "12px" }}>
          {error}
        </div>
      )}
    </div>
  );
}
