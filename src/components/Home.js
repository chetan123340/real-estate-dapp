import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

import close from '../assets/close.svg';

const Home = ({ home, provider, account, escrow, togglePop }) => {
    const [hasBought, setHasBought] = useState(false);
    const [hasLended, setHasLended] = useState(false);
    const [hasInspected, setHasInspected] = useState(false);
    const [hasSold, setHasSold] = useState(false);

    const [buyer, setBuyer] = useState(null);
    const [lender, setLender] = useState(null);
    const [inspector, setInspector] = useState(null);
    const [seller, setSeller] = useState(null);

    const [owner, setOwner] = useState(null);

    const fetchDetails = async () => {
        const buyer = await escrow.buyer(home.id);
        setBuyer(buyer);

        const hasBought = await escrow.approval(home.id, buyer);
        setHasBought(hasBought);

        const seller = await escrow.seller();
        setSeller(seller);

        const hasSold = await escrow.approval(home.id, seller);
        setHasSold(hasSold);

        const lender = await escrow.lender();
        setLender(lender);

        const hasLended = await escrow.approval(home.id, lender);
        setHasLended(hasLended);

        const inspector = await escrow.inspector();
        setInspector(inspector);

        const hasInspected = await escrow.inspectionPassed(home.id);
        setHasInspected(hasInspected);
    };

    const fetchOwner = async () => {
        if (await escrow.isListed(home.id)) return;

        const owner = await escrow.buyer(home.id);
        setOwner(owner);
    };

    const buyHandler = async () => {
        const escrowAmount = await escrow.escrowAmount(home.id);
        const signer = await provider.getSigner();

        let transaction = await escrow.connect(signer).depositEarnest(home.id, { value: escrowAmount });
        await transaction.wait();

        transaction = await escrow.connect(signer).approveSale(home.id);
        await transaction.wait();

        setHasBought(true);
    };

    const inspectHandler = async () => {
        const signer = await provider.getSigner();

        const transaction = await escrow.connect(signer).updateInspectionStatus(home.id, true);
        await transaction.wait();

        setHasInspected(true);
    };

    const lendHandler = async () => {
        const signer = await provider.getSigner();

        const transaction = await escrow.connect(signer).approveSale(home.id);
        await transaction.wait();

        const lendAmount = (await escrow.purchasePrice(home.id) - await escrow.escrowAmount(home.id));
        await signer.sendTransaction({ to: escrow.address, value: lendAmount.toString(), gasLimit: 60000 });

        setHasLended(true);
    };

    const sellHandler = async () => {
        const signer = await provider.getSigner();

        let transaction = await escrow.connect(signer).approveSale(home.id);
        await transaction.wait();

        transaction = await escrow.connect(signer).finalizeSale(home.id);
        await transaction.wait();

        setHasSold(true);
    };

    useEffect(() => {
        fetchDetails();
        fetchOwner();
    }, [hasSold]);

    return (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full h-[600px] p-6 relative">
        {/* Close button */}
        <button
            onClick={togglePop}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                />
            </svg>
        </button>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
                <img
                    src={home.image}
                    alt="Home"
                    className="rounded-lg object-cover w-full h-56"
                />
                {owner ? (
                    <div className="text-lg text-gray-700 mt-4 text-center font-bold bg-green-400 rounded-md p-2">
                        Owned by {owner.slice(0, 6) + '...' + owner.slice(38, 42)}
                    </div>
                ) : (
                    <div className="space-y-4 mt-4">
                        {account === inspector ? (
                            <button
                                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                                onClick={inspectHandler}
                                disabled={hasInspected}
                            >
                                Approve Inspection
                            </button>
                        ) : account === lender ? (
                            <button
                                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                                onClick={lendHandler}
                                disabled={hasLended}
                            >
                                Approve & Lend
                            </button>
                        ) : account === seller ? (
                            <button
                                className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                                onClick={sellHandler}
                                disabled={hasSold}
                            >
                                Approve & Sell
                            </button>
                        ) : (
                            <button
                                className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
                                onClick={buyHandler}
                                disabled={hasBought}
                            >
                                Buy
                            </button>
                        )}

                        <button className="w-full bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400">
                            Contact agent
                        </button>
                    </div>
                )}
            </div>

            <div className="space-y-6">
                <h1 className="text-3xl font-bold">{home.name}</h1>
                <p className="text-gray-700">
                    <strong>{home.attributes[2].value}</strong> bds |
                    <strong>{home.attributes[3].value}</strong> ba |
                    <strong>{home.attributes[4].value}</strong> sqft
                </p>
                <p className="text-gray-500">{home.address}</p>
                <h2 className="text-2xl font-semibold text-gray-900">
                    {home.attributes[0].value} ETH
                </h2>

                

                <hr className="my-6" />

                <h2 className="text-lg font-bold">Overview</h2>
                <p className="text-gray-700">{home.description}</p>

                <hr className="my-6" />

                <h2 className="text-lg font-bold">Facts and Features</h2>
                <ul className="space-y-1 text-gray-700">
                    {home.attributes.map((attribute, index) => (
                        <li key={index}>
                            <strong>{attribute.trait_type}</strong>: {attribute.value}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    </div>
</div>

    );
};

export default Home;
