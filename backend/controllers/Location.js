import Location from "../models/LocationModel.js";
import Shop from "../models/ShopModel.js";
import Plant from "../models/PlantModel.js";

export const getLocation = async (req, res) => {
  try {
    const response = await Location.findAll({
      where: { flag: 1 },
      attributes: ["id", "locationName", "createdAt", "updatedAt"],
      include: [
        {
          model: Shop,
          attributes: ["id", "shopName", "createdAt", "updatedAt"],
          include: [
            {
              model: Plant,
              attributes: ["id", "plantCode", "plantName", "createdAt", "updatedAt"],
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

export const getLocationById = async (req, res) => {
  try {
    const locationId = req.params.id;

    const location = await Location.findOne({
      where: { id: locationId },
    });

    if (!location) {
      return res.status(404).json({ msg: "Location not found" });
    }

    const response = await Location.findOne({
      where: {
        id: locationId,
        flag: 1,
      },
      attributes: ["id", "locationName", "createdAt", "updatedAt"],
      include: [
        {
          model: Shop,
          attributes: ["id", "shopName", "createdAt", "updatedAt"],
          include: [
            {
              model: Plant,
              attributes: ["id", "plantCode", "plantName", "createdAt", "updatedAt"],
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

export const getLocationByShop = async (req, res) => {
  try {
    const shopId = req.params.id;

    const shop = await Location.findOne({
      where: { shopId: shopId },
    });

    if (!shop) {
      return res.status(404).json({ msg: "Location not found" });
    }

    const response = await Location.findAll({
      where: {
        shopId: shopId,
        flag: 1,
      },
      attributes: ["id", "locationName", "createdAt", "updatedAt"],
    });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const createLocation = async (req, res) => {
  try {
    await Location.create(req.body);
    res.status(201).json({ msg: "Location Created" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const updateLocation = async (req, res) => {
  try {
    const locationId = req.params.id;

    const location = await Location.findOne({
      where: { id: locationId },
    });

    if (!location) {
      return res.status(404).json({ msg: "Location not found" });
    }

    await Location.update(req.body, {
      where: {
        id: locationId,
      },
    });
    res.status(200).json({ msg: "Location Updated" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const deleteLocation = async (req, res) => {
  try {
    const locationId = req.params.id;

    const location = await Location.findOne({
      where: { id: locationId },
    });

    if (!location) {
      return res.status(404).json({ msg: "Location not found" });
    }

    await Location.update({ flag: 0 }, { where: { id: locationId } });

    res.status(200).json({ msg: "Location deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};
