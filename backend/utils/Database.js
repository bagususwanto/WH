import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const db = new Sequelize(process.env.DB_DATABASE_DEV, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_SERVER_LOCAL,
  dialect: process.env.DIALECT,
  logging: false,
  timezone: "+07:00",
  dialectOptions: {
    options: {
      encrypt: false, // Set true jika menggunakan jaringan encrypt
      trustServerCertificate: true,
    },
  },
});

export default db;

// To test the connection
db.authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });
