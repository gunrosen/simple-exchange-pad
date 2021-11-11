import {useState} from 'react';
import {ethers} from 'ethers';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import {Button, Navbar, Container, Row, Col, Image} from "react-bootstrap";
import {IconDown, IconSwap, Logo} from "./components/Images";
import {Coins, EtherImage} from "./constants/constants";
import {Modal} from "bootstrap";
import ModalCurrency from "./components/ModalCurrency";
import use from "use";
import {getProvider} from "./ethereumFunctions";


function App() {
    const [isConnected, setIsConnected] = useState(true);

    const [currentBalance, setCurrentBalance] = useState(0);
    const [fromToken, setFromToken] = useState(Coins[0]);
    const [toToken, setToToken] = useState(Coins[1]);
    const [fromAmount, setFromAmount] = useState(0);
    const [toAmount, setToAmount] = useState(0);

    const [openModal, setOpenModal] = useState(false);
    const [modalForFromToken, setModalForFromToken] = useState(null);
    const [alreadySetCurrency, setAlreadySetCurrency] = useState(null);

    const handleConnectWallet = async (e) => {
        e.preventDefault();
        await window.ethereum.request({ method: 'eth_requestAccounts' });
    }
    const handleSwap = () => {

    };

    const handleFromAmountChange = () => {}

    const handleToAmountChange = () => {}

    const handleOpenModal = (e, isFromAmount) => {
        e.preventDefault();
        const alreadyCurrency = isFromAmount ? fromToken : toToken;
        setAlreadySetCurrency(alreadyCurrency);
        setModalForFromToken(isFromAmount);
        setOpenModal(true);
    }
    const handleCloseModal = () => {
        setOpenModal(false);
    }

    const handleSelectCurrency = (item) => {
        if (modalForFromToken){
            setFromToken(item);
        } else {
            setToToken(item);
        }
    }


    return <>
        <Navbar bg="dark" variant="dark">
            <Container>
                <Navbar.Brand href="#home">
                    <Logo/>
                    {' '}
                    HomeSwap
                </Navbar.Brand>
                <Button variant="outline-primary">Connect Wallet</Button>
            </Container>
        </Navbar>
        <div>{getProvider().getBalance('0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc')}</div>
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
                                        <button className="open-currency-select-button" onClick={(e) => handleOpenModal(e,true)}>
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
                                               value={ethers.utils.parseEther(fromAmount.toString(10))}
                                               inputMode="decimal" autoComplete="off" autoCorrect="off" type="text"
                                               pattern="^[0-9]*[.,]?[0-9]*$"
                                               placeholder="0.0" minLength={1} maxLength={79} spellCheck={false}/>
                                    </div>
                            </div>
                        </div>
                        <div className="swap-break">
                            <IconSwap />
                        </div>
                        <div className="swap-from">
                            <div className="swap-holder">
                                <div className="swap-holder-place">
                                    <button className="open-currency-select-button"  onClick={(e) => handleOpenModal(e,false)}>
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
                                           autoCorrect="off" type="text" pattern="^[0-9]*[.,]?[0-9]*$"
                                           placeholder="0.0" minLength={1} maxLength={79} spellCheck={false}
                                           onChange={handleToAmountChange}
                                           value={toAmount}/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        {
                            isConnected ?
                                <button className="swap-button" onClick={handleSwap}> SWAP</button>
                                :
                                <button className="swap-button" onClick={handleConnectWallet}> Connect Wallet</button>
                        }

                    </div>
                </div>
            </div>
        </div>

        <div className="background-page"/>
    </>
}

export default App;
