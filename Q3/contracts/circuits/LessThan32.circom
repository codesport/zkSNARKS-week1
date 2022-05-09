pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";
// include "../../node_modules/circomlib/circuits/bitify.circom";
// include "../../node_modules/circomlib/circuits/binsum.circom";


// // n is the number of bits the input  have.
// template LessThan(n) {
//     assert(n <= 252);
//     signal input in[2];
//     signal output out;

//     component n2b = Num2Bits(n+1);

//     n2b.in <== in[0]+ (1<<n) - in[1];

//     out <== 1-n2b.out[n];
// }

// template LessThan10() {
//     signal input in;
//     signal output out;

//     component lt = LessThan(32); 

//     lt.in[0] <== in;
//     lt.in[1] <== 10;

//     out <== lt.out;
// }

component main = LessThan(32);