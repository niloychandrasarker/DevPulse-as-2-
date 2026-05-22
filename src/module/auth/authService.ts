import config from "../../config";
import { pool } from "../../db";
import type { IUser } from "./user.interfacec";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const signUpdb = async (payload: IUser) => {
  const { name, email, password, role } = payload;

  const hashPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `
    insert into users (name, email, password, role) values ($1, $2, $3, $4) returning *`,
    [name, email, hashPassword, role],
  );

  delete result.rows[0].password;

  return result.rows[0];
};

const loginDb = async (payload: { email: string; password: string }) => {
  const { email, password } = payload;

  const userData = await pool.query(`select * from users where email = $1`, [
    email,
  ]);

  if (userData.rows.length === 0) {
    throw new Error("Invalid credentials");
  }

  const user = userData.rows[0];
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }
  delete user.password;

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(jwtPayload, config.jwtSecret as string, {
    expiresIn: "1h",
  });

  return {
    accessToken,
    user,
  };
};

export const authService = {
  signUpdb,
  loginDb,
};
