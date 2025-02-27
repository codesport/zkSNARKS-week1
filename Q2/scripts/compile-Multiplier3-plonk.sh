#!/bin/bash

# [assignment] create your own bash script to compile Multipler3.circom using PLONK below

#!/bin/bash

# [assignment] create your own bash script to compile Multipler3.circom modeling after compile-HelloWorld.sh below


cd contracts/circuits

mkdir Multiplier3_plonk

# 1. Download

if [ -f ./powersOfTau28_hez_final_10.ptau ]; then
    echo "powersOfTau28_hez_final_10.ptau already exists. Skipping."
else
    echo 'Downloading powersOfTau28_hez_final_10.ptau'
    wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_10.ptau
fi

echo "Compiling Multiplier3.circom..."

# 2. Compile circuit
circom Multiplier3.circom --r1cs --wasm --sym -o Multiplier3_plonk 
snarkjs r1cs info Multiplier3_plonk/Multiplier3.r1cs

# 3. Start a new zkey
snarkjs plonk setup Multiplier3_plonk/Multiplier3.r1cs powersOfTau28_hez_final_10.ptau Multiplier3_plonk/circuit_final.zkey

# 4. Export the verification key
snarkjs zkey export verificationkey Multiplier3_plonk/circuit_final.zkey Multiplier3_plonk/verification_key.json

# 5. Generate solidity contract
snarkjs zkey export solidityverifier Multiplier3_plonk/circuit_final.zkey ../Multiplier3Verifier_plonk.sol

cd ../..