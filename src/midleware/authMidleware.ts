import config from "../config";
import { pool } from "../db";
import type { ROLES } from "../types";
import sendResponse from "../utility/sendResponse";
import jwt, { type JwtPayload } from "jsonwebtoken";

const authMiddleware = (...roles: ROLES[]) => {
  return async (req: any, res: any, next: any) => {
    try {
      const token = req.headers.authorization;

      if (!token) {
        return sendResponse(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized",
          data: null,
        });
      }

      const decoded = jwt.verify(
        token as string,
        config.jwtSecret as string,
      ) as JwtPayload;

      const userData = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [decoded.email],
      );

      const user = userData.rows[0];

      if (userData.rows.length === 0) {
        return sendResponse(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized",
          data: null,
        });
      }

      if (roles.length && !roles.includes(user.role)) {
        return sendResponse(res, {
          statusCode: 403,
          success: false,
          message: "Forbidden",
        });
      }
      req.user = user;
      next();
    } catch (error) {
      return sendResponse(res, {
        statusCode: 401,
        success: false,
        message: "Invalid token",
        data: null,
      });
    }
  };
};

export default authMiddleware;
