const db = require("../db.js");
const Job = require("./jobs");
const { BadRequestError, NotFoundError } = require("../expressError");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("Find all", function () {
  test("returns job records", async function () {
    const results = await Job.findAll();
    expect(results).toEqual([
      {
        companyHandle: "c1",
        equity: "0.01",
        id: expect.any(Number),
        salary: 12,
        title: "job1",
      },
      {
        companyHandle: "c1",
        equity: null,
        id: expect.any(Number),
        salary: 200000,
        title: "job2",
      },
      {
        companyHandle: "c2",
        equity: "0.02",
        id: expect.any(Number),
        salary: 35,
        title: "job3",
      },
    ]);
  });
});

/***************************************** post */
describe("Create Job", function () {
  test("create job and return created job", async function () {
    const job = await Job.create({
      title: "accountant",
      salary: 80000,
      equity: 0.2,
      companyHandle: "c1",
    });
    expect(job).toEqual({
      companyHandle: "c1",
      equity: "0.2",
      id: expect.any(Number),
      salary: 80000,
      title: "accountant",
    });
    const result = await Job.findAll();
    const jobFromDb = result.find((j) => j.id === job.id);
    if (jobFromDb === undefined) {
      throw new Error("job not found in database");
    }
  });
});

/******************************************* get */
describe("get", function () {
  test("works", async function () {
    const jobs = await Job.findAll();
    const actualJobId = jobs[0].id;
    const job = await Job.get(actualJobId);
    expect(job).toEqual({
      companyHandle: "c1",
      equity: "0.01",
      id: actualJobId,
      salary: 12,
      title: "job1",
    });
  });

  test("wrong id gives error", async function () {
    expect.assertions(2);
    try {
      const jobId = await Job.get(1);
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
      expect(err).toHaveProperty("message", "No job with id: 1");
    }
  });
});

/******************************************** update */
describe("update a job", function () {
  const updateData = {
    title: "new",
    salary: 100_000,
    equity: 0.2,
    companyHandle: "c1",
  };
  test("works: update an existing job", async function () {
    const jobs = await Job.findAll();
    const actualJobId = jobs[0].id;

    const updatedJob = await Job.update(actualJobId, updateData);
    expect(updatedJob).toEqual({ ...updateData, equity: "0.2" });

    const result = await db.query(
      `SELECT title, salary, equity, company_handle AS "companyHandle"
    FROM jobs WHERE id = ${actualJobId}`
    );
    expect(result.rows).toEqual([
      {
        title: "new",
        salary: 100_000,
        equity: "0.2",
        companyHandle: "c1",
      },
    ]);
  });
});

describe("remove", function () {
  test("works", async function () {
    const jobs = await Job.findAll();
    const actualJobId = jobs[0].id;
    await Job.remove(actualJobId);
    const res = await db.query(`SELECT id FROM jobs WHERE id = ${actualJobId}`);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(12);
      fail();
    } catch (err) {
      expect(err).toMatchInlineSnapshot(`[Error: No job: 12]`);
      expect(err).toBeInstanceOf(NotFoundError);
    }
  });
});
