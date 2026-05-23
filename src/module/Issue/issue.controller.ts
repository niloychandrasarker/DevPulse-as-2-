import type { Request, Response } from "express";
import sendResponse from "../../utility/sendResponse";
import { issueService } from "./issue.service";

const getParamValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const createIssue = async (req: Request, res: Response) => {
  try {
    const created = await issueService.createIssueDB(req.body);

    return sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: created,
    });
  } catch (error) {
    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "Failed to create issue",
      data: null,
      error,
    });
  }
};

const getAllIssues = async (req: Request, res: Response) => {
  try {
    const rawSort = req.query.sort;
    const sort = Array.isArray(rawSort) ? rawSort[0] : rawSort;
    const data = await issueService.getAllIssuesDB(
      sort === "oldest" ? "oldest" : "newest",
    );

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issues retrieved successfully",
      data,
    });
  } catch (error) {
    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "Failed to fetch issues",
      data: null,
      error,
    });
  }
};

const getSingleIssue = async (req: Request, res: Response) => {
  try {
    const id = getParamValue(req.params.id as string | string[]);
    if (!id) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "Invalid issue id",
        data: null,
      });
    }

    const data = await issueService.getSingleIssueDB(id);
    if (!data) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found",
        data: null,
      });
    }

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue retrieved successfully",
      data,
    });
  } catch (error) {
    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "Failed to fetch issue",
      data: null,
      error,
    });
  }
};

const updateIssue = async (req: Request, res: Response) => {
  try {
    const id = getParamValue(req.params.id as string | string[] | undefined);
    if (!id) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "Invalid issue id",
        data: null,
      });
    }

    const user = (req as any).user;
    if (!user) {
      return sendResponse(res, {
        statusCode: 401,
        success: false,
        message: "Unauthorized",
        data: null,
      });
    }

    const issue = await issueService.getSingleIssueDB(id);
    if (!issue) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found",
        data: null,
      });
    }

    if (
      user.role !== "maintainer" &&
      !(
        user.role === "contributor" &&
        issue.reporter_id === user.id &&
        issue.status === "open"
      )
    ) {
      return sendResponse(res, {
        statusCode: 403,
        success: false,
        message: "Forbidden",
        data: null,
      });
    }

    const updated = await issueService.updateIssueDB(id, req.body || {});

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
      data: updated,
    });
  } catch (error) {
    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "Failed to update issue",
      data: null,
      error,
    });
  }
};

const deleteIssue = async (req: Request, res: Response) => {
  try {
    const id = getParamValue(req.params.id as string | string[] | undefined);
    if (!id) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "Invalid issue id",
        data: null,
      });
    }

    const user = (req as any).user;
    if (!user) {
      return sendResponse(res, {
        statusCode: 401,
        success: false,
        message: "Unauthorized",
        data: null,
      });
    }

    if (user.role !== "maintainer") {
      return sendResponse(res, {
        statusCode: 403,
        success: false,
        message: "Forbidden",
        data: null,
      });
    }

    const deleted = await issueService.deleteIssueDB(id);
    if (!deleted) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found",
        data: null,
      });
    }

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully",
      data: null,
    });
  } catch (error) {
    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "Failed to delete issue",
      data: null,
      error,
    });
  }
};

export const issueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue,
};
