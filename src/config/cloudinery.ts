import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dwvguo1mz',
  api_key: process.env.CLOUDINARY_API_KEY || '696832819334472',
  api_secret: process.env.CLOUDINARY_API_SECRET || "lo-rRVej-5q83WJBKfoGWHmqN6E",
});

export default cloudinary;
