import multer from "multer";
import path from "path";
import fs from "fs";

// Filter untuk memastikan file yang diunggah adalah file Excel dengan ekstensi .xlsx
const excelFilter = (req, file, cb) => {
  // Mendapatkan ekstensi file
  const extname = path.extname(file.originalname);
  // Memeriksa tipe MIME
  const mimetype = file.mimetype;

  if (extname === ".xlsx" || extname === ".xls") {
    cb(null, true);
  } else {
    cb("Please upload only .xlsx or .xls Excel file.", false);
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
    const uploadDir = `./resources/uploads/excel`;

    // Cek apakah direktori ada, jika tidak ada maka buat direktori tersebut
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${getUniqueTimestamp()}-bezkoder-${file.originalname}`);
  },
});

// Konfigurasi multer dengan penyimpanan dan filter
const uploadFile = multer({
  storage: storage,
  fileFilter: excelFilter,
});

export default uploadFile;
