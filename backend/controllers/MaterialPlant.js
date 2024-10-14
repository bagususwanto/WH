import MaterialPlant from "../models/MaterialPlantModel.js";
import Material from "../models/MaterialModel.js";
import Plant from "../models/PlantModel.js";

export const getMaterialPlant = async (req, res) => {
  try {
    const response = await MaterialPlant.findAll({
      where: { flag: 1 },
    });

    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMaterialPlantByPlantId = async (req, res) => {
  try {
    const plantId = req.params.id;

    const materialPlant = await MaterialPlant.findOne({
      where: { plantId: plantId, flag: 1 },
    });

    if (!materialPlant) {
      return res.status(404).json({ message: "MaterialPlant not found" });
    }

    const response = await MaterialPlant.findAll({
      where: {
        plantId: plantId,
        flag: 1,
      },
    });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createMaterialPlant = async (req, res) => {
  try {
    const { materialId, plantId } = req.body;
    if (!materialId || !plantId) {
      return res.status(400).json({ message: "PlantId and MaterialId are required" });
    }

    const material = await Material.findOne({
      where: { id: materialId, flag: 1 },
    });

    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    const plant = await Plant.findOne({
      where: { id: plantId, flag: 1 },
    });

    if (!plant) {
      return res.status(404).json({ message: "Plant not found" });
    }

    const existingMaterialPlant = await MaterialPlant.findOne({
      where: { materialId: materialId, plantId: plantId },
    });

    if (existingMaterialPlant) {
      return res.status(400).json({ message: "MaterialPlant already exists" });
    }

    await MaterialPlant.create(req.body);
    res.status(201).json({ message: "MaterialPlant Created" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateMaterialPlant = async (req, res) => {
  try {
    const { id } = req.params; // Mengambil id dari parameter URL
    const { plantIds } = req.body; // Mendapatkan plantIds dari request body

    // Cek apakah Material dengan id tersebut ada
    const material = await Material.findOne({
      where: { id: id, flag: 1 },
    });

    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    // Cari Plant yang sesuai dengan plantIds dari request body
    const plant = await Plant.findAll({
      where: { id: plantIds, flag: 1 }, // Mendapatkan plant berdasarkan id
    });

    if (!plant || plant.length === 0) {
      return res.status(404).json({ message: "Plants not found" });
    }

    // Update relasi many-to-many antara Material dan Plant melalui tabel MaterialPlant
    await material.setPlants(plant); // Mengganti semua relasi existing dengan Plant baru

    res.status(200).json({ message: "Material plant updated successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteMaterialPlant = async (req, res) => {
  try {
    const { materialId, plantId } = req.params; // Mengambil plantId dan plantId dari parameter URL

    // Cek apakah relasi antara Material dan Plant dengan flag 1 (aktif) ada
    const materialPlant = await MaterialPlant.findOne({
      where: { plantId: materialId, plantId: plantId, flag: 1 }, // Hanya mencari relasi aktif (flag = 1)
    });

    if (!materialPlant) {
      return res.status(404).json({ message: "MaterialPlant relation not found or already deleted" });
    }

    // Update flag menjadi 0 (soft delete)
    await MaterialPlant.update(
      { flag: 0 }, // Mengubah flag menjadi 0 (menandai sebagai "dihapus")
      { where: { plantId: materialId, plantId: plantId, flag: 1 } }
    );

    res.status(200).json({ message: "MaterialPlant relation deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
