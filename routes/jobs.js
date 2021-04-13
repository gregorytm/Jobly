"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureLoggedIn, isAdmin } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const Job = require("../models/jobs");
const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/JobUpdate.json");

const router = express.Router();

/** GET / => { jobs: [ { id, title, salary, equity, companyHandle }, ... ] }
 *
 * Returns list of all jobs.
 *
 **/

router.get("/", async function (req, res, next) {
  try {
    if (req.query.minSalary !== undefined) {
      req.query.minSalary = Number.parseFloat(req.query.minSalary);
    }

    switch (req.query.hasEquity) {
      case undefined:
        break;
      case "true":
        req.query.hasEquity = true;
        break;
      case "false":
        req.query.hasEquity = false;
        break;
      default:
        throw new BadRequestError("hasEquity must be true or false");
    }
    const jobs = await Job.findAll(req.query);
    return res.json({ jobs });
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /:companyHandle => {title, salary, equity, commpanyHandle, id}
 *
 * creates a new job for the given company and returns new job
 *
 */

router.post("/:companyHandle", isAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    const job = await Job.create({
      ...req.body,
      companyHandle: req.params.companyHandle,
    });

    return res.status(201).json({ job });
  } catch (error) {
    return next(error);
  }
});

/**PATCH /:companyHandle  => {title, salary, equity, companyHandle
 *
 * edit a exiting post in the db
 *
 */

router.patch("/:companyHandle", isAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.update(req.params.handle, req.body);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
