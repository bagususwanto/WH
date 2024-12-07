import multer from "multer";
import path from "path";
import fs from "fs";
import Material from "../models/MaterialModel.js";

// Filter untuk memastikan file yang diunggah adalah file gambar dengan ekstensi .jpg, .jpeg, .png
const imageFilter = (req, file, cb) => {
  // Mendapatkan ekstensi file
  const extname = path.extname(file.originalname);

  if (extname === ".jpg" || extname === ".jpeg" || extname === ".png") {
    cb(null, true);
  } else {
    cb(
      "Please upload only image file with extension .jpg, .jpeg, .png.",
      false
    );
  }
};

// Konfigurasi penyimpanan untuk multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = `./resources/uploads/products`;

    // Cek apakah direktori ada, jika tidak ada maka buat direktori tersebut
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: async (req, file, cb) => {
    const material = await Material.findByPk(req.params.id);
    if (!material) {
      cb("Material not found", false);
    } else {
      const materialNo = material.materialNo;
      const extname = path.extname(file.originalname);
      const filename = `${materialNo}${extname}`;
      const filePath = `./resources/uploads/products/${filename}`;

      // Cek apakah file sudah ada
      if (fs.existsSync(filePath)) {
        // Jika file sudah ada, hapus file tersebut
        fs.unlinkSync(filePath);
      }

      cb(null, filename);
    }
  },
});

// Konfigurasi multer dengan penyimpanan dan filter
const uploadImage = multer({
  storage: storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 1024 * 1024 * 5,
  }, // Batasan ukuran file (5MB)
});

export default uploadImage;
