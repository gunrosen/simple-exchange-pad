import {useEffect, useState} from 'react';
import {ethers, Wallet} from 'ethers';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import cloneDeep from 'lodash/cloneDeep';
import {Button, Navbar, Container, Image} from "react-bootstrap";
import {IconDown, IconSwap, Logo} from "./components/Images";
import {
    ADDRESS_SIMPLE_EXCHANGE,
    ADDRESS_TOKEN_X,
    ADDRESS_TOKEN_Y,
    Coins,
} from "./constants/constants";
import ModalCurrency from "./components/ModalCurrency";
import TokenContract from "./artifacts/contracts/Token.sol/Token.json";
import SimpleExchangeContract from "./artifacts/contracts/SimpleExchange.sol/SimpleExchange.json";

/*
tokenX deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
tokenY deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
SimpleExchange deployed to: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
 */

function App() {
    const [currentAccount, setCurrentAccount] = useState({address: '', balanceETH: 0});
    const [rateX, setRateX] = useState(0);
    const [rateY, setRateY] = useState(0);

    const [fromToken, setFromToken] = useState(Coins[0]);
    const [toToken, setToToken] = useState(Coins[1]);
    const [fromAmount, setFromAmount] = useState('')
    const [toAmount, setToAmount] = useState('');

    const [openModal, setOpenModal] = useState(false);
    const [modalForFromToken, setModalForFromToken] = useState(null);
    const [alreadySetCurrency, setAlreadySetCurrency] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);


    useEffect(async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const simpleExchangeContract = new ethers.Contract(ADDRESS_SIMPLE_EXCHANGE, SimpleExchangeContract.abi, provider);
        const rateX = await simpleExchangeContract.getTokenRate(ADDRESS_TOKEN_X);
        setRateX(rateX.value * (10 ** (-1 * rateX.decimal)));
        const rateY = await simpleExchangeContract.getTokenRate(ADDRESS_TOKEN_Y);
        setRateY(rateY.value * (10 ** (-1 * rateY.decimal)));
    }, []);

    useEffect(() => {
        updateAmount(fromAmount);
    }, [fromToken, toToken]);

    useEffect(async () => {
        if (!loading){
            await handleConnectWallet();
        }
    }, [loading])

    const handleConnectWallet = async () => {
        if (!window.ethereum) {
            setErrorMessage('ethereum wallet is not available');
            return;
        }
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const [userAddress] = await window.ethereum.request({method: 'eth_requestAccounts'});
        console.log(userAddress);
        const balance = await provider.getBalance(userAddress);
        const ethFormat = ethers.utils.formatEther(balance)
        setCurrentAccount({address: userAddress, balanceETH: ethFormat});

    }

    const handleSwap = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setLoading(true);
        try {
            await window.ethereum.request({method: 'eth_requestAccounts'});
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const simpleExchangeContract = new ethers.Contract(ADDRESS_SIMPLE_EXCHANGE, SimpleExchangeContract.abi, signer);

            if (fromToken.abbr === 'ETH') {
                // Incase: from ETH to tokens
                await simpleExchangeContract.connect(signer)
                    .ethToToken(toToken.address, {value: ethers.utils.parseEther(fromAmount).toString()});
            } else if (toToken.abbr === 'ETH') {
                const tokenContract = new ethers.Contract(fromToken.abbr === 'TXX' ? ADDRESS_TOKEN_X : ADDRESS_TOKEN_Y, TokenContract.abi, provider);
                await tokenContract.connect(signer).approve(simpleExchangeContract.address, ethers.utils.parseEther(fromAmount).toString());
                await simpleExchangeContract.connect(signer)
                    .tokenToETH(fromToken.address, ethers.utils.parseEther(fromAmount).toString());
            } else {
                const tokenContract = new ethers.Contract(fromToken.abbr === 'TXX' ? ADDRESS_TOKEN_X : ADDRESS_TOKEN_Y, TokenContract.abi, provider);
                await tokenContract.connect(signer).approve(simpleExchangeContract.address, ethers.utils.parseEther(fromAmount).toString());
                await simpleExchangeContract.connect(signer)
                    .tokenToTokenSwap(fromToken.address, toToken.address, ethers.utils.parseEther(fromAmount).toString());
            }
        } catch (e) {
            debugger;
            if (e.body && JSON.parse(e.body)) {
                const err = JSON.parse(e.body);
                setErrorMessage(err.error.message);
            } else {
                setErrorMessage(e.message);
            }
        }finally
        {
            setLoading(false);
        }
    };
    //TODO: refactor
    const calculateToAmount = (valueFrom) => {
        if (valueFrom === 0) return 0;
        if (fromToken.abbr === 'ETH') {
            if (toToken.abbr === 'TXX') {
                return valueFrom / rateX;
            } else if (toToken.abbr === 'TYY') {
                return valueFrom / rateY;
            }
        } else if (fromToken.abbr === 'TXX') {
            if (toToken.abbr === 'ETH') {
                return valueFrom * rateX;
            } else if (toToken.abbr === 'TYY') {
                return valueFrom * rateX / rateY;
            }
        } else if (fromToken.abbr === 'TYY') {
            if (toToken.abbr === 'ETH') {
                return valueFrom * rateY;
            } else if (toToken.abbr === 'TXX') {
                return valueFrom * rateY / rateX;
            }
        }
        return 0;
    }
    const updateAmount = (value) => {
        if (value.match("^[0-9]*[.]?[0-9]*$")) {
            const valueFrom = Number(value);
            const valueTo = calculateToAmount(valueFrom);
            setFromAmount(value);
            setToAmount(valueTo);
        }
    }

    const handleFromAmountChange = (e) => {
        e.preventDefault();
        const value = e.target.value;
        updateAmount(value);
    }

    const handleToAmountChange = (e) => {
        e.preventDefault();
        setToAmount(e.target.value);
    }

    const handleOpenModal = (e, isFromAmount) => {
        e.preventDefault();
        const alreadyCurrency = isFromAmount ? toToken : fromToken;
        setAlreadySetCurrency(alreadyCurrency);
        setModalForFromToken(isFromAmount);
        setOpenModal(true);
    }

    const handleSelectCurrency = (item) => {
        if (modalForFromToken) {
            setFromToken(item);
        } else {
            setToToken(item);
        }
    }
    const handleRevertToken = () => {
        const tempFromToken = cloneDeep(fromToken);
        const tempToToken = cloneDeep(toToken);
        setFromToken(tempToToken);
        setToToken(tempFromToken);
    }

    return <>
        <Navbar bg="dark" variant="dark">
            <Container>
                <Navbar.Brand href="#home">
                    <Logo/>
                    {' '}
                    HomeSwap
                </Navbar.Brand>
                {
                    currentAccount && currentAccount.address !== '' ?
                        <div style={{color: 'white', height: '100%'}}>
                            <div>{currentAccount.address}</div>
                            <div><span>{currentAccount.balanceETH} ETH</span></div>
                        </div> :
                        <Button variant="outline-primary" onClick={handleConnectWallet}>Connect Wallet</Button>
                }

            </Container>
        </Navbar>
        <ModalCurrency show={openModal}
                       setShow={setOpenModal}
                       handleSelectCurrency={handleSelectCurrency}
                       alreadySetCurrency={alreadySetCurrency}
        />

        <div className="swap">
            <div className="swap-title">
                <div>Swap</div>
            </div>
            <div className="swap-area">
                <div className="swap-grid">
                    <div>
                        <div className="swap-from">
                            <div className="swap-holder">
                                <div className="swap-holder-place">
                                    <button className="open-currency-select-button"
                                            onClick={(e) => handleOpenModal(e, true)}>
                                            <span className="swap-left">
                                                <div className="swap-left-currency">
                                                    <Image src={fromToken.image} alt="ether" className="currency-icon"/>
                                                    {' '}
                                                    <span className="currency-code">{fromToken.abbr}</span>
                                                </div>
                                                <IconDown className="icon-down"/>
                                            </span>
                                    </button>
                                    <input className="swap-amount-input"
                                           onChange={handleFromAmountChange}
                                           value={fromAmount}
                                           inputMode="decimal" autoComplete="off" autoCorrect="off" type="text"
                                           placeholder="0.0" minLength={1} maxLength={18} spellCheck={false}/>
                                </div>
                            </div>
                        </div>
                        <div className="swap-break" onClick={handleRevertToken}>
                            <IconSwap/>
                        </div>
                        <div className="swap-from">
                            <div className="swap-holder">
                                <div className="swap-holder-place">
                                    <button className="open-currency-select-button"
                                            onClick={(e) => handleOpenModal(e, false)}>
                                            <span className="swap-left">
                                                <div className="swap-left-currency">
                                                    <Image src={toToken.image} alt="ether" className="currency-icon"/>
                                                    {' '}
                                                    <span className="currency-code">{toToken.abbr}</span>
                                                </div>
                                                <IconDown className="icon-down"/>
                                            </span>
                                    </button>
                                    <input className="swap-amount-input" inputMode="decimal" autoComplete="off"
                                           autoCorrect="off" type="text"
                                           placeholder="0.0" minLength={1} maxLength={18}
                                           onChange={handleToAmountChange}
                                           value={toAmount}/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        {
                            currentAccount.address ?
                                <button className="swap-button" disabled={loading} onClick={!loading ? handleSwap: null}> {loading ? 'SENDING' : 'SWAP'}</button>
                                :
                                <button className="swap-button" onClick={handleConnectWallet}> Connect Wallet</button>
                        }

                    </div>
                </div>
                <div>
                    {
                        errorMessage ?
                            <label style={{color: 'red'}}> {errorMessage}</label> : ''
                    }
                </div>
            </div>
        </div>

        <div className="background-page"/>
    </>
}

export default App;
