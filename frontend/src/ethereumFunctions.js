import { ethers } from "ethers";

export function getProvider() {
    return new ethers.providers.Web3Provider(window.ethereum);
}

export function getSigner(provider) {
    return provider.getSigner();
}

export async function getAccount() {
    const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
    });

    return accounts[0];
}
