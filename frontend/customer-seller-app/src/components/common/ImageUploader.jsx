import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'

// ============================================
// Cloudinary config — hardcoded (no .env needed)
// Cloud name: zmetxtul
// Preset: localbite_food_uploads (must be UNSIGNED)
// ============================================
const CLOUD_NAME = 'zmetxtul'
const UPLOAD_PRESET = 'localbite_food_uploads'

console.log('[Cloudinary] cloud:', CLOUD_NAME, 'preset:', UPLOAD_PRESET)

export default function ImageUploader({ currentImageUrl, onUploadSuccess }) {
  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentImageUrl || null)

  useEffect(() => {
    setPreview(currentImageUrl || null)
  }, [currentImageUrl])

  const handleFileSelect = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file')
      return
    }

    // Validate file size (max 5 MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB')
      return
    }

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file)
    setPreview(localPreview)
    setUploading(true)

    // Build form data for Cloudinary
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)
    formData.append('folder', 'localbite/foods')

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )

      const data = await response.json()
      console.log('[Cloudinary] response:', data)

      if (data.secure_url) {
        URL.revokeObjectURL(localPreview)
        setPreview(data.secure_url)
        onUploadSuccess(data.secure_url)
        toast.success('Image uploaded')
      } else {
        const msg = data.error?.message || 'Upload failed'
        throw new Error(msg)
      }
    } catch (err) {
      URL.revokeObjectURL(localPreview)
      setPreview(currentImageUrl || null)
      toast.error('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onUploadSuccess(null)
  }

  return (
    <div className="image-uploader">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {preview ? (
        <div className="image-uploader__preview">
          <img src={preview} alt="Food preview" />

          {uploading && (
            <div className="image-uploader__progress">
              <div className="spinner-white" />
              <span>Uploading...</span>
            </div>
          )}

          {!uploading && (
            <div className="image-uploader__overlay">
              <button
                type="button"
                className="btn btn--sm btn--outline"
                onClick={() => fileInputRef.current.click()}
              >
                Change
              </button>
              <button
                type="button"
                className="btn btn--sm btn--danger"
                onClick={handleRemove}
              >
                Remove
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          className="image-uploader__dropzone"
          onClick={() => fileInputRef.current.click()}
          disabled={uploading}
        >
          <div className="image-uploader__icon">📷</div>
          <div className="image-uploader__title">
            Click to upload an image
          </div>
          <div className="image-uploader__hint">
            PNG, JPG, WebP · max 5 MB
          </div>
        </button>
      )}
    </div>
  )
}