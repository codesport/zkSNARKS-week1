pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";

// n is the number of bits for the input
// template LessThan(n) {
//     assert(n <= 252);
//     signal input in[2]; // takes an input and an arbitrary upper bound to TEST
//     signal output out;

//     component n2b = Num2Bits(n+1);

//     n2b.in <== in[0]+ (1<<n) - in[1];

//     out <== 1-n2b.out[n];
// }



// template LessEqThan(n) {
//     signal input in[2];
//     signal output out;

//     component lt = LessThan(n);

//     lt.in[0] <== in[0];
//     lt.in[1] <== in[1]+1;
//     lt.out ==> out;
// }


// template GreaterThan(n) {
//     signal input in[2]; // takes an input and an arbitrary upper bound
//     signal output out;

//     component lt = LessThan(n);

//     lt.in[0] <== in[1];
//     lt.in[1] <== in[0];
//     lt.out ==> out;
// }



template RangeProof(n) {
    assert(n <= 252);
    signal input in; // this is the number to be proved inside the range
    signal input range[2]; // the two elements should be the range, i.e. [lower bound, upper bound]
    signal output out;

    component lte = LessEqThan(n);
    component gte = GreaterEqThan(n);

    // [assignment] create a template (not circuit, so don’t add component main = ...)
    // that uses GreaterEqThan and LessEqThan to perform a range proof
    // range[0] GTE<=  in  LTE<= range[1]
    //

    //Upper Bound:  in <=  range[0]
    lte.in[0] <== in;        // input1 is called "in": assign and constrain an input at index-0
    lte.in[1] <== range[1];  // input2 is a 2d array called "range": assign and constrain the input at index-1 to an arbitrary GTE upper bound which is at range index 1

    //Lower Bound:  in >= 
    gte.in[0] <== in;
    gte.in[1] <== range[0]; // assign and constrain to an arbitrary LTE lower bound which is at range index 0


    //compound (dual contraint on output)

    out <== gte.out * lte.out; //1*1 = true 
}