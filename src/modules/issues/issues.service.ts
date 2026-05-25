import { pool } from "../../db";

const issuesCrateIntoDB = async (payload: any) => {
  const { title, description, type, status, reporter_id } = payload;
  const validTypes = ["bug", "feature_request"];
  // status validation
  // const validStatus = ["open", "in_progress", "resolved"];

  //   console.log(title, description, type, status, reporter_id);
  const user = await pool.query(
    `
    SELECT * FROM users WHERE id=$1
    `,
    [reporter_id],
  );
  console.log(user);
  if (user.rows.length === 0) {
    throw new Error("User not exits");
  }

  if (status) {
    const result = await pool.query(
      `
    INSERT INTO issues(title, description, type, status, reporter_id ) VALUES ($1 , $2 , $3 ,COALESCE($4), $5) RETURNING *
    `,
      [title, description, type, status, reporter_id],
    );
    console.log(result);
    if (!validTypes.includes(result.rows[0].type)) {
      throw new Error("Invalid type. Only 'bug' or 'feature_request' allowed");
    }
    // if (!validStatus.includes(result.rows[0].status)) {
    //   throw new Error(
    //     "Invalid status. Only 'open', 'in_progress', or 'resolved' allowed",
    //   );
    // }

    return result;
  } else {
    const result = await pool.query(
      `
    INSERT INTO issues(title, description, type, reporter_id ) VALUES ($1 , $2 , $3 , $4) RETURNING *
    `,
      [title, description, type, reporter_id],
    );
    if (!validTypes.includes(result.rows[0].type)) {
      throw new Error("Invalid type. Only 'bug' or 'feature_request' allowed");
    }

    return result;
  }
};
// get all issues
// const issuesAllFromDB = async (query: any) => {
//   const { sort, type, status } = query;

//   let result = `
//     SELECT * FROM issues
//   `;

//   // type + status filter
//   if (type && status) {
//     result += ` WHERE type='${type}' AND status='${status}'`;
//   }

//   // only type
//   else if (type) {
//     result += ` WHERE type='${type}'`;
//   }

//   // only status
//   else if (status) {
//     result += ` WHERE status='${status}'`;
//   }

//   // sorting
//   if (sort === "oldest") {
//     result += ` ORDER BY created_at ASC`;
//   } else {
//     result += ` ORDER BY created_at DESC`;
//   }

//   const issuesResult = await pool.query(result);

//   const issues = issuesResult.rows;

//   // reporter ids
//   const reporterIds = issues.map((issue) => issue.reporter_id);

//   // users query
//   const usersResult = await pool.query(
//     `
//     SELECT id, name, role
//     FROM users
//     WHERE id = ANY($1)
//     `,
//     [reporterIds],
//   );

//   const users = usersResult.rows;

//   // reporter attach
//   const finalData = issues.map((issue) => {
//     const reporter = users.find((user) => user.id === issue.reporter_id);

//     return {
//       ...issue,
//       reporter,
//     };
//   });

//   return finalData;
// };
const issuesAllFromDB = async (query: any) => {
  const { sort = "newest", type, status } = query;

  let sql = `SELECT * FROM issues`;

  const conditions = [];
  const values = [];

  // type filter
  if (type) {
    values.push(type);
    conditions.push(`type = $${values.length}`);
  }

  // status filter
  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  // where
  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(" AND ")}`;
  }

  // sorting
  if (sort === "oldest") {
    sql += ` ORDER BY created_at ASC`;
  } else {
    sql += ` ORDER BY created_at DESC`;
  }

  // issues
  const result = await pool.query(sql, values);

  const issues = result.rows;

  // reporter ids
  const reporterIds = issues.map((issue) => issue.reporter_id);

  // users
  const usersResult = await pool.query(
    `
    SELECT id, name, role
    FROM users
    WHERE id = ANY($1)
    `,
    [reporterIds],
  );

  const users = usersResult.rows;

  // final response
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
      reporter,
    };
  });

  return finalData;
};
// get single issues
const issuesIdGet = async (id: string) => {
  const issueData = await pool.query(
    `
    SELECT * FROM issues WHERE id=$1
    `,
    [id],
  );
  console.log(issueData);
  // reporter_id
  const issue = issueData.rows[0];
  const result = await pool.query(
    `
      SELECT role, name, id FROM users WHERE id=$1
      `,
    [issue.reporter_id],
  );
  const reporter = result.rows[0];
  // console.log("reporter", reporter);

  // final data
  const finalData = {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  };
  return finalData;
};
// update
const issuesUpdateFromDB = async (payload: any, id: string, user: any) => {
  const { title, description, type, status } = payload;

  const issueData = await pool.query(
    `
    SELECT * FROM issues WHERE id=$1
    `,
    [id],
  );
  console.log(issueData);
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
  const result = await pool.query(
    `
      UPDATE issues SET title=COALESCE($1 , title) , description=COALESCE($2 , description), type=COALESCE($3 , type)   WHERE id=$4
      RETURNING *
    `,
    [title, description, type, id],
  );
  console.log(result.rows[0]);
  if (result.rows.length === 0) {
    throw new Error("Invalid id");
  }
  return result;
};
export const issuesService = {
  issuesCrateIntoDB,
  issuesAllFromDB,
  issuesIdGet,
  issuesUpdateFromDB,
};
