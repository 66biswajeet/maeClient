/**
 * Cloudinary configuration and utilities
 */
export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dr4srmkgc",
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "mae_uploads",
};

/**
 * Upload a single file to Cloudinary using fetch API
 * @param {File} file - File to upload
 * @param {string} folder - Cloudinary folder path
 * @returns {Promise<{url: string, secure_url: string, public_id: string}>}
 */
export const uploadToCloudinary = async (file, folder = "makeauditeasy") => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
  formData.append("folder", folder);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      url: data.url,
      secure_url: data.secure_url,
      public_id: data.public_id,
      width: data.width,
      height: data.height,
      format: data.format,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};

/**
 * Upload multiple files to Cloudinary
 * @param {File[]} files - Files to upload
 * @param {string} folder - Cloudinary folder path
 * @returns {Promise<Array>}
 */
export const uploadMultipleToCloudinary = async (
  files,
  folder = "makeauditeasy",
) => {
  const uploadPromises = files.map((file) => uploadToCloudinary(file, folder));
  return Promise.all(uploadPromises);
};

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - Public ID of the asset
 * @returns {Promise<{result: string}>}
 */
export const deleteFromCloudinary = async (publicId) => {
  // Note: Deletion requires API Key and Secret, which should only be done from backend
  // This is a placeholder - actual deletion should be done via backend
  console.warn("Deletion should be handled via backend using API credentials");
};

export default {
  CLOUDINARY_CONFIG,
  uploadToCloudinary,
  uploadMultipleToCloudinary,
  deleteFromCloudinary,
};
