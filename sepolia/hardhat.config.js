/** @type import('hardhat/config').HardhatUserConfig */
require("dotenv").config()
require("@nomiclabs/hardhat-ethers")
require("@nomicfoundation/hardhat-verify");

const { API_URL, PRIVATE_KEY, ETHERSCAN_API } = process.env;
module.exports = {
  solidity: "0.8.27",
  defaultNetwork: "sepolia",
  networks: {
    sepolia: {
      url: API_URL,
      accounts: [`0x${PRIVATE_KEY}`],
    }
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: ETHERSCAN_API
  }
};  
