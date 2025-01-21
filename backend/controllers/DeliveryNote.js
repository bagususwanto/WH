import AddressRack from "../models/AddressRackModel.js";
import DeliveryNote from "../models/DeliveryNoteModel.js";
import DeliverySchedule from "../models/DeliveryScheduleModel.js";
import Incoming from "../models/IncomingModel.js";
import Inventory from "../models/InventoryModel.js";
import Material from "../models/MaterialModel.js";
import Plant from "../models/PlantModel.js";
import Supplier from "../models/SupplierModel.js";
import { status } from "./HarcodedData.js";

export const getDeliveryNoteByDnNo = async (req, res) => {
  try {
    const dnNo = req.query.dn;
    const today = new Date().getDay();
    let rit = 1;

    const checkRitDnNo = await DeliveryNote.findOne({
      where: { dnNumber: dnNo },
    });
    if (!checkRitDnNo) {
      return res.status(404).json({ message: "Delivery Note Not Found" });
    }

    if (checkRitDnNo.rit) {
      rit = checkRitDnNo.rit + 1;
    }

    const dn = await DeliveryNote.findOne({
      where: { dnNumber: dnNo },
      attributes: ["id", "arrivalPlanDate"],
    });

    const tanggal = new Date(dn.arrivalPlanDate);
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
          required: false,
          where: {
            schedule: day,
            // rit: rit,
            flag: 1,
          },
          include: [
            {
              model: Plant,
              required: false,
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
                        dnNumber: dnNo,
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
          planQuantity: incoming.planning,
          actualQuantity: incoming.actual,
          discrepancy: incoming.actual - incoming.planning,
        }))
      );

      const vendorSchedules = item.Delivery_Schedules.flatMap((schedule) => ({
        supplierName: item.supplierName,
        supplierCode: item.supplierCode,
        day: dayName,
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
        delayTime: item.Materials[0].Inventory.Incomings[0].Delivery_Note
          .arrivalActualTime
          ? new Date(
              item.Materials[0].Inventory.Incomings[0].Delivery_Note.arrivalActualTime
            )
              .toISOString()
              .slice(11, 16)
          : null - new Date(schedule.departure).toISOString().slice(11, 16),
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
