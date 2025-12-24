import { useState } from 'react';
import utils from '../utils/utils';
import config from '../config';
import abi_PROXY from '../assets/abi/Proxy.json';
import abi_TOKEN from '../assets/abi/TRC20-USDT.json';
import abi_POOLBRST from '../assets/abi/PoolBRSTv4.json';
import abi_BRST_USDT from '../assets/abi/Brst-Usdt.json';
import abi_SIMPLE_SWAP from '../assets/abi/SunswapV3.json';
import abi_LOTERIA from '../assets/abi/Lottery.json';

export const useContracts = (accountAddress) => {
    const [contracts, setContracts] = useState({

        ready: false,
        BRUT: null,
        BRST: null,
        BRGY: null,
        USDT: null,
        USDD: null,
        BRUT_USDT: null,
        BRST_TRX: null,
        BRST_TRX_Proxy: null,
        BRST_TRX_Proxy_fast: null,
        ProxyBRLT: null,
        ProxyLoteria: null,
        loteria: null,
        MBOX: null

    });


    const loadContracts = async () => {

        let web3Contracts = await utils.getTronweb(accountAddress);

        try {
            // Load BRUT contract
            if (contracts.BRUT === null && config.BRUT !== "") {
                web3Contracts = await utils.getTronweb(accountAddress, 1);
                setContracts(prev => ({ ...prev, BRUT: web3Contracts.contract(abi_TOKEN, config.BRUT) }))

            }

            // Load USDT/USDD contracts
            if (contracts.USDT === null && config.USDT !== "") {
                web3Contracts = await utils.getTronweb(accountAddress, 1);
                setContracts(prev => ({ ...prev, USDT: web3Contracts.contract(abi_TOKEN, config.USDT) }))
                setContracts(prev => ({ ...prev, USDD: web3Contracts.contract(abi_TOKEN, config.USDD) }))

            }

            // Load BRUT_USDT contract
            if (contracts.BRUT_USDT === null && config.SC !== "") {
                setContracts(prev => ({ ...prev, BRUT_USDT: web3Contracts.contract(abi_BRST_USDT, config.SC) }))
            }

            // Load BRST_TRX contract
            if (contracts.BRST_TRX === null && config.SC2 !== "") {
                web3Contracts = await utils.getTronweb(accountAddress);
                setContracts(prev => ({ ...prev, BRST_TRX: web3Contracts.contract(abi_TOKEN, config.SC2) }))
            }

            // Load BRST_TRX_Proxy contract
            if (contracts.BRST_TRX_Proxy === null && config.ProxySC2 !== "") {
                web3Contracts = await utils.getTronweb(accountAddress);
                setContracts(prev => ({ ...prev, Proxy: web3Contracts.contract(abi_PROXY, config.ProxySC2) }))
                setContracts(prev => ({ ...prev, BRST_TRX_Proxy: web3Contracts.contract(abi_POOLBRST, config.ProxySC2) }))
            }

            // Load BRST_TRX_Proxy_fast contract
            if (contracts.BRST_TRX_Proxy_fast === null && config.ProxySC3 !== "") {
                web3Contracts = await utils.getTronweb(accountAddress);
                setContracts(prev => ({ ...prev, Proxy_fast: web3Contracts.contract(abi_PROXY, config.ProxySC3) }))
                setContracts(prev => ({ ...prev, BRST_TRX_Proxy_fast: web3Contracts.contract(abi_SIMPLE_SWAP, config.ProxySC3) }))
            }

            // Load BRST contract
            if (contracts.BRST === null && config.BRST !== "") {
                web3Contracts = await utils.getTronweb(accountAddress);
                setContracts(prev => ({ ...prev, BRST: web3Contracts.contract(abi_TOKEN, config.BRST) }))
            }

            // Load BRGY contract
            if (contracts.BRGY === null && config.BRGY !== "") {
                web3Contracts = await utils.getTronweb(accountAddress);
                setContracts(prev => ({ ...prev, BRGY: web3Contracts.contract().at(config.BRGY) }))

            }

            // Load MBOX contract
            if (contracts.MBOX === null && config.SC3 !== "") {
                web3Contracts = await utils.getTronweb(accountAddress);
                setContracts(prev => ({ ...prev, MBOX: web3Contracts.contract().at(config.SC3) }))
            }

            // Load BRLT contract
            if (contracts.ProxyBRLT === null && config.BRLT !== "") {
                web3Contracts = await utils.getTronweb(accountAddress, 2);
                setContracts(prev => ({ ...prev, ProxyBRLT: web3Contracts.contract().at(config.BRLT) }))

            }

            // Load Lottery contract
            if (contracts.loteria === null && config.SC4 !== "") {
                web3Contracts = await utils.getTronweb(accountAddress, 2);
                setContracts(prev => ({ ...prev, ProxyLoteria: web3Contracts.contract(abi_PROXY, config.SC4) }))
                setContracts(prev => ({ ...prev, loteria: web3Contracts.contract(abi_LOTERIA, config.SC4) }))
            }

            setContracts(prev => ({ ...prev, ready: true }))


        } catch (error) {
            console.error("Error loading contracts:", error);
            return null;
        }

        return contracts
    };


    return {
        contracts,
        loadContracts,
    }

}



