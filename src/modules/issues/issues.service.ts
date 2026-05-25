import { pool } from "../../db";

const issuesCrateIntoDB = async (payload: any) => {
  const { title, description, type, status, reporter_id } = payload;
  //   console.log(title, description, type, status, reporter_id);
  const user = await pool.query(
    `
    SELECT * FROM users WHERE id=$1
    `,
    [reporter_id],
  );
  // console.log(user);
  if (user.rows.length === 0) {
    throw new Error("User not exits");
  }
  const result = await pool.query(
    `
    INSERT INTO issues(title, description, type, status, reporter_id ) VALUES ($1 , $2 , $3 ,$4, $5) RETURNING *
    `,
    [title, description, type, status, reporter_id],
  );
  // console.log(result);
  return result;
};

export const issuesService = { issuesCrateIntoDB };
