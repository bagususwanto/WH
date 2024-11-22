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

export const getStatusOrder = async (req, res) => {
  try {
    const status = [
      {
        id: 1,
        status: "waiting approval",
      },
      {
        id: 2,
        status: "waiting confirmation",
      },
      {
        id: 3,
        status: "on process",
      },
      {
        id: 4,
        status: "ready to pickup",
      },
      {
        id: 5,
        status: "ready to deliver",
      },
      {
        id: 6,
        status: "completed",
      },
    ];

    return res.status(200).json(status);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};
