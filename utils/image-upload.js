const cloudinary = require('./cloudinary');

/**
 * Process image uploads from frontend
 * @param {Array|Object} images - Array of base64 image strings or single image object
 * @returns {Promise<Array>} Array of uploaded image objects with url and public_id
 */
exports.processProductImages = async (images) => {
  try {
    // If images is not an array, convert to array or empty array
    if (!images) return [];
    
    const imageArray = Array.isArray(images) ? images : [images];
    const uploadedImages = [];
    
    // Process each image
    for (const image of imageArray) {
      // If image is already an object with url and public_id, keep it as is
      if (image.url && image.public_id) {
        uploadedImages.push(image);
        continue;
      }
      
      // If image is a base64 string, upload to cloudinary
      if (typeof image === 'string' && image.startsWith('data:image')) {
        const uploadedImage = await cloudinary.uploadBase64Image(image);
        uploadedImages.push(uploadedImage);
      }
    }
    
    return uploadedImages;
  } catch (error) {
    console.error('Error processing images:', error);
    throw new Error('Failed to process images. Please try again.');
  }
}; 