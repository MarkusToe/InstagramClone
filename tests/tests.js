/**
 * Created by markustorok on 02/07/14.
 */

var assert = require('assert');
var expect = require("chai").expect;

describe("Test Framework", function () {
    it("should have mocha installed and running.", function () {
        assert.equal(true, true);
    })
    it("should have chai installed and running.", function () {
        expect(true).to.be.true;
    })
})