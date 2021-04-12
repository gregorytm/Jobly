const Job = require("./jobs");

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
        companyhandle: "c1",
        equity: "0.01",
        id: expect.any(Number),
        salary: 12,
        title: "job1",
      },
      {
        companyhandle: "c1",
        equity: null,
        id: expect.any(Number),
        salary: 200000,
        title: "job2",
      },
      {
        companyhandle: "c2",
        equity: "0.02",
        id: expect.any(Number),
        salary: 35,
        title: "job3",
      },
    ]);
  });
});

describe("Create Job", function () {
  test("create job and return created job", async function () {
    const job = await Job.create({
      title: "accountant",
      salary: 80000,
      equity: 0.2,
      companyHandle: "c1",
    });
    expect(job).toEqual({
      companyhandle: "c1",
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
