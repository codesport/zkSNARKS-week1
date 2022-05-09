/**
 * Test if the circuit output is correct
 * @link https://gist.github.com/socathie/b9cadb33a0a9efe4131663f2bcf69637
 */

const chai = require("chai");
const path = require("path");

const wasm_tester = require("circom_tester").wasm;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

const assert = chai.assert;

describe("System of equations test", function () {
    this.timeout(100000000);

    it("SystemOfEquations: Test if the circuit output is correct", async () => {
        const circuit = await wasm_tester("contracts/bonus/SystemOfEquations.circom");
        await circuit.loadConstraints();

        const INPUT = {
            "x": ["15","17","19"],
            "A": [["1","1","1"],["1","2","3"],["2",Fr.e(-1),"1"]],
            "b": ["51", "106", "32"]
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        console.log(witness);

        /**
         * witness[0] here corresponds to the output from verifyProof - it will always be true (no matter what your circuit does)
         *   because the proof is a real proof that went through the circuit, unless your parameters are generated outside of the circuit
         * 0th element in the witness is the boolen of whether the proof is true or not
         * 
         * witness[1] here is the output signal, and this is also the four parameter Input passed into verifyProof, this is the one
         *  that will be 0 or 1, i.e. your out signal 
         * 
         * witness comes from the wasm file
         *
         */

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]),Fr.e(1)));
    });
});