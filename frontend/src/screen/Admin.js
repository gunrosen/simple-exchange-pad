import {Image, Table} from "react-bootstrap";
import {Coins} from "../constants/constants";
import {useEffect, useState} from "react";
import {ethers, Wallet} from "ethers";
import SimpleExchangeContract from "../artifacts/contracts/SimpleExchange.sol/SimpleExchange.json";
import { multiply } from 'mathjs';

const Admin = () => {
    const [loadingX, setLoadingX] = useState(false);
    const [loadingY, setLoadingY] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [rateX, setRateX] = useState('0');
    const [rateY, setRateY] = useState('0');

    const [wallet, setWallet] = useState(null);
    const [exchangeContract, setExchangeContract] = useState(null);

    useEffect(() => {
        reloadAdmin();
    }, [])

    const reloadAdmin = async () => {
        try {
            setErrorMessage('');
            const _provider = new ethers.providers.Web3Provider(window.ethereum)
            const wallet = new Wallet(process.env.REACT_APP_PRIVATE_KEY_OWNER, _provider);
            const simpleExchangeContract = new ethers.Contract(process.env.REACT_APP_ADDRESS_SIMPLE_EXCHANGE, SimpleExchangeContract.abi, wallet);
            const rateX = await simpleExchangeContract.getTokenRate(process.env.REACT_APP_ADDRESS_TOKEN_X);
            const rateXStr = multiply(Number(rateX.value) , (10 ** (-1 * rateX.decimal))).toFixed(rateX.decimal);
            setRateX(rateXStr);
            const rateY = await simpleExchangeContract.getTokenRate(process.env.REACT_APP_ADDRESS_TOKEN_Y);
            const rateYStr = multiply(Number(rateY.value) , (10 ** (-1 * rateY.decimal))).toFixed(rateY.decimal);
            setRateY(rateYStr);

            setWallet(wallet);
            setExchangeContract(simpleExchangeContract);
        } catch (e) {
            setErrorMessage(e.message);
        }
    }

    const handleChangeRate = (e) => {
        e.preventDefault();
        const {value, name} = e.target;
        if (value.match("^[0-9]*[.]?[0-9]*$")) {
            if (Coins[1].abbr === name) {
                setRateX(value);
            } else if (Coins[2].abbr === name) {
                setRateY(value);
            }
        }
    }
    const extractNumber = (numberStr) => {
        const decimal = numberStr.split(".")[1] ? numberStr.split(".")[1].length : 0;
        const value = multiply(numberStr , (10 ** decimal));
        return [value, decimal];
    }
    const sleep = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const handleUpdateRate = async (e) => {
        e.preventDefault();
        try {
            const {name} = e.target;
            let rate = '0';
            let tokenAddress;
            setErrorMessage('');
            if (Coins[1].abbr === name){
                setLoadingX(true);
                tokenAddress = Coins[1].address;
                rate = rateX;
            }else if (Coins[2].abbr === name){
                setLoadingY(true);
                tokenAddress = Coins[2].address;
                rate = rateY;
            } else {
                setErrorMessage('Token address not found.')
                return;
            }
            if (Number(rate) === 0) {
                setErrorMessage('Rate should be greater than ZERO.')
                return;
            }
            const [value, decimal] = extractNumber(rate.toString())
            const tx = await exchangeContract.connect(wallet)
                .upsertTokenRate(tokenAddress, value, decimal);
            await tx.wait();
            await sleep(1000);
        } catch (e) {
            if (e.body && JSON.parse(e.body)) {
                const err = JSON.parse(e.body);
                setErrorMessage(err.error.message);
            } else {
                console.log(e)
                setErrorMessage(e.message);
            }
        } finally {
            setLoadingX(false);
            setLoadingY(false);
        }


    }
    return <>
        <div className={"admin-page"}>
            <div>
                <div className="admin-page__rate">
                    <Image src={Coins[1].image} alt="ether" className="currency-icon"/>
                    {' '}
                    <span className="currency-code">{Coins[1].abbr}</span>
                    {' = '}
                    <input className="admin-page__rate-input"
                           onChange={handleChangeRate}
                           value={rateX}
                           name={Coins[1].abbr}
                           inputMode="decimal" autoComplete="off" autoCorrect="off" type="text"
                           placeholder="0.0" minLength={1} maxLength={18} spellCheck={false}/>
                    <Image src={Coins[0].image} alt="ether" className="currency-icon"/>
                    {' '}
                    <span className="currency-code">{Coins[0].abbr}</span>
                    <button className="ms-4 admin-page__rate-swap" disabled={loadingX}
                            name={Coins[1].abbr}
                            onClick={!loadingX ? handleUpdateRate : null}> {loadingX ? '......' : 'Update'}</button>
                </div>
                <div className="admin-page__rate">
                    <Image src={Coins[2].image} alt="ether" className="currency-icon"/>
                    {' '}
                    <span className="currency-code">{Coins[2].abbr}</span>
                    {' = '}
                    <input className="admin-page__rate-input"
                           onChange={handleChangeRate}
                           value={rateY}
                           name={Coins[2].abbr}
                           inputMode="decimal" autoComplete="off" autoCorrect="off" type="text"
                           placeholder="0.0" minLength={1} maxLength={18} spellCheck={false}/>
                    <Image src={Coins[0].image} alt="ether" className="currency-icon"/>
                    {' '}
                    <span className="currency-code">{Coins[0].abbr}</span>
                    <button className="ms-4 admin-page__rate-swap" disabled={loadingY} name={Coins[2].abbr}
                            onClick={!loadingY ? handleUpdateRate : null}> {loadingY ? '......' : 'Update'}</button>
                </div>
            </div>
            <div>
                {
                    errorMessage ?
                        <label style={{color: 'red'}}> {errorMessage}</label> : ''
                }
            </div>
            <Table striped bordered hover size="sm" responsive="sm" className={"mt-4"}>
                <thead>
                <tr>
                    <th>Content</th>
                    <th>Address</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>Owner of exchange</td>
                    <td>{process.env.REACT_APP_OWNER}</td>
                </tr>
                <tr>
                    <td>Private key</td>
                    <td>{process.env.REACT_APP_PRIVATE_KEY_OWNER}</td>
                </tr>
                </tbody>
            </Table>
        </div>
    </>
}
export default Admin;