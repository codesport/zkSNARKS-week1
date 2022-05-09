const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
//const { groth16 } = require("snarkjs");

const snarkjs = require("snarkjs");

function unstringifyBigInts(o) {
    if ((typeof(o) == "string") && (/^[0-9]+$/.test(o) ))  { //if 'o' is a string and begins and ends with a number return as BigInt()
        return BigInt(o);
    } else if ((typeof(o) == "string") && (/^0x[0-9a-fA-F]+$/.test(o) ))  {//if 'o' is a string is hex (i.e., ^0x[0-9a-fA-F]+$), return as BigInt()
        return BigInt(o);
    } else if (Array.isArray(o)) { //if 'o' is array, recursively run this function for each element and return the BigInt()
        return o.map(unstringifyBigInts);
    } else if (typeof o == "object") { //if 'o' is json object, recursively run this function for each `key-value` and return the BigInt()
        if (o===null) return null;
        const res = {};
        const keys = Object.keys(o);
        keys.forEach( (k) => {
            res[k] = unstringifyBigInts(o[k]);
        });
        return res;
    } else {
        return o;
    }
}

describe("HelloWorld", function () {

    //define global variables. these will be modified during the tests
    let Verifier;
    let verifier;

    beforeEach(async function () {

        //connect and attach to to the solidity file with contract name (not file name) HelloWorldVerifier. This is my factory
        Verifier = await ethers.getContractFactory("HelloWorldVerifier");

        //deploy contract
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] Add comments to explain what each line is doing
 
        /**
         *  Multiplier inputs a,b
         * 
         * RHS: Sends args of input, wasmFile, zkeyFileName to groth16_fullprove.js which is exported by groth16.js.
         *      NB: fullProve is defined in groth16.js line 20: 
         *          @see https://github.com/iden3/snarkjs/blob/a483c5d3b089659964e10531c4f2e22648cf5678/src/groth16.js#L20
         *      which comes from groth16_fullprove.js:
         *         @see  https://github.com/iden3/snarkjs/blob/a483c5d3b089659964e10531c4f2e22648cf5678/src/groth16_fullprove.js
         *      Returns the object {proof, publicSignals} via
         *          @see https://github.com/iden3/snarkjs/blob/a483c5d3b089659964e10531c4f2e22648cf5678/src/groth16_prove.js#L143
         * 
         * LHS: object deconstruction: from groth16_prove.js#L143
         */
        const { proof, publicSignals } = await snarkjs.groth16.fullProve({"a":"1","b":"2"}, "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm","contracts/circuits/HelloWorld/circuit_final.zkey");


        /**
         * output value of element at index 0 of publicSignals[] output which was passed into stringifyBigInts()
         * @see https://github.com/iden3/snarkjs/blob/a483c5d3b089659964e10531c4f2e22648cf5678/src/groth16_prove.js#L141
         * 
         * our private inputs are a = 1 and b = 2
         * our public output is 1*2 = 2
         */
  
        console.log('1x2 =',publicSignals[0]);


        //converts public signal back to BigInt
        const editedPublicSignals = unstringifyBigInts(publicSignals);

        //converts proof signal back to BigInt
        const editedProof = unstringifyBigInts(proof);

        //send proof and public signal numbers to groth16_exportsoliditycalldata.js for processing
        const calldata = await snarkjs.groth16.exportSolidityCallData(editedProof, editedPublicSignals);
    
         //console.log(calldata)
        /**
         * 1. calldata is an array of hex values. element 2 is an "array of arrays"
         * 2. The RegEx removes the " and [ and ] and white space after the commas. The commas are left in.
         * 3a. The result is no longer an array (nor nested arrays) so we use split to tell map to digest each item 
         *     by the comma seperator
         * 3b. str.split() method is used to split a string into array of strings by separating it into substrings
         *     using a specified separator provided
         *     @see https://www.google.com/search?q=hat%20does%20javascript%20split(%22,%22)%20do?
         * 4a. Map cycles through each hex element and converts it to BigInt and then forces it to a string
         * 4b. NB: BigInt() allows JS to handle integers larger than 2^53 -1 
         * 5. argv is an 9 element array of 
         *      (a) 8 BigInts represented as strings (i.e., 8 "proof fields")
         *      (b) the result of the public signal (i.e., public inputs which is 1*2 = 2) is stored at index 8 (i.e., argv[8] = 2)
         * 
         *     @see https://discord.com/channels/942318442340560917/972179931784155198/972185761787052093
         * 
         */

        // console.log(calldata.replace(/["[\]\s]/g, "")) //comma separated sequence of hex
        
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString()); //array of  strings with BigInts
        // console.log(argv )
    


        /**
         * abc for verifier inputs are distinct from the above multiplier inputes.:
         * 
         * 1. Generating proofs with snarkjs requires 8 "proof fields" and then any public inputs 
         * 2. Send them as parameters to the verifyProof method in your smart contract. This method checks if the proof is valid
         * 3. a,b,c are always arranged  [ [2], [ [2],[2] ], [2] ] 8 total fields - that doesn't change per circuit type
         *     this array structure corresponds to the calldata's "native" format
         * 4. 'const Input' is our contraint. It is the amalgamation of the public inputs and all the public outputs
         * 
         * The above bullets were paraphrased from:
         * @link https://discord.com/channels/942318442340560917/969554923396153345/970833603565084703
         */
        const a = [argv[0], argv[1]]; // "a" is a 2 element array of strings of BigInts
        // console.log(a[0] )

        const b = [[argv[2], argv[3]], [argv[4], argv[5]]]; // "b" is a 4 element array of strings of BigInts
        const c = [argv[6], argv[7]]; // "c" is a 2 element array of strings of BigInts

        //console.log( argv[8] ) // returns an integer of 2 
        const Input = argv.slice(8); //returns an array with the contents of index 8 (element 9). Specifically: ['2']

        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with Groth16", function () {
    let factory
    let contract_verifier

    beforeEach(async function () {
        factory = await ethers.getContractFactory("Multiplier3Verifier");
        contract_verifier = await factory.deploy();
        await contract_verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here

        const { proof, publicSignals } = await snarkjs.groth16.fullProve({"a":"1","b":"2","c":"3"
        }, "contracts/circuits/Multiplier3/Multiplier3_js/Multiplier3.wasm","contracts/circuits/Multiplier3/circuit_final.zkey");
        
        console.log('1*2*3 =', publicSignals[0]);

        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const editedProof = unstringifyBigInts(proof);

        const calldata = await snarkjs.groth16.exportSolidityCallData(editedProof, editedPublicSignals);
        //console.log( calldata);

        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
        //console.log( argv );

        const a = [argv[0], argv[1]]; 
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]]; 
        const c = [argv[6], argv[7]];

        const Input = argv.slice(8); 

        expect(await contract_verifier.verifyProof(a, b, c, Input)).to.be.true;     

    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here

        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await contract_verifier.verifyProof(a, b, c, d)).to.be.false;        
    });
});


