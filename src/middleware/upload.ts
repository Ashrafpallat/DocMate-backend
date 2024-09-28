// middleware/upload.ts
import multer from 'multer';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Specify the folder where files should be uploaded
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Store files with a unique name
  },
});

const upload = multer({ storage });

export { upload };
