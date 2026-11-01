/**
 * Client-side image compression utility.
 * Compresses customer payment screenshots before upload to save mobile bandwidth
 * and stay well under the 5MB Supabase Storage limit (target ~200KB - 800KB).
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeMB?: number;
}

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<{ file: File; previewUrl: string }> {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.8,
  } = options;

  return new Promise((resolve, reject) => {
    // If not an image, reject
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image'));
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Maintain aspect ratio while scaling down
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Could not get canvas 2d context'));
        }

        // Draw image onto canvas
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to webp or jpeg
        const outputMime = 'image/jpeg';
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Image compression failed'));
            }

            const cleanFileName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
            const compressedFile = new File([blob], cleanFileName, {
              type: outputMime,
              lastModified: Date.now(),
            });

            const previewUrl = URL.createObjectURL(blob);
            resolve({ file: compressedFile, previewUrl });
          },
          outputMime,
          quality
        );
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