describe("Multiplier3 with PLONK", function () {

    let factory
    let contract

    //source: https://stackoverflow.com/a/41643153/946957
    const bigIntToBytes = (string) =>{

        bytes = string.match(/../g).map(function (a) {
            let i = parseInt(a, 16)
            return i >> 7 ? i - (1 << 8) : i;
        });

        return bytes

    }
       // _proof =  ethers.utils.toUtf8Bytes(_proof)
       // _proof = bigIntToBytes(_proof)

    beforeEach(async function () {
        factory = await ethers.getContractFactory("PlonkVerifier");
        contract = await factory.deploy();
        await contract.deployed();
    });

    it("Should return true for correct proof", async function () {
        const { proof, publicSignals } = await snarkjs.plonk.fullProve({"a":"1","b":"2","c":"3"
        }, "contracts/circuits/Multiplier3_plonk/Multiplier3_js/Multiplier3.wasm","contracts/circuits/Multiplier3_plonk/circuit_final.zkey");

        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const editedProof = unstringifyBigInts(proof);

        console.log('1*2*3 =', publicSignals[0]);

        const calldata = await snarkjs.plonk.exportSolidityCallData(editedProof, editedPublicSignals);
        // console.log( calldata );  //plonk calldata is a 1 BIG hex number (proof) and an array  (output signal)         
        const argv = calldata.replace(/["[\]\s]/g, "").split(',')
        // console.log( argv );  //this is a 2 element array 

        const _proof = argv[0]  //extremely big int argv[0] 
        const publicSignal = [ argv[1] ] //argv.slice(1); //needs to be an array

       // console.log( _proof)
        // console.log( publicSignal)

        /**
         * 1. @see Multiplier3Verifier_plonk.sol -> contract PlonkVerifier -> function verifyProof
         * 2. function verifyProof(bytes memory proof, uint[] memory pubSignals) public view returns (bool) {..}
         * 3. expects the proof in bytes type and publicSignal to be an array of integers (uint256[])
         * 
         * @see https://github.com/zku-cohort-3/zkPuzzles/blob/fa89bf49ae4a8ffe57a05b3df2137ac65d01abe2/test/verifier.js
         */
 
        expect(  await contract.verifyProof(_proof, publicSignal)  ).to.be.true;
    
    });
    
    it("Should return false for invalid proof", async function () {

        const _proof = '0x0000000000000000000000000000000000000000000000000000000000000006';
        const publicSignal = ['15'];
        expect(  await contract.verifyProof(_proof, publicSignal)  ).to.be.false;

        console.log('completed PLONK test for falsey')

    });
});