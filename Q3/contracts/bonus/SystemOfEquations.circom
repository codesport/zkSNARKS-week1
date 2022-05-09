pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";

// matrix multiplication
include "../../node_modules/circomlib-matrix/circuits/matMul.circom"; // hint: you can use more than one templates in circomlib-matrix to help you


// // matrix multiplication
// template matMul (m,n,p) {
//     signal input a[m][n];
//     signal input b[n][p];
//     signal output out[m][p];

//     component matElemMulComp[m][p];
//     component matElemSumComp[m][p];
    
//     for (var i=0; i < m; i++) {
//         for (var j=0; j < p; j++) {
//             ...


template SystemOfEquations(n) { // n is the number of variables in the system of equations
    signal input x[n]; // this is the solution to the system of equations
    signal input A[n][n]; // this is the coefficient matrix
    signal input b[n]; // this are the constants in the system of equations
    signal output out; // 1 for correct solution, 0 for incorrect solution

//implement a general circuit that verifies an input x solves the system of equations Ax=b, where A and b are also signal inputs.

//test to check for the circuit output is correct vs testing if the proof is a valid proof or not

//n=3


// x[3] = solution[3] = ["15","17","19"],
// A[3][3]= coefficiencts[3][3] = [["1","1","1"],["1","2","3"],["2",Fr.e(-1),"1"]],
// b[3]= constants[3] = ["51", "106", "32"]

// x + y + z = 51
// x + 2y + 3z = 106
// 2x - y + z = 32


    // [bonus] insert your code here
    component matrix_mult = matMul(n, n, 1);


    //step 1: Ax=b coefficenct[i][j] * variable[i][j] = constant[n]
    for (var i = 0; i < n; i++) {

        for (var j = 0; j < n; j++) {

            matrix_mult.a[i][j] <== A[i][j];//assign coeff

        }

       matrix_mult.b[i][0] <== x[i]; //now assign constant

    }
    
    //step 2: 



}

component main {public [A, b]} = SystemOfEquations(3);