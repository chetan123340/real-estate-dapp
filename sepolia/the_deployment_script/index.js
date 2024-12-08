const { ethers } = require("ethers")
const escrowABI = require("../trail_and_test/abis/Escrow.json")
const realEstateABI = require('../trail_and_test/abis/RealEstate.json')

require("dotenv").config()

const provider = new ethers.providers.JsonRpcProvider(process.env.API_URL)
const wallet = new ethers.Wallet(`0x${process.env.PRIVATE_KEY}`)
const realEstateAddress = '0x22Bb2A4b68FEfCdF0A5A555514A70a0d996cC83a'
const escrowAddress = '0x8D2424CDE9f39C70EFF88e20D085e1E366DcFDa1'

const realEstateContract = new ethers.Contract(realEstateAddress, realEstateABI, wallet.connect(provider))
const escrowContract = new ethers.Contract(escrowAddress, escrowABI, wallet.connect(provider))

const main = async () => {
    console.log("Minting a new property...");
    const tokenURI = "https://red-official-urial-988.mypinata.cloud/ipfs/QmWHZLgPz5qWkJN9fsJSw7awdYYb6heRzg8K2tWUnBjg1j/2.json"
    const mintTx = await realEstateContract.mint(tokenURI);
    console.log("Mint transaction hash:", mintTx.hash);

    const receipt = await mintTx.wait();
    const tokenId = receipt.events[0].args[2]; // Token ID from Mint event
    console.log("Minted Token ID:", tokenId.toString());

    // Step 2: Approve Escrow Contract to transfer the NFT
    console.log("Approving Escrow contract to transfer the NFT...");
    const approveTx = await realEstateContract.approve(escrowAddress, tokenId);
    console.log("Approve transaction hash:", approveTx.hash);
    await approveTx.wait();

    // Step 3: Initialize Escrow and List the NFT
    console.log("Initializing Escrow and listing the property...");
    const buyerAddress = "0xE6Cd832d8052f08e29c4FeAfd27fc084c0ae5279"; // Replace with the buyer's address
    const inspectorAddress = "0x5cAa009dDb1f1ad8200C1E18F609b142f46a7Dd7"; // Replace with the inspector's address
    const lenderAddress = "0x43CAdE407dAa07F1b7eb388C7DD613f3C52E7Cee"; // Replace with the lender's address

    const initTx = await escrowContract.setInitals(realEstateAddress, wallet.address, inspectorAddress, lenderAddress);
    console.log("Escrow initialized transaction hash:", initTx.hash);
    await initTx.wait();

    const listTx = await escrowContract.list(tokenId, buyerAddress, ethers.utils.parseEther("0.0005"), ethers.utils.parseEther("0.0001"), {
        value: ethers.utils.parseEther("0.0001"), // Escrow amount
    });
    console.log("Property listed transaction hash:", listTx.hash);
    await listTx.wait();

    console.log("Property successfully minted and listed in Escrow!");
}

main();