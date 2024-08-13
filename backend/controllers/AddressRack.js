import AddressRack from "../models/AddressRackModel.js";
import Location from "../models/LocationModel.js";
import Shop from "../models/ShopModel.js";
import Plant from "../models/PlantModel.js";

export const getAddressRack = async (req, res) => {
  try {
    const response = await AddressRack.findAll({
      where: { flag: 1 },
      attributes: ["id", "addressRackName", "createdAt", "updatedAt"],
      include: [
        {
          model: Location,
          attributes: ["id", "locationName", "createdAt", "updatedAt"],
          include: [
            {
              model: Shop,
              attributes: ["id", "shopName", "costCenter", "wbsNumber", "ext", "createdAt", "updatedAt"],
              include: [
                {
                  model: Plant,
                  attributes: ["id", "plantCode", "plantName", "createdAt", "updatedAt"],
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
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const getAddressRackById = async (req, res) => {
  try {
    const addressRackId = req.params.id;

    const addressRack = await AddressRack.findOne({
      where: { id: addressRackId },
    });

    if (!addressRack) {
      return res.status(404).json({ msg: "AddressRack not found" });
    }

    const response = await AddressRack.findOne({
      where: {
        id: addressRackId,
        flag: 1,
      },
      attributes: ["id", "addressRackName", "createdAt", "updatedAt"],
      include: [
        {
          model: Location,
          attributes: ["id", "locationName", "createdAt", "updatedAt"],
          include: [
            {
              model: Shop,
              attributes: ["id", "shopName", "costCenter", "wbsNumber", "ext", "createdAt", "updatedAt"],
              include: [
                {
                  model: Plant,
                  attributes: ["id", "plantCode", "plantName", "createdAt", "updatedAt"],
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
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const createAddressRack = async (req, res) => {
  try {
    await AddressRack.create(req.body);
    res.status(201).json({ msg: "AddressRack Created" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const updateAddressRack = async (req, res) => {
  try {
    const addressRackId = req.params.id;

    const addressRack = await AddressRack.findOne({
      where: { id: addressRackId },
    });

    if (!addressRack) {
      return res.status(404).json({ msg: "AddressRack not found" });
    }

    await AddressRack.update(req.body, {
      where: {
        id: addressRackId,
      },
    });
    res.status(200).json({ msg: "AddressRack Updated" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const deleteAddressRack = async (req, res) => {
  try {
    const addressRackId = req.params.id;

    const addressRack = await AddressRack.findOne({
      where: { id: addressRackId },
    });

    if (!addressRack) {
      return res.status(404).json({ msg: "AddressRack not found" });
    }

    await AddressRack.update({ flag: 0 }, { where: { id: addressRackId } });

    res.status(200).json({ msg: "AddressRack deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};
