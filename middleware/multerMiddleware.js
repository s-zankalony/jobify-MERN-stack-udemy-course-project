import multer from 'multer';
import mimer from 'mimer';
import path from 'path';

const storage = multer.memoryStorage();

const upload = multer({ storage });

export const formatImage = (file) => {
  const fileExtension = path.extname(file.originalname).toString();
  return `data:${mimer(fileExtension)};base64,${file.buffer.toString('base64')}`;
};

export default upload;
