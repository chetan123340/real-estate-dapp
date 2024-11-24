import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

// Components
import Navigation from './components/Navigation';
import Search from './components/Search';
import Home from './components/Home';

// ABIs
import RealEstate from './abis/RealEstate.json';
import Escrow from './abis/Escrow.json';

// Config
import config from './config.json';

function App() {
  const [provider, setProvider] = useState(null);
  const [escrow, setEscrow] = useState(null);

  const [account, setAccount] = useState(null);

  const [homes, setHomes] = useState([]);
  const [home, setHome] = useState({});
  const [toggle, setToggle] = useState(false);

  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);
    const network = await provider.getNetwork();

    const realEstate = new ethers.Contract(
      config[network.chainId].realEstate.address,
      RealEstate,
      provider
    );
    const totalSupply = await realEstate.totalSupply();
    const homes = [];

    for (var i = 1; i <= totalSupply; i++) {
      const uri = await realEstate.tokenURI(i);
      const response = await fetch(uri);
      const metadata = await response.json();
      homes.push(metadata);
    }

    setHomes(homes);

    const escrow = new ethers.Contract(
      config[network.chainId].escrow.address,
      Escrow,
      provider
    );
    setEscrow(escrow);

    window.ethereum.on('accountsChanged', async () => {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = ethers.utils.getAddress(accounts[0]);
      setAccount(account);
    });
  };

  useEffect(() => {
    loadBlockchainData();
  }, []);

  const togglePop = (home) => {
    setHome(home);
    setToggle((prev) => !prev);
  };

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />
      <Search />

      <div className="bg-white dark:bg-gray-900 px-16 pb-6">
        <h3 className="text-5xl font-extrabold dark:text-white text-center pb-5">
          Homes For You
        </h3>
        <hr className="mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {homes.map((home, index) => (
            <div
              className="w-full flex justify-center cursor-pointer"
              key={index}
              onClick={() => togglePop(home)}
            >
              <div>
                <div className="flex flex-col items-center bg-white border border-gray-200 rounded-lg shadow md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                  <img
                    className="object-cover w-full rounded-t-lg h-60 md:h-auto md:w-48 md:rounded-none md:rounded-l-lg"
                    src={home.image}
                    alt="Home"
                  />
                  <div className="flex flex-col justify-between p-7 leading-normal">
                    <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                      {home.attributes[0].value} ETH
                    </h5>
                    <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                      <strong>{home.attributes[2].value}</strong> bds |
                      <strong>{home.attributes[3].value}</strong> ba |
                      <strong>{home.attributes[4].value}</strong> sqft
                    </p>
                    <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                      {home.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {toggle && (
        <Home
          home={home}
          provider={provider}
          account={account}
          escrow={escrow}
          togglePop={togglePop}
        />
      )}
    </div>
  );
}

export default App;
