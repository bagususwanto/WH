import Category from "../models/CategoryModel.js";

export const getCategory = async (req, res) => {
  try {
    const response = await Category.findAll({ where: { flag: 1 } });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const response = await Category.findOne({
      where: {
        id: req.params.id,
        flag: 1,
      },
    });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
  }
};

export const createCategory = async (req, res) => {
  try {
    await Category.create(req.body);
    res.status(201).json({ msg: "Category Created" });
  } catch (error) {
    console.log(error.message);
  }
};

export const updateCategory = async (req, res) => {
  try {
    await Category.update(req.body, {
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ msg: "Category Updated" });
  } catch (error) {
    console.log(error.message);
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    const category = await Category.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      return res.status(404).json({ msg: "Category not found" });
    }

    await Category.update({ flag: 0 }, { where: { id: categoryId } });

    res.status(200).json({ msg: "Category deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};
