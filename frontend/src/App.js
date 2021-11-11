import {useState} from 'react';
import {ethers} from 'ethers';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import {Button, Navbar, Container, Row, Col, Image} from "react-bootstrap";
import {IconDown, IconSwap, Logo} from "./components/Images";
import {EtherImage} from "./constants/constants";


function App() {
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
                                        <button className="open-currency-select-button">
                                            <span className="swap-left">
                                                <div className="swap-left-currency">
                                                    <Image src={EtherImage} alt="ether" className="currency-icon"/>
                                                    {' '}
                                                    <span className="currency-code">ETH</span>
                                                </div>
                                                <IconDown className="icon-down"/>
                                            </span>
                                        </button>
                                        <input className="swap-amount-input" inputMode="decimal" autoComplete="off" autoCorrect="off" type="text" pattern="^[0-9]*[.,]?[0-9]*$"
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
                                    <button className="open-currency-select-button">
                                            <span className="swap-left">
                                                <div className="swap-left-currency">
                                                    <Image src={EtherImage} alt="ether" className="currency-icon"/>
                                                    {' '}
                                                    <span className="currency-code">ETH</span>
                                                </div>
                                                <IconDown className="icon-down"/>
                                            </span>
                                    </button>
                                    <input className="swap-amount-input" inputMode="decimal" autoComplete="off" autoCorrect="off" type="text" pattern="^[0-9]*[.,]?[0-9]*$"
                                           placeholder="0.0" minLength={1} maxLength={79} spellCheck={false}/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                            <button className="swap-button"> Connect Wallet</button>
                    </div>
                </div>
            </div>
        </div>

        <div className="background-page"/>
    </>
}

export default App;
