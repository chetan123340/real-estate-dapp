const { ethers } = require("hardhat");

async function main() {  
    // const RealEstate = await ethers.getContractFactory("RealEstate");     
    // const realEstate = await RealEstate.deploy();
    // await realEstate.deployed()
    // console.log("Contract deployed to address:",      MySepoliaContract.address);

    const Escrow = await ethers.getContractFactory("Escrow")
    const escrow = await Escrow.deploy()
    await escrow.deployed()
    console.log("Contract deployed to address: ", escrow.address)
  }
  main().then(() => 
    process.exit(0)
  ).catch((error) => {        
     console.log(error);    
     process.exit(1);  
  });