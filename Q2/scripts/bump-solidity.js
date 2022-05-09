const fs = require("fs");
const solidityRegex = /pragma solidity \^\d+\.\d+\.\d+/

const verifierRegex = /contract Verifier/

let content = fs.readFileSync("./contracts/HelloWorldVerifier.sol", { encoding: 'utf-8' });
let bumped = content.replace(solidityRegex, 'pragma solidity ^0.8.0');
bumped = bumped.replace(verifierRegex, 'contract HelloWorldVerifier');

fs.writeFileSync("./contracts/HelloWorldVerifier.sol", bumped);

// [assignment] add your own scripts below to modify the other verifier contracts you will build during the assignment


//groth16
content = fs.readFileSync("./contracts/Multiplier3Verifier.sol", { encoding: 'utf-8' });
bumped = content.replace(solidityRegex, 'pragma solidity ^0.8.0');
bumped = bumped.replace(verifierRegex, 'contract Multiplier3Verifier');

fs.writeFileSync("./contracts/Multiplier3Verifier.sol", bumped);

//PLONK @see https://github.com/socathie/zkPuzzles/blob/master/scripts/bump-solidity.js
content = fs.readFileSync("./contracts/Multiplier3Verifier_plonk.sol", { encoding: 'utf-8' });
bumped = content.replace(solidityRegex, 'pragma solidity ^0.8.0');

fs.writeFileSync("./contracts/Multiplier3Verifier_plonk.sol", bumped);