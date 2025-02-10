import LogImport from "../models/LogImportModel.js";
import LogMaster from "../models/LogMasterModel.js";
import Packaging from "../models/PackagingModel.js";
import User from "../models/UserModel.js";

export const getPackaging = async (req, res) => {
  try {
    const response = await Packaging.findAll({
      where: { flag: 1 },
      include: [
        {
          model: LogMaster,
          required: false,
          as: "createdBy",
          attributes: ["id", "createdAt", "userId"],
          where: { masterType: "Packaging", action: "create" },
          include: [
            {
              model: User,
              required: false,
              attributes: ["id", "username"],
            },
          ],
        },
        {
          model: LogMaster,
          required: false,
          as: "updatedBy",
          attributes: ["id", "createdAt", "userId"],
          where: { masterType: "Packaging" },
          include: [
            {
              model: User,
              required: false,
              attributes: ["id", "username"],
            },
          ],
          order: [["createdAt", "DESC"]],
          limit: 1,
        },
        {
          model: LogImport,
          attributes: ["id", "createdAt", "userId"],
          required: false,
          include: [
            {
              model: User,
              required: false,
              attributes: ["id", "username"],
            },
          ],
        },
      ],
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
    const packaging = await Packaging.findOne({
      where: {
        packaging: req.body.packaging,
        unitPackaging: req.body.unitPackaging,
        flag: 1,
      },
    });
    if (packaging) {
      return res.status(400).json({ message: "Packaging already exists" });
    }

    await Packaging.create(req.body, { userId: req.user.userId });
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

    const existPackaging = await Packaging.findOne({
      where: {
        packaging: req.body.packaging,
        unitPackaging: req.body.unitPackaging,
        flag: 1,
      },
    });
    if (existPackaging) {
      return res.status(400).json({ message: "Packaging already exists" });
    }

    await Packaging.update(
      {
        unitPackaging: req.body.unitPackaging,
      },
      {
        where: {
          id: packagingId,
          flag: 1,
        },
        individualHooks: true,
        userId: req.user.userId,
      }
    );
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
      {
        where: { id: packagingId, flag: 1 },
        individualHooks: true,
        userId: req.user.userId,
      }
    );

    res.status(200).json({ message: "Packaging deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
