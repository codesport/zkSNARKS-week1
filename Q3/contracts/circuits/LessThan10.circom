pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";


// n is the number of bits for the input
// template LessThan(n) {
//     assert(n <= 252);
//     signal input in[2];  //in[0] = input and  in[1] = arbitrary upper bound
//     signal output out;

//     component n2b = Num2Bits(n+1);

// Left shift bitwise operator: <<
// take binary number one 0b001 and bit
// shift left n times, so eg. 0b001<<2would be 0b100. Looks
// like a trick to set most significant bit (which tells
// you if number is positive or negative).
// https://discord.com/channels/942318442340560917/970695687400464394/971767421897682964 

//     n2b.in <== in[0]+ (1<<n) - in[1]; // subract bit repreentations of in[0, 1]

//     out <== 1-n2b.out[n];
// }


template LessThan10() {
    signal input in;  //num to test
    signal output out; //true is less than 10 || false if greate than 10

    component lt = LessThan(32); //inhereit and intantiate the LessThan() template with 32bit number

    lt.in[0] <== in; //input
    lt.in[1] <== 10; //arbitrary upper bound

    out <== lt.out;
}

component main = LessThan10();