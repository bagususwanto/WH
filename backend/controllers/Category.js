import Category from "../models/CategoryModel.js";
import LogMaster from "../models/LogMasterModel.js";
import User from "../models/UserModel.js";

export const getCategory = async (req, res) => {
  try {
    const response = await Category.findAll({
      where: { flag: 1 },
      include: [
        {
          model: LogMaster,
          required: false,
          as: "createdBy",
          attributes: ["id", "createdAt", "userId"],
          where: { masterType: "Category", action: "create" },
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
          where: { masterType: "Category" },
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
      ],
    });

    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const categoryId = req.params.id;

    const category = await Category.findOne({
      where: { id: categoryId, flag: 1 },
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const response = await Category.findOne({
      where: {
        id: categoryId,
        flag: 1,
      },
    });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createCategory = async (req, res) => {
  try {
    const categoryName = await Category.findOne({
      where: { categoryName: req.body.categoryName, flag: 1 },
    });
    if (categoryName) {
      return res.status(400).json({ message: "Category already exists" });
    }

    await Category.create(req.body, { userId: req.user.userId });
    res.status(201).json({ message: "Category Created" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    const category = await Category.findOne({
      where: { id: categoryId, flag: 1 },
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await Category.update(req.body, {
      where: {
        id: categoryId,
        flag: 1,
      },
      individualHooks: true,
      userId: req.user.userId,
    });
    res.status(200).json({ message: "Category Updated" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    const category = await Category.findOne({
      where: { id: categoryId, flag: 1 },
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await Category.update(
      { flag: 0 },
      {
        where: { id: categoryId, flag: 1 },
        individualHooks: true,
        userId: req.user.userId,
      }
    );

    res.status(200).json({ message: "Category deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
