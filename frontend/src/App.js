import {useState} from 'react';
import {Tab, Navbar, Container, Button, Nav} from "react-bootstrap";
import Swap from './screen/Swap'
import {Logo} from "./components/Images";
import Admin from "./screen/Admin";

const App = () => {
    const [currentAccount, setCurrentAccount] = useState({address: '', balanceETH: 0});
    const [key, setKey] = useState('');
    function handleConnectWallet() {

    }
    const handleSwitchTabs = (k) => {
        setKey(k);
    }
    return (
        <>
            <Navbar bg="dark" variant="dark">
                <Container>
                    <Navbar.Brand href="#home">
                        <Logo/>
                        {' '}
                        HomeSwap
                    </Navbar.Brand>
                    {
                        key === 'swap' ? currentAccount && currentAccount.address !== '' ?
                            <div style={{color: 'white', height: '100%'}}>
                                <div>{currentAccount.address}</div>
                                <div><span>{currentAccount.balanceETH} ETH</span></div>
                            </div> :
                            // eslint-disable-next-line no-undef
                            <Button variant="outline-primary" onClick={handleConnectWallet}>Connect Wallet</Button>
                            :''
                    }

                </Container>
            </Navbar>
            <Tab.Container id="simple-exchange" defaultActiveKey="swap" onSelect={handleSwitchTabs}>
                        <Nav variant="pills" className="flex-row justify-content-center">
                            <div className={"nav-items"}>
                                <Nav.Item>
                                    <Nav.Link eventKey="swap">Swap</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="admin">Admin</Nav.Link>
                                </Nav.Item>
                            </div>
                        </Nav>

                        <Tab.Content>
                            <Tab.Pane eventKey="swap">
                                <Swap key={key} setCurrentAccount={setCurrentAccount}/>
                            </Tab.Pane>
                            <Tab.Pane eventKey="admin">
                                <Admin />
                            </Tab.Pane>
                        </Tab.Content>
            </Tab.Container>
        </>
    );

}
export default App;