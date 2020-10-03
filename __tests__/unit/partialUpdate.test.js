
const sqlForPartialUpdate = require("../../helpers/partialUpdate");

describe("partialUpdate()", () => {
  it("should generate a proper partial update query with just 1 field",
    function () {
      const result = sqlForPartialUpdate("companies", {name : "test"}, "handle", "company1");

      expect(result.query).toEqual(
        "UPDATE companies SET name=$1 WHERE handle=$2 RETURNING *"
      );
      // FIXME: write real tests!
      expect(result.values).toEqual(["test", "company1"]);
  });
});
