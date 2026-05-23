"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/server.ts
var server_exports = {};
__export(server_exports, {
  default: () => server_default
});
module.exports = __toCommonJS(server_exports);

// src/app.ts
var import_express3 = __toESM(require("express"));

// src/globalerrorhandler/globalErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
};
var globalErrorHandler_default = globalErrorHandler;

// src/module/auth/auth.route.ts
var import_express = require("express");

// src/config/index.ts
var import_dotenv = __toESM(require("dotenv"));
var import_path = __toESM(require("path"));
import_dotenv.default.config({ path: import_path.default.join(process.cwd(), ".env") });
var config = {
  dbUrl: process.env.DB_URL,
  port: process.env.PORT || "5000",
  jwtSecret: process.env.JWT_SECRET
};
var config_default = config;

// src/db/index.ts
var import_pg = require("pg");
var pool = new import_pg.Pool({
  connectionString: config_default.dbUrl
});
var initDB = async () => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(50) NOT NULL,
      email VARCHAR(50) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL default 'contributor',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    await pool.query(`CREATE TABLE IF NOT EXISTS Issues (
        id SERIAL PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'open',
        reporter_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
    console.log("Database connected successfully");
  } catch (error) {
    console.log(error);
  }
};

// src/module/auth/auth.service.ts
var import_bcrypt = __toESM(require("bcrypt"));
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var signUpdb = async (payload) => {
  const { name, email, password, role } = payload;
  const hashPassword = await import_bcrypt.default.hash(password, 10);
  const result = await pool.query(
    `
    insert into users (name, email, password, role)
    values ($1, $2, $3, $4)
    returning id, name, email, role, created_at, updated_at`,
    [name, email, hashPassword, role]
  );
  return result.rows[0];
};
var loginDb = async (payload) => {
  const { email, password } = payload;
  const userData = await pool.query(`select * from users where email = $1`, [
    email
  ]);
  if (userData.rows.length === 0) {
    throw new Error("Invalid credentials");
  }
  const user = userData.rows[0];
  const isMatch = await import_bcrypt.default.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }
  delete user.password;
  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  const accessToken = import_jsonwebtoken.default.sign(jwtPayload, config_default.jwtSecret, {
    expiresIn: "1h"
  });
  return {
    accessToken,
    user
  };
};
var authService = {
  signUpdb,
  loginDb
};

// src/utility/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error
  });
};
var sendResponse_default = sendResponse;

// src/module/auth/auth.controller.ts
var signUpController = async (req, res) => {
  try {
    const result = await authService.signUpdb(req.body);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "User created successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 400,
      success: false,
      message: "User creation failed",
      data: null
    });
  }
};
var loginController = async (req, res) => {
  try {
    const result = await authService.loginDb(req.body);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "User logged in successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 400,
      success: false,
      message: "Invalid credentials",
      data: null
    });
  }
};
var authController = {
  signUpController,
  loginController
};

// src/module/auth/auth.route.ts
var router = (0, import_express.Router)();
router.post("/signup", authController.signUpController);
router.post("/login", authController.loginController);
var authRoute = router;

// src/module/Issue/issue.router.ts
var import_express2 = require("express");

// src/module/Issue/issue.service.ts
var createIssueDB = async (payload) => {
  const { title, description, type } = payload;
  const result = await pool.query(
    `INSERT INTO issues (title, description, type)
		 VALUES ($1, $2, $3)
		 RETURNING *`,
    [title, description, type]
  );
  return result.rows[0];
};
var getAllIssuesDB = async (sort) => {
  const sortSql = sort === "oldest" ? "ASC" : "DESC";
  const result = await pool.query(
    `SELECT * FROM issues ORDER BY created_at ${sortSql}`
  );
  return result.rows;
};
var getSingleIssueDB = async (id) => {
  const result = await pool.query(`SELECT * FROM issues WHERE id = $1`, [id]);
  return result.rows[0] || null;
};
var updateIssueDB = async (id, payload) => {
  const { title, description, type } = payload;
  const result = await pool.query(
    `UPDATE issues
     SET title = COALESCE($1, title),
         description = COALESCE($2, description),
         type = COALESCE($3, type)
     WHERE id = $4
     RETURNING *`,
    [title, description, type, id]
  );
  return result.rows[0] || null;
};
var deleteIssueDB = async (id) => {
  const result = await pool.query(`DELETE FROM issues WHERE id = $1`, [id]);
  return result.rowCount || 0;
};
var issueService = {
  createIssueDB,
  getAllIssuesDB,
  getSingleIssueDB,
  updateIssueDB,
  deleteIssueDB
};

// src/module/Issue/issue.controller.ts
var getParamValue = (value) => Array.isArray(value) ? value[0] : value;
var createIssue = async (req, res) => {
  try {
    const created = await issueService.createIssueDB(req.body);
    return sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: created
    });
  } catch (error) {
    return sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: "Failed to create issue",
      data: null,
      error
    });
  }
};
var getAllIssues = async (req, res) => {
  try {
    const rawSort = req.query.sort;
    const sort = Array.isArray(rawSort) ? rawSort[0] : rawSort;
    const data = await issueService.getAllIssuesDB(
      sort === "oldest" ? "oldest" : "newest"
    );
    return sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issues retrieved successfully",
      data
    });
  } catch (error) {
    return sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: "Failed to fetch issues",
      data: null,
      error
    });
  }
};
var getSingleIssue = async (req, res) => {
  try {
    const id = getParamValue(req.params.id);
    if (!id) {
      return sendResponse_default(res, {
        statusCode: 400,
        success: false,
        message: "Invalid issue id",
        data: null
      });
    }
    const data = await issueService.getSingleIssueDB(id);
    if (!data) {
      return sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found",
        data: null
      });
    }
    return sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue retrieved successfully",
      data
    });
  } catch (error) {
    return sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: "Failed to fetch issue",
      data: null,
      error
    });
  }
};
var updateIssue = async (req, res) => {
  try {
    const id = getParamValue(req.params.id);
    if (!id) {
      return sendResponse_default(res, {
        statusCode: 400,
        success: false,
        message: "Invalid issue id",
        data: null
      });
    }
    const user = req.user;
    if (!user) {
      return sendResponse_default(res, {
        statusCode: 401,
        success: false,
        message: "Unauthorized",
        data: null
      });
    }
    const issue = await issueService.getSingleIssueDB(id);
    if (!issue) {
      return sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found",
        data: null
      });
    }
    if (user.role !== "maintainer" && !(user.role === "contributor" && issue.reporter_id === user.id && issue.status === "open")) {
      return sendResponse_default(res, {
        statusCode: 403,
        success: false,
        message: "Forbidden",
        data: null
      });
    }
    const updated = await issueService.updateIssueDB(id, req.body || {});
    return sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
      data: updated
    });
  } catch (error) {
    return sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: "Failed to update issue",
      data: null,
      error
    });
  }
};
var deleteIssue = async (req, res) => {
  try {
    const id = getParamValue(req.params.id);
    if (!id) {
      return sendResponse_default(res, {
        statusCode: 400,
        success: false,
        message: "Invalid issue id",
        data: null
      });
    }
    const user = req.user;
    if (!user) {
      return sendResponse_default(res, {
        statusCode: 401,
        success: false,
        message: "Unauthorized",
        data: null
      });
    }
    if (user.role !== "maintainer") {
      return sendResponse_default(res, {
        statusCode: 403,
        success: false,
        message: "Forbidden",
        data: null
      });
    }
    const deleted = await issueService.deleteIssueDB(id);
    if (!deleted) {
      return sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found",
        data: null
      });
    }
    return sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully",
      data: null
    });
  } catch (error) {
    return sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: "Failed to delete issue",
      data: null,
      error
    });
  }
};
var issueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue
};

// src/midleware/authMidleware.ts
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"));
var authMiddleware = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return sendResponse_default(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized",
          data: null
        });
      }
      const decoded = import_jsonwebtoken2.default.verify(
        token,
        config_default.jwtSecret
      );
      const userData = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [decoded.email]
      );
      const user = userData.rows[0];
      if (userData.rows.length === 0) {
        return sendResponse_default(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized",
          data: null
        });
      }
      if (roles.length && !roles.includes(user.role)) {
        return sendResponse_default(res, {
          statusCode: 403,
          success: false,
          message: "Forbidden"
        });
      }
      req.user = user;
      next();
    } catch (error) {
      return sendResponse_default(res, {
        statusCode: 401,
        success: false,
        message: "Invalid token",
        data: null
      });
    }
  };
};
var authMidleware_default = authMiddleware;

// src/module/Issue/issue.router.ts
var router2 = (0, import_express2.Router)();
router2.post("/", issueController.createIssue);
router2.get("/", issueController.getAllIssues);
router2.get("/:id", issueController.getSingleIssue);
router2.patch("/:id", authMidleware_default("maintainer"), issueController.updateIssue);
router2.delete(
  "/:id",
  authMidleware_default("maintainer"),
  issueController.deleteIssue
);
var issueRoute = router2;

// src/app.ts
var app = (0, import_express3.default)();
app.use(import_express3.default.json());
app.use(import_express3.default.text());
app.use(import_express3.default.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.send("TypeScript Backend Running");
});
app.use("/api/auth", authRoute);
app.use("/api/issues", issueRoute);
app.use(globalErrorHandler_default);
var app_default = app;

// src/server.ts
var main = () => {
  initDB();
  if (!process.env.VERCEL) {
    app_default.listen(config_default.port, () => {
      console.log(`Example app listening on port ${config_default.port}`);
    });
  }
};
main();
var server_default = app_default;
//# sourceMappingURL=server.js.map