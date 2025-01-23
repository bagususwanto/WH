import AddressRack from "../models/AddressRackModel.js";
import DeliveryNote from "../models/DeliveryNoteModel.js";
import DeliverySchedule from "../models/DeliveryScheduleModel.js";
import Incoming from "../models/IncomingModel.js";
import Inventory from "../models/InventoryModel.js";
import Material from "../models/MaterialModel.js";
import Plant from "../models/PlantModel.js";
import Supplier from "../models/SupplierModel.js";

export const getDeliveryNoteByDnNo = async (req, res) => {
  try {
    const { dn, rit } = req.query;

    const checkDnNo = await DeliveryNote.findOne({
      where: { dnNumber: dn },
    });

    if (!checkDnNo) {
      return res.status(404).json({ message: "Delivery Note not found" });
    }

    const tanggal = new Date(checkDnNo.arrivalPlanDate);
    const day = tanggal.getDay();

    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayName = days[day];

    const data = await Supplier.findAll({
      attributes: ["id", "supplierName", "supplierCode"],
      where: { flag: 1 },
      include: [
        {
          model: DeliverySchedule,
          required: true,
          where: {
            schedule: day,
            flag: 1,
          },
          include: [
            {
              model: Plant,
              required: true,
              attributes: ["id", "plantName", "plantCode"],
              where: { flag: 1 },
            },
          ],
        },
        {
          model: Material,
          required: true,
          attributes: ["id", "materialNo", "description", "uom"],
          where: { flag: 1 },
          include: [
            {
              model: Inventory,
              attributes: ["id", "materialId", "addressId"],
              required: true,
              include: [
                {
                  model: AddressRack,
                  required: false,
                  attributes: ["id", "addressRackName"],
                  where: { flag: 1 },
                },
                {
                  model: Incoming,
                  required: true,
                  include: [
                    {
                      model: DeliveryNote,
                      required: true,
                      where: {
                        dnNumber: dn,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!data) {
      return res.status(404).json({ message: "Delivery Note Not Found" });
    }

    // mapping data
    const mappedData = data.map((item) => {
      const deliveryNotes = item.Materials.flatMap((material) =>
        material.Inventory.Incomings.map((incoming) => ({
          dnNumber: incoming.Delivery_Note.dnNumber,
          materialNo: material.materialNo,
          address: material.Inventory.Address_Rack.addressRackName,
          description: material.description,
          reqQuantity: incoming.planning,
          receivedQuantity: incoming.actual,
          remain: incoming.actual - incoming.planning,
          status: incoming.status,
        }))
      );

      const vendorSchedules = item.Delivery_Schedules?.flatMap((schedule) => ({
        supplierName: item.supplierName,
        supplierCode: item.supplierCode,
        truckStation: schedule.truckStation,
        rit: schedule.rit,
        day: dayName,
        arrivalPlanDate:
          item.Materials[0].Inventory.Incomings[0].Delivery_Note
            .arrivalPlanDate,
        arrivalPlanTime: new Date(schedule.arrival).toISOString().slice(11, 16),
        departurePlanTime: new Date(schedule.departure)
          .toISOString()
          .slice(11, 16),
        arrivalActualTime: item.Materials[0].Inventory.Incomings[0]
          .Delivery_Note.arrivalActualTime
          ? new Date(
              item.Materials[0].Inventory.Incomings[0].Delivery_Note.arrivalActualTime
            )
              .toISOString()
              .slice(11, 16)
          : null,
        status: item.Materials[0].Inventory.Incomings[0].Delivery_Note.status,
      }));

      return {
        deliveryNotes,
        vendorSchedules,
      };
    });

    // Kirim data
    res.status(200).json({
      data: mappedData,
      message: "Data Delivery Note Found",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
