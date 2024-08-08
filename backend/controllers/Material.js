// import Material from "../models/MaterialModel.js";

export const getMaterials = async (req, res) => {
  try {
    const material = await Material.findAll();
    console.log(material);
    return res.status(200).json(material);
  } catch (error) {
    console.error("Error fetching material:", error);
    return res.status(500).json({ message: "Failed to fetch material", error: error.message });
  }
};

export const addMaterial = async (req, res) => {
  try {
    const { materialNo, description, uom, price, addressRack, createdBy, updateBy } = req.body;

    await Material.create({
      materialNo,
      description,
      uom,
      price,
      addressRack,
      createdBy,
      updateBy,
    });

    // Kirim respons sukses beserta data material yang baru dibuat
    return res.status(201).json({ msg: "Berhasil menambahkan data material" });
  } catch (error) {
    console.error("Error adding material:", error);
    return res.status(500).json({ message: "Failed to add material", error: error.message });
  }
};
