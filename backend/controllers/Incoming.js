import Material from "../models/MaterialModel.js";
import Category from "../models/CategoryModel.js";
import Supplier from "../models/SupplierModel.js";
import Incoming from "../models/IncomingModel.js";

export const getIncoming = async (req, res) => {
  try {
    const response = await Incoming.findAll({
      where: { flag: 1 },
      attributes: ["id", "planning", "actual", "createdAt", "updatedAt"],
      include: [
        {
          model: Material,
          attributes: ["id", "materialNo", "description", "uom", "price", "type", "minStock", "maxStock", "img", "createdAt", "updatedAt"],
          include: [
            {
              model: Category,
              attributes: ["id", "categoryName", "createdAt", "updatedAt"],
            },
            {
              model: Supplier,
              attributes: ["id", "supplierName", "createdAt", "updatedAt"],
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
