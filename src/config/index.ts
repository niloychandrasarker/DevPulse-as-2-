import dotenv from "dotenv";

import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const config = {
  dbUrl: process.env.DB_URL,
  port: process.env.PORT || "5000",
  jwtSecret: process.env.JWT_SECRET,
};

export default config;
