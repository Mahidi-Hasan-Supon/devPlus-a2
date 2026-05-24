import dotenv from "dotenv";

dotenv.config();
// console.log(process.env.PORT);
const config = {
  db_key: process.env.DB_KEY,
  port: process.env.PORT,
  secret_key: process.env.SECRET_KEY,
};

export default config;
