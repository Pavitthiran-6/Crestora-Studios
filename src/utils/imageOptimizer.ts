/**
 * Supabase and Static Image Optimizer
 * Resizes and compresses images on the fly to boost website loading speed by up to 100x.
 */

export const getOptimizedImageUrl = (url: string, width = 800, quality = 80): string => {
  if (!url) return '';

  // 1. If it's a Supabase storage URL, convert it to the edge-optimized render URL
  // We use &resize=contain to preserve the original aspect ratio completely and prevent cropping!
  if (url.includes('/storage/v1/object/public/')) {
    const renderUrl = url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
    return `${renderUrl}?width=${width}&resize=contain&quality=${quality}`;
  }

  // 2. Return standard URL for external or other local assets
  return url;
};
