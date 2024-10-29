export const getTypeMaterialData = async (req, res) => {
  try {
    const typeMaterial = [
      {
        id: 1,
        type: "INDIRECT",
      },
      {
        id: 2,
        type: "DIRECT",
      },
    ];

    return res.status(200).json(typeMaterial);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};
