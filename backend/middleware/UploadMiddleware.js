import multer from "multer";
import path from "path";

// Filter untuk memastikan file yang diunggah adalah file Excel dengan ekstensi .xlsx
const excelFilter = (req, file, cb) => {
  // Mendapatkan ekstensi file
  const extname = path.extname(file.originalname);
  // Memeriksa tipe MIME
  const mimetype = file.mimetype;

  if (extname === ".xlsx") {
    cb(null, true);
  } else {
    cb("Please upload only .xlsx Excel file.", false);
  }
};

// Fungsi untuk mendapatkan timestamp yang unik
const getUniqueTimestamp = () => {
  const hrTime = process.hrtime();
  return `${Date.now()}-${hrTime[0]}${hrTime[1]}`;
};

const __basedir = path.dirname(new URL(import.meta.url).pathname);

// Konfigurasi penyimpanan untuk multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `./resources/uploads/excel`);
  },
  filename: (req, file, cb) => {
    cb(null, `${getUniqueTimestamp()}-bezkoder-${file.originalname}`);
  },
});

// Konfigurasi multer dengan penyimpanan dan filter
const uploadFile = multer({ storage, fileFilter: excelFilter });

export default uploadFile;
