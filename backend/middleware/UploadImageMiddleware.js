import multer from "multer";
import path from "path";
import fs from "fs";
import Material from "../models/MaterialModel.js";
import User from "../models/UserModel.js";

// Filter untuk memastikan file yang diunggah adalah file gambar dengan ekstensi .jpg, .jpeg, .png
const imageFilter = (req, file, cb) => {
  const extname = path.extname(file.originalname).toLowerCase();
  if (extname === ".jpg" || extname === ".jpeg" || extname === ".png") {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Please upload only image file with extension .jpg, .jpeg, .png."
      ),
      false
    );
  }
};

// Fungsi untuk membuat konfigurasi multer
const createMulterConfig = (uploadDir, filenameCallback) => {
  return multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        // Cek apakah direktori ada, jika tidak ada maka buat direktori tersebut
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: filenameCallback,
    }),
    fileFilter: imageFilter,
    limits: {
      fileSize: 1024 * 1024 * 5, // Batasan ukuran file (5MB)
    },
  });
};

// Fungsi untuk mengunggah gambar produk
export const uploadImageProduct = async (req, res, next) => {
  const storage = createMulterConfig(
    "./resources/uploads/products",
    async (req, file, cb) => {
      const material = await Material.findByPk(req.params.id);
      if (!material) {
        cb(new Error("Material not found"), false);
      } else {
        const materialNo = material.materialNo;
        const extname = path.extname(file.originalname).toLowerCase();
        const filename = `${materialNo}${extname}`;
        const filePath = path.join("./resources/uploads/products", filename);

        // Cek apakah file sudah ada
        if (fs.existsSync(filePath)) {
          // Jika file sudah ada, hapus file tersebut
          fs.unlinkSync(filePath);
        }

        cb(null, filename);
      }
    }
  );

  const upload = storage.single("image"); // 'image' adalah nama field di form
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).send({ message: err.message });
    }
    next();
  });
};

// Fungsi untuk mengunggah gambar profil pengguna
export const uploadProfileImage = async (req, res, next) => {
  const storage = createMulterConfig(
    "./resources/uploads/profiles",
    async (req, file, cb) => {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        cb(new Error("User not found"), false);
      } else {
        const username = user.username;
        const extname = path.extname(file.originalname).toLowerCase();
        const filename = `${username}${extname}`;
        const filePath = path.join("./resources/uploads/profiles", filename);

        // Cek apakah file sudah ada
        if (fs.existsSync(filePath)) {
          // Jika file sudah ada, hapus file tersebut
          fs.unlinkSync(filePath);
        }

        cb(null, filename);
      }
    }
  );

  const upload = storage.single("image"); // 'image' adalah nama field di form
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).send({ message: err.message });
    }
    next();
  });
};

// Fungsi untuk mengunggah gambar umum
export const uploadGeneralImage = (req, res, next) => {
  const storage = createMulterConfig(
    "./resources/uploads/general",
    (req, file, cb) => {
      const extname = path.extname(file.originalname).toLowerCase();
      const filename = `${Date.now()}${extname}`; // Menggunakan timestamp untuk nama file unik
      const filePath = path.join("./resources/uploads/general", filename);

      // Cek apakah file sudah ada
      if (fs.existsSync(filePath)) {
        // Jika file sudah ada, hapus file tersebut
        fs.unlinkSync(filePath);
      }

      cb(null, filename);
    }
  );

  const upload = storage.single("image"); // 'image' adalah nama field di form
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).send({ message: err.message });
    }
    next();
  });
};
