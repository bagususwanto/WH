import AddressRack from "../models/AddressRackModel.js";
import Storage from "../models/StorageModel.js";
import Plant from "../models/PlantModel.js";
import Material from "../models/MaterialModel.js";
import Warehouse from "../models/WarehouseModel.js";
import User from "../models/UserModel.js";
import LogMaster from "../models/LogMasterModel.js";
import LogImport from "../models/LogImportModel.js";

export const getAddressRack = async (req, res) => {
  try {
    const response = await AddressRack.findAll({
      where: { flag: 1 },
      include: [
        {
          model: Storage,
          where: { flag: 1 },
          include: [
            {
              model: Plant,
              where: { flag: 1 },
              include: [
                {
                  model: Warehouse,
                  where: { flag: 1 },
                },
              ],
            },
          ],
        },
        {
          model: LogMaster,
          required: false,
          as: "createdBy",
          attributes: ["id", "createdAt", "userId"],
          where: { masterType: "AddressRack", action: "create" },
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
          where: { masterType: "AddressRack" },
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

export const getAddressRackById = async (req, res) => {
  try {
    const addressRackId = req.params.id;
    const userId = req.user.userId;

    const addressRack = await AddressRack.findOne({
      where: { id: addressRackId, flag: 1 },
    });

    if (!addressRack) {
      return res.status(404).json({ message: "AddressRack not found" });
    }

    const response = await AddressRack.findOne({
      where: {
        id: addressRackId,
        flag: 1,
      },
      include: [
        {
          model: Storage,
          where: { flag: 1 },
          include: [
            {
              model: Plant,
              where: { flag: 1 },
              include: [
                {
                  model: Warehouse,
                  where: { flag: 1 },
                },
              ],
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

export const createAddressRack = async (req, res) => {
  try {
    const addressRackName = await AddressRack.findOne({
      where: { addressRackName: req.body.addressRackName, flag: 1 },
    });

    if (addressRackName) {
      return res.status(404).json({ message: "AddressRack already exist" });
    }

    await AddressRack.create(req.body, { userid: req.user.userId });
    res.status(201).json({ message: "AddressRack Created" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateAddressRack = async (req, res) => {
  try {
    const addressRackId = req.params.id;

    const addressRack = await AddressRack.findOne({
      where: { id: addressRackId, flag: 1 },
    });

    if (!addressRack) {
      return res.status(404).json({ message: "AddressRack not found" });
    }

    await AddressRack.update(req.body, {
      where: {
        id: addressRackId,
        flag: 1,
      },
      individualHooks: true,
      userid: req.user.userId,
    });
    res.status(200).json({ message: "AddressRack Updated" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteAddressRack = async (req, res) => {
  try {
    const addressRackId = req.params.id;

    const addressRack = await AddressRack.findOne({
      where: { id: addressRackId, flag: 1 },
    });

    if (!addressRack) {
      return res.status(404).json({ message: "AddressRack not found" });
    }

    await AddressRack.update(
      { flag: 0 },
      {
        where: { id: addressRackId, flag: 1 },
        individualHooks: true,
        userid: req.user.userId,
      }
    );

    res.status(200).json({ message: "AddressRack deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
