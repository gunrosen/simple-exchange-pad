import { useState } from 'react';
import { ethers } from 'ethers';
import Greeting from '../artifacts/contracts/Greeting.sol/Greeting.json'

const greeterAddress = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";

const TestConnect = () => {
    const [greeting, setGreetingValue] = useState();
    const [tempGreeting, setTempGreetingValue] = useState();

    // request access to the user's MetaMask account
    async function requestAccount() {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
    }

    // call the smart contract, read the current greeting value
    async function fetchGreeting() {
        debugger;
        if (typeof window.ethereum !== 'undefined') {
            const provider = new ethers.providers.JsonRpcProvider();
            const contract = new ethers.Contract(greeterAddress, Greeting.abi, provider);
            try {
                const data = await contract.greet();
                setGreetingValue(data);
                console.log('data: ', data)
            } catch (err) {
                console.log("Error: ", err)
            }
        }
    }

    // call the smart contract, send an update
    async function setGreeting() {
        debugger;
        if (!greeting) return
        if (typeof window.ethereum !== 'undefined') {
            await requestAccount()
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner()
            const contract = new ethers.Contract(greeterAddress, Greeting.abi, signer)
            const transaction = await contract.setGreeting(tempGreeting)
            await transaction.wait()
            await fetchGreeting();
        }
    }

    return (
        <div className="App">
            <header className="App-header">
                {greeting}
                <button onClick={fetchGreeting}>Fetch Greeting</button>
                <input onChange={e => setTempGreetingValue(e.target.value)} placeholder="Set greeting" />
                <button onClick={setGreeting}>Set Greeting</button>

            </header>
        </div>
    );
};

export default TestConnect;