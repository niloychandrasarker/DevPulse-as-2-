import { pool } from "../../db";
import type { IIssueCreate } from "./issue.interface";

const createIssueDB = async (payload: IIssueCreate) => {
  const { title, description, type } = payload;
  const result = await pool.query(
    `INSERT INTO issues (title, description, type)
		 VALUES ($1, $2, $3)
		 RETURNING *`,
    [title, description, type],
  );

  return result.rows[0];
};

const getAllIssuesDB = async (sort?: string) => {
  const sortSql = sort === "oldest" ? "ASC" : "DESC";
  const result = await pool.query(
    `SELECT * FROM issues ORDER BY created_at ${sortSql}`,
  );

  return result.rows;
};

const getSingleIssueDB = async (id: string) => {
  const result = await pool.query(`SELECT * FROM issues WHERE id = $1`, [id]);
  return result.rows[0] || null;
};

const updateIssueDB = async (id: string, payload: Partial<IIssueCreate>) => {
  const { title, description, type } = payload;
  const result = await pool.query(
    `UPDATE issues
     SET title = COALESCE($1, title),
         description = COALESCE($2, description),
         type = COALESCE($3, type)
     WHERE id = $4
     RETURNING *`,
    [title, description, type, id],
  );

  return result.rows[0] || null;
};

const deleteIssueDB = async (id: string) => {
  const result = await pool.query(`DELETE FROM issues WHERE id = $1`, [id]);
  return result.rowCount || 0;
};

export const issueService = {
  createIssueDB,
  getAllIssuesDB,
  getSingleIssueDB,
  updateIssueDB,
  deleteIssueDB,
};
