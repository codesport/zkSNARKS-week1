#!/bin/bash

# [assignment] create your own bash script to compile Multipler3.circom modeling after compile-HelloWorld.sh below


cd contracts/circuits

mkdir LessThan10

# 1. Download

if [ -f ./powersOfTau28_hez_final_10.ptau ]; then
    echo "powersOfTau28_hez_final_10.ptau already exists. Skipping."
else
    echo 'Downloading powersOfTau28_hez_final_10.ptau'
    wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_10.ptau
fi

echo "Compiling LessThan10.circom..."

# 2. Compile circuit
circom LessThan10.circom --r1cs --wasm --sym -o LessThan10
snarkjs r1cs info LessThan10/LessThan10.r1cs

# 3. Start a new zkey 
snarkjs groth16 setup LessThan10/LessThan10.r1cs powersOfTau28_hez_final_10.ptau LessThan10/circuit_0000.zkey

# 4. Make a contribution
snarkjs zkey contribute LessThan10/circuit_0000.zkey LessThan10/circuit_final.zkey --name="1st Contributor Name" -v -e="random text"

# 5. Export the verification key
snarkjs zkey export verificationkey LessThan10/circuit_final.zkey LessThan10/verification_key.json

# 6. Generate solidity contract
snarkjs zkey export solidityverifier LessThan10/circuit_final.zkey ../LessThan10Verifier.sol

cd ../..