import Packaging from "../models/PackagingModel.js";

export const getPackaging = async (req, res) => {
  try {
    const response = await Packaging.findAll({
      where: { flag: 1 },
    });

    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPackagingById = async (req, res) => {
  try {
    const packagingId = req.params.id;

    const packaging = await Packaging.findOne({
      where: { id: packagingId, flag: 1 },
    });

    if (!packaging) {
      return res.status(404).json({ message: "Packaging not found" });
    }

    const response = await Packaging.findOne({
      where: {
        id: packagingId,
        flag: 1,
      },
    });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createPackaging = async (req, res) => {
  try {
    const packagingName = await Packaging.findOne({
      where: { packagingName: req.body.packagingName, flag: 1 },
    });
    if (packagingName) {
      return res.status(400).json({ message: "Packaging already exists" });
    }

    await Packaging.create(req.body);
    res.status(201).json({ message: "Packaging Created" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updatePackaging = async (req, res) => {
  try {
    const packagingId = req.params.id;

    const packaging = await Packaging.findOne({
      where: { id: packagingId, flag: 1 },
    });

    if (!packaging) {
      return res.status(404).json({ message: "Packaging not found" });
    }

    await Packaging.update(req.body, {
      where: {
        id: packagingId,
        flag: 1,
      },
    });
    res.status(200).json({ message: "Packaging Updated" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deletePackaging = async (req, res) => {
  try {
    const packagingId = req.params.id;

    const packaging = await Packaging.findOne({
      where: { id: packagingId, flag: 1 },
    });

    if (!packaging) {
      return res.status(404).json({ message: "Packaging not found" });
    }

    await Packaging.update(
      { flag: 0 },
      { where: { id: packagingId, flag: 1 } }
    );

    res.status(200).json({ message: "Packaging deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
