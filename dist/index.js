"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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

// src/app.ts
var import_express4 = __toESM(require("express"));

// src/modules/signup/signup.route.ts
var import_express = require("express");

// src/db/index.ts
var import_pg = require("pg");

// src/config/index.ts
var import_dotenv = __toESM(require("dotenv"));
import_dotenv.default.config();
var config = {
  db_key: process.env.DB_KEY,
  port: process.env.PORT,
  secret_key: process.env.SECRET_KEY
};
var config_default = config;

// src/db/index.ts
var pool = new import_pg.Pool({
  connectionString: config_default.db_key
});
var initDB = async () => {
  try {
    await pool.query(
      `
      CREATE TABLE IF NOT EXISTS users(
          id SERIAL PRIMARY KEY,
          name VARCHAR(35) NOT NULL,
          email VARCHAR(35) UNIQUE NOT NULL ,
          password TEXT NOT NULL ,
          role VARCHAR(30) DEFAULT 'contributor', 

          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    ) 
          `
    );
    await pool.query(
      `
        CREATE TABLE IF NOT EXISTS issues(
        id SERIAL PRIMARY KEY ,
        title VARCHAR(150) UNIQUE NOT NULL,
        description TEXT NOT NULL CHECK (LENGTH(description) >= 20), 
        type VARCHAR(25)  NOT NULL CHECK (type IN('bug' , 'feature_request')),
        status VARCHAR(25) DEFAULT 'open' CHECK (status IN('open' , 'in_progress' , 'resolved')),
        reporter_id INT REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        `
    );
    console.log("Express server connected successful");
  } catch (error) {
    console.log(error);
  }
};

// src/modules/signup/signup.service.ts
var import_bcryptjs = __toESM(require("bcryptjs"));
var signupUserIntoDB = async (payload) => {
  const { name, email, password, role } = payload;
  const hashPassword = await import_bcryptjs.default.hash(password, 10);
  console.log(hashPassword);
  if (role) {
    const result = await pool.query(
      `
    INSERT INTO users (name,email,password,role)
    VALUES ($1,$2,$3,$4) RETURNING *
    `,
      [name, email, hashPassword, role]
    );
    delete result.rows[0].password;
    return result;
  } else {
    const result = await pool.query(
      `
    INSERT INTO users (name,email,password)
    VALUES ($1,$2,$3) RETURNING *
    `,
      [name, email, hashPassword]
    );
    delete result.rows[0].password;
    return result;
  }
};
var signupService = { signupUserIntoDB };

// src/modules/signup/signup.controller.ts
var signUpUser = async (req, res) => {
  try {
    const result = await signupService.signupUserIntoDB(req.body);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var signupController = {
  signUpUser
};

// src/modules/signup/signup.route.ts
var router = (0, import_express.Router)();
router.post("/signup", signupController.signUpUser);
var signupRoute = router;

// src/modules/login/login.route.ts
var import_express2 = require("express");

// src/modules/login/login.service.ts
var import_bcryptjs2 = __toESM(require("bcryptjs"));
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var loginUserIntoDB = async (payload) => {
  const { email, password } = payload;
  const userData = await pool.query(
    `
        SELECT * FROM users WHERE email=$1 
        `,
    [email]
  );
  const user = userData.rows[0];
  if (userData.rows.length === 0) {
    throw new Error("User not found");
  }
  const matchPassword = await import_bcryptjs2.default.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Invalid password");
  }
  const jwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role
  };
  const accessToken = import_jsonwebtoken.default.sign(jwtPayload, config_default.secret_key, {
    expiresIn: "1d"
  });
  return { accessToken, user };
};
var loginService = { loginUserIntoDB };

