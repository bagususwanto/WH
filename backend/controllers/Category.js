import Category from "../models/CategoryModel.js";

export const getCategory = async (req, res) => {
  try {
    const response = await Category.findAll({
      where: { flag: 1 },
      attributes: ["id", "categoryName", "createdAt", "updatedAt"],
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
      attributes: ["id", "categoryName", "createdAt", "updatedAt"],
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

    await Category.create(req.body);
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

    await Category.update({ flag: 0 }, { where: { id: categoryId, flag: 1 } });

    res.status(200).json({ message: "Category deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
