import Section from "../models/SectionModel.js";

export const getSection = async (req, res) => {
  try {
    const response = await Section.findAll({
      where: { flag: 1 },
    });

    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getSectionById = async (req, res) => {
  try {
    const sectionId = req.params.id;

    const section = await Section.findOne({
      where: { id: sectionId, flag: 1 },
    });

    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    const response = await Section.findOne({
      where: {
        id: sectionId,
        flag: 1,
      },
    });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createSection = async (req, res) => {
  try {
    const sectionName = await Section.findOne({
      where: { sectionName: req.body.sectionName, flag: 1 },
    });
    if (sectionName) {
      return res.status(400).json({ message: "Section already exists" });
    }

    await Section.create(req.body);
    res.status(201).json({ message: "Section Created" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateSection = async (req, res) => {
  try {
    const sectionId = req.params.id;

    const section = await Section.findOne({
      where: { id: sectionId, flag: 1 },
    });

    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    await Section.update(req.body, {
      where: {
        id: sectionId,
        flag: 1,
      },
    });
    res.status(200).json({ message: "Section Updated" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteSection = async (req, res) => {
  try {
    const sectionId = req.params.id;

    const section = await Section.findOne({
      where: { id: sectionId, flag: 1 },
    });

    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    await Section.update({ flag: 0 }, { where: { id: sectionId, flag: 1 } });

    res.status(200).json({ message: "Section deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};