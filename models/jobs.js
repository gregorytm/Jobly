"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const {
  sqlForPartialUpdate,
  createCompanyFilterSql,
  createJobsFilterSql,
} = require("../helpers/sql");

/** Related functions for jobs. */
class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, comanyHandle }
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * */

  static async create({ title, salary, equity, companyHandle }) {
    const result = await db.query(
      `INSERT INTO jobs
      (title, salary, equity, company_handle)
      VALUES ($1, $2, $3, $4)
      RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
      [title, salary, equity, companyHandle]
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs.
   *
   * Returns [{ id, title, salary, equity, companyHandle }, ...]
   * */

  static async findAll(filters) {
    const filterSql = createJobsFilterSql(filters);

    const jobsRes = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle" 
      FROM jobs
      ${filterSql.whereClause}
      ORDER BY title`,
      filterSql.values
    );
    return jobsRes.rows;
  }

  /** Given a job id, return data about job.
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {}

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity, companyHandle}
   *
   * Returns {id, title, salary, equity, companyHandle}
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {}

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(id) {}
}

module.exports = Job;
