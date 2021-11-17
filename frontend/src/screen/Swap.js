import {useEffect, useState} from 'react';
import {ethers, Contract} from 'ethers';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import cloneDeep from 'lodash/cloneDeep';
import {Image} from "react-bootstrap";
import {IconDown, IconSwap} from "../components/Images";
import TestRepstenInfo from "../components/TestRepstenInfo";
import {
    Coins
} from "../constants/constants";
import ModalCurrency from "../components/ModalCurrency";
import TokenContract from "../artifacts/contracts/Token.sol/Token.json";
import SimpleExchangeContract from "../artifacts/contracts/SimpleExchange.sol/SimpleExchange.json";
import { divide, multiply } from 'mathjs'

function Swap(props) {
    const [currentAccount, setCurrentAccount] = useState({address: '', balanceETH: 0});
    const [rateX, setRateX] = useState(0);
    const [rateY, setRateY] = useState(0);

    const [fromToken, setFromToken] = useState(Coins[0]);
    const [toToken, setToToken] = useState(Coins[1]);
    const [fromAmount, setFromAmount] = useState('0')
    const [toAmount, setToAmount] = useState('');

    const [openModal, setOpenModal] = useState(false);
    const [modalForFromToken, setModalForFromToken] = useState(null);
    const [alreadySetCurrency, setAlreadySetCurrency] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const [signer, setSigner] = useState(null);
    const [provider, setProvider] = useState(null);
    const [exchangeContract, setExchangeContract] = useState(null);

    useEffect(() => {
        reloadSwapData();
    }, [props.key]);

    const reloadSwapData = async () => {
        try {
            setErrorMessage('');
            const _provider = new ethers.providers.Web3Provider(window.ethereum)
            const _signer = _provider.getSigner(0);
            const simpleExchangeContract = new ethers.Contract(process.env.REACT_APP_ADDRESS_SIMPLE_EXCHANGE, SimpleExchangeContract.abi, _signer);
            const rateX = await simpleExchangeContract.getTokenRate(process.env.REACT_APP_ADDRESS_TOKEN_X);
            debugger;
            setRateX(multiply(Number(rateX.value) , (10 ** (-1 * rateX.decimal))));
            const rateY = await simpleExchangeContract.getTokenRate(process.env.REACT_APP_ADDRESS_TOKEN_Y);
            setRateY(multiply(Number(rateY.value) , (10 ** (-1 * rateY.decimal))));

            setProvider(_provider);
            setSigner(_signer);
            setExchangeContract(simpleExchangeContract);
        } catch (e) {
            setErrorMessage(e.message);
        }
    }

    useEffect(() => {
        updateAmount(fromAmount);
    }, [fromToken, toToken]);

    useEffect(() => {
        if (!loading) {
            handleConnectWallet();
        }
    }, [loading])

    const handleConnectWallet = async () => {
        if (!window.ethereum) {
            setErrorMessage('ethereum wallet is not available');
            return;
        }
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const [userAddress] = await window.ethereum.request({method: 'eth_requestAccounts'});
        const balance = await provider.getBalance(userAddress);
        const ethFormat = ethers.utils.formatEther(balance)
        setCurrentAccount({address: userAddress, balanceETH: ethFormat});
        props.setCurrentAccount({address: userAddress, balanceETH: ethFormat});
    }

    const handleSwap = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setLoading(true);
        try {
            await window.ethereum.request({method: 'eth_requestAccounts'});
            if (fromToken.abbr === 'ETH') {
                // Incase: from ETH to tokens
                const transaction = await exchangeContract.connect(signer)
                    .ethToToken(toToken.address, {value: ethers.utils.parseEther(fromAmount).toString()});
                await transaction.wait();
            } else if (toToken.abbr === 'ETH') {
                const tokenContract = new Contract(fromToken.abbr === 'TXX' ? process.env.REACT_APP_ADDRESS_TOKEN_X : process.env.REACT_APP_ADDRESS_TOKEN_Y, TokenContract.abi, provider);
                await tokenContract.connect(signer).approve(exchangeContract.address, ethers.utils.parseEther(fromAmount).toString());
                console.log(await exchangeContract.resolvedAddress);
                console.log(await exchangeContract.signer);
                await exchangeContract.connect(signer)
                    .tokenToETH(fromToken.address, ethers.utils.parseEther(fromAmount).toString());
            } else {
                const tokenContract = new ethers.Contract(fromToken.abbr === 'TXX' ? process.env.REACT_APP_ADDRESS_TOKEN_X : process.env.REACT_APP_ADDRESS_TOKEN_Y, TokenContract.abi, provider);
                await tokenContract.connect(signer).approve(exchangeContract.address, ethers.utils.parseEther(fromAmount).toString());
                await exchangeContract.connect(signer)
                    .tokenToTokenSwap(fromToken.address, toToken.address, ethers.utils.parseEther(fromAmount).toString());
            }
        } catch (e) {
            if (e.body && JSON.parse(e.body)) {
                const err = JSON.parse(e.body);
                setErrorMessage(err.error.message);
            } else {
                console.log(e)
                setErrorMessage(e.message);
            }
        } finally {
            setLoading(false);
        }
    };

    //TODO: refactor
    const calculateToAmount = (valueFrom) => {
        setErrorMessage('')
        if (valueFrom === '0') return '0';
        debugger;
        if (!rateX || !rateY) {
            setErrorMessage('Rate is invalid')
            return 0;
        }
        if (fromToken.abbr === 'ETH') {
            if (toToken.abbr === 'TXX') {
                return divide(valueFrom, rateX);
            } else if (toToken.abbr === 'TYY') {
                return divide(valueFrom, rateY);
            }
        } else if (fromToken.abbr === 'TXX') {
            if (toToken.abbr === 'ETH') {
                return multiply(valueFrom , rateX);
            } else if (toToken.abbr === 'TYY') {
                return divide(valueFrom * rateX, rateY);
            }
        } else if (fromToken.abbr === 'TYY') {
            if (toToken.abbr === 'ETH') {
                return valueFrom * rateY;
            } else if (toToken.abbr === 'TXX') {
                return divide(valueFrom * rateY, rateX);
            }
        }
        return 0;
    }
    const updateAmount = (value) => {
        if (value.match("^[0-9]*[.]?[0-9]*$")) {
            const valueTo = calculateToAmount(value);
            setFromAmount(value);
            setToAmount(valueTo);
        }
    }

    const handleFromAmountChange = (e) => {
        e.preventDefault();
        const value = e.target.value;
        if (value) updateAmount(value);
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
                                <button className="swap-button" disabled={loading}
                                        onClick={!loading ? handleSwap : null}> {loading ? 'SENDING' : 'SWAP'}</button>
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
                <TestRepstenInfo/>
            </div>
        </div>

        <div className="background-page"/>

    </>
}

export default Swap;
