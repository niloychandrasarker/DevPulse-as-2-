import type { Request, Response } from "express";
import { authService } from "./auth.service";
import sendResponse from "../../utility/sendResponse";

const signUpController = async (req: Request, res: Response) => {
  try {
    const result = await authService.signUpdb(req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "User created successfully",
      data: result,
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "User creation failed",
      data: null,
    });
  }
};

const loginController = async (req: Request, res: Response) => {
  try {
    const result = await authService.loginDb(req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User logged in successfully",
      data: result,
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "Invalid credentials",
      data: null,
    });
  }
};

export const authController = {
  signUpController,
  loginController,
};
