const fetchNFTDetails = async (tokenId) => {
    try {
        console.log(`Fetching details for Token ID: ${tokenId}...`);
        
        // Fetch the token URI
        const tokenURI = await realEstateContract.tokenURI(tokenId);
        console.log("Token URI:", tokenURI);

        // Fetch the owner of the token
        const owner = await realEstateContract.ownerOf(tokenId);
        console.log("Owner Address:", owner);

        // Optional: Fetch metadata from the Token URI
        const response = await fetch(tokenURI);
        if (response.ok) {
            const metadata = await response.json();
            console.log("NFT Metadata:", metadata);
        } else {
            console.error("Failed to fetch metadata from URI");
        }
    } catch (error) {
        console.error("Error fetching NFT details:", error);
    }
};

fetchNFTDetails(1); // Replace with your minted Token ID
