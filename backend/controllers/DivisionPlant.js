import DivisionPlant from "../models/DivisionPlantModel.js";
import Division from "../models/DivisionModel.js";
import Plant from "../models/PlantModel.js";

export const getDivisionPlant = async (req, res) => {
  try {
    const response = await DivisionPlant.findAll({
      where: { flag: 1 },
    });

    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getDivisionPlantByDivisionId = async (req, res) => {
  try {
    const divisionId = req.params.id;

    const divisionPlant = await DivisionPlant.findOne({
      where: { divisionId: divisionId, flag: 1 },
    });

    if (!divisionPlant) {
      return res.status(404).json({ message: "DivisionPlant not found" });
    }

    const response = await DivisionPlant.findAll({
      where: {
        divisionId: divisionId,
        flag: 1,
      },
    });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createDivisionPlant = async (req, res) => {
  try {
    const { divisionId, plantId } = req.body;
    if (!divisionId || !plantId) {
      return res.status(400).json({ message: "DivisionId and PlantId are required" });
    }

    const division = await Division.findOne({
      where: { id: divisionId, flag: 1 },
    });

    if (!division) {
      return res.status(404).json({ message: "Division not found" });
    }

    const plant = await Plant.findOne({
      where: { id: plantId, flag: 1 },
    });

    if (!plant) {
      return res.status(404).json({ message: "Plant not found" });
    }

    const existingDivisionPlant = await DivisionPlant.findOne({
      where: { divisionId: divisionId, plantId: plantId },
    });

    if (existingDivisionPlant) {
      return res.status(400).json({ message: "DivisionPlant already exists" });
    }

    await DivisionPlant.create(req.body);
    res.status(201).json({ message: "DivisionPlant Created" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateDivisionPlant = async (req, res) => {
  try {
    const { divisionId } = req.params; // Mengambil divisionId dari parameter URL
    const { plantIds } = req.body; // Mendapatkan plantIds dari request body

    // Cek apakah Division dengan id tersebut ada
    const division = await Division.findOne({
      where: { id: divisionId, flag: 1 },
    });

    if (!division) {
      return res.status(404).json({ message: "Division not found" });
    }

    // Cari Plant yang sesuai dengan plantIds dari request body
    const plant = await Plant.findAll({
      where: { id: plantIds, flag: 1 }, // Mendapatkan plant berdasarkan id
    });

    if (!plant || plant.length === 0) {
      return res.status(404).json({ message: "Plants not found" });
    }

    // Update relasi many-to-many antara Division dan Plant melalui tabel DivisionPlant
    await division.setPlants(plant); // Mengganti semua relasi existing dengan Plant baru

    res.status(200).json({ message: "Division plant updated successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteDivisionPlant = async (req, res) => {
  try {
    const { divisionId, plantId } = req.params; // Mengambil divisionId dan plantId dari parameter URL

    // Cek apakah relasi antara Division dan Plant dengan flag 1 (aktif) ada
    const divisionPlant = await DivisionPlant.findOne({
      where: { divisionId: divisionId, plantId: plantId, flag: 1 }, // Hanya mencari relasi aktif (flag = 1)
    });

    if (!divisionPlant) {
      return res.status(404).json({ message: "DivisionPlant relation not found or already deleted" });
    }

    // Update flag menjadi 0 (soft delete)
    await DivisionPlant.update(
      { flag: 0 }, // Mengubah flag menjadi 0 (menandai sebagai "dihapus")
      { where: { divisionId: divisionId, plantId: plantId, flag: 1 } }
    );

    res.status(200).json({ message: "DivisionPlant relation deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