// src/modules/login/login.controller.ts
var loginUser = async (req, res) => {
  try {
    const result = await loginService.loginUserIntoDB(req.body);
    res.status(201).json({
      success: true,
      message: "Login successful",
      data: {
        token: result.accessToken,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          created_at: result.user.created_at,
          updated_at: result.user.updated_at
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var loginController = { loginUser };

// src/modules/login/login.route.ts
var router2 = (0, import_express2.Router)();
router2.post("/login", loginController.loginUser);
var loginRouter = router2;

// src/modules/issues/issues.route.ts
var import_express3 = require("express");

// src/modules/issues/issues.service.ts
var issuesCrateIntoDB = async (payload) => {
  console.log("payload", payload);
  const { title, description, type, reporter_id } = payload;
  const validTypes = ["bug", "feature_request"];
  if (!validTypes.includes(type)) {
    throw new Error("Invalid type. Only 'bug' or 'feature_request' allowed");
  }
  const result = await pool.query(
    `
    INSERT INTO issues(title, description, type, reporter_id ) VALUES ($1 , $2 , $3 , $4) RETURNING *
    `,
    [title, description, type, reporter_id]
  );
  return result;
};
var issuesAllFromDB = async (query) => {
  const { sort = "newest", type, status } = query;
  let sql = `SELECT * FROM issues`;
  const conditions = [];
  const values = [];
  if (type) {
    values.push(type);
    conditions.push(`type = $${values.length}`);
  }
  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }
  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(" AND ")}`;
  }
  if (sort === "oldest") {
    sql += ` ORDER BY created_at ASC`;
  } else {
    sql += ` ORDER BY created_at DESC`;
  }
  const result = await pool.query(sql, values);
  const issues = result.rows;
  const reporterIds = issues.map((issue) => issue.reporter_id);
  const usersResult = await pool.query(
    `
    SELECT id, name, role
    FROM users
    WHERE id = ANY($1)
    `,
    [reporterIds]
  );
  const users = usersResult.rows;
  const finalData = issues.map((issue) => {
    const reporter = users.find((user) => user.id === issue.reporter_id);
    return {
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,
      created_at: issue.created_at,
      updated_at: issue.updated_at,
      reporter
    };
  });
  return finalData;
};
var issuesIdGet = async (id) => {
  const issueData = await pool.query(
    `
    SELECT * FROM issues WHERE id=$1
    `,
    [id]
  );
  console.log(issueData);
  const issue = issueData.rows[0];
  const result = await pool.query(
    `
      SELECT role, name, id FROM users WHERE id=$1
      `,
    [issue.reporter_id]
  );
  const reporter = result.rows[0];
  const finalData = {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter,
    created_at: issue.created_at,
    updated_at: issue.updated_at
  };
  return finalData;
};
var issuesUpdateFromDB = async (payload, id, user) => {
  const { title, description, type, status } = payload;
  const validTypes = ["bug", "feature_request"];
  if (type && !validTypes.includes(type)) {
    throw new Error("Only bug or feature_request allowed");
  }
  const issueData = await pool.query(
    `
    SELECT * FROM issues WHERE id=$1
    `,
    [Number(id)]
  );
  console.log("rows:", issueData.rows);
  console.log("id", typeof id);
  const issue = issueData.rows[0];
  if (!issue) {
    throw new Error("Issue not found");
  }
  if (user?.role === "contributor" && issue.reporter_id !== user.id) {
    throw new Error("You can update only your own issue");
  }
  if (user?.role === "contributor" && issue.status !== "open") {
    throw new Error("You cannot update resolved/in_progress issues");
  }
  if (user.role === "maintainer") {
    const result = await pool.query(
      `
      UPDATE issues SET title=COALESCE($1 , title) , description=COALESCE($2 , description), type=COALESCE($3 , type) , status=COALESCE($4 , status)   WHERE id=$5
      RETURNING *
    `,
      [title, description, type, status, Number(id)]
    );
    console.log(result.rows[0]);
    if (result.rows.length === 0) {
      throw new Error("Invalid id");
    }
    return result;
  } else {
    const result = await pool.query(
      `
      UPDATE issues SET title=COALESCE($1 , title) , status='in_progress', description=COALESCE($2 , description), type=COALESCE($3 , type)   WHERE id=$4
      RETURNING *
    `,
      [title, description, type, id]
    );
    console.log(result.rows[0]);
    if (result.rows.length === 0) {
      throw new Error("Invalid id");
    }
    return result;
  }
};
var deleteIssueFromDB = async (id) => {
  const result = await pool.query(
    `  
    DELETE FROM issues
    WHERE id = $1 RETURNING *
`,
    [id]
  );
  console.log(result.rows[0]);
  if (result.rows.length === 0) {
    throw new Error("Issue not found");
  }
  return result;
};
var issuesService = {
  issuesCrateIntoDB,
  issuesAllFromDB,
  issuesIdGet,
  issuesUpdateFromDB,
  deleteIssueFromDB
};

// src/modules/issues/issues.controller.ts
var issuesUerCreate = async (req, res) => {
  console.log(req.user);
  try {
    const reporter_id = req.user?.id;
    const payload = {
      ...req.body,
      reporter_id
      // status: "open",
    };
    const result = await issuesService.issuesCrateIntoDB(payload);
    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var issueAllUser = async (req, res) => {
  try {
    const result = await issuesService.issuesAllFromDB(req.query);
    res.status(200).json({
      success: true,
      message: "Issues retrieved successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var singleIssues = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issuesService.issuesIdGet(id);
    res.status(200).json({
      success: true,
      message: "Issue retrieved successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var updateIssues = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issuesService.issuesUpdateFromDB(
      req.body,
      id,
      req.user
    );
    res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var deleteIssues = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await issuesService.deleteIssueFromDB(id);
    res.status(200).json({
      success: true,
      message: "Issue deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var issuesController = {
  issuesUerCreate,
  issueAllUser,
  singleIssues,
  updateIssues,
  deleteIssues
};

// src/middleware/auth.ts
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"));
var auth = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        res.status(401).json({
          success: false,
          message: "Unauthorized message"
        });
      }
      const decoded = import_jsonwebtoken2.default.verify(
        token,
        config_default.secret_key
      );
      const userData = await pool.query(
        `
    SELECT * FROM users WHERE id=$1
    `,
        [decoded.id]
      );
      const user = userData.rows[0];
      if (userData.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden access"
        });
      }
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: "Unauthorized message",
        error: error.message
      });
    }
  };
};
var auth_default = auth;

// src/modules/issues/issues.route.ts
var router3 = (0, import_express3.Router)();
router3.post(
  "/",
  auth_default("contributor", "maintainer"),
  issuesController.issuesUerCreate
);
router3.get("/", issuesController.issueAllUser);
router3.get("/:id", issuesController.singleIssues);
router3.patch(
  "/:id",
  auth_default("contributor", "maintainer"),
  issuesController.updateIssues
);
router3.delete("/:id", auth_default("maintainer"), issuesController.deleteIssues);
var issuesRouter = router3;

// src/middleware/logger.ts
var import_fs = __toESM(require("fs"));
var logger = (req, res, next) => {
  const log = `([${(/* @__PURE__ */ new Date()).toLocaleString()}], ${req.method}, ${req.url} )`;
  import_fs.default.appendFile("logger.txt", log, (error) => {
  });
  next();
};
var logger_default = logger;

// src/app.ts
var import_cors = __toESM(require("cors"));
var app = (0, import_express4.default)();
var corsOptions = {
  origin: "http://localhost:3000"
};
app.use((0, import_cors.default)(corsOptions));
app.use(import_express4.default.json());
app.use(import_express4.default.text());
app.use(import_express4.default.urlencoded({ extended: true }));
app.use(logger_default);
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Express server"
  });
});
app.use("/api/auth", signupRoute);
app.use("/api/auth", loginRouter);
app.use("/api/issues", issuesRouter);
var app_default = app;

// src/index.ts
var main = () => {
  initDB();
  app_default.listen(config_default.port, () => {
    console.log(`Example app listening on port ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=index.js.map