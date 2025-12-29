import { useState } from 'react';
import { TronLinkAdapter } from '@tronweb3/tronwallet-adapters';


let adapterInstance = null;
const getAdapter = () => {
    if (!adapterInstance && typeof window !== 'undefined') {
        adapterInstance = new TronLinkAdapter();
    }
    return adapterInstance;
};

export const useWallet = () => {


    const [state, setState] = useState({

        tronWebReady: false,
        isConnected: false,

        accountAddress: null,
    });


    const conectar = async (autoConnect = false) => {
        try {
            const adapter = getAdapter();
            if (!adapter) {
                console.error("Adapter not available");
                return false;
            }

            if (adapter.connected) {
                console.log("Already connected");
                return true;
            }

            if (!autoConnect) {
                // Show loading state for manual connection
                const loginElement = document.getElementById("login");
                if (loginElement) {
                    loginElement.innerHTML = '<img src="images/cargando.gif" height="20px" alt="loading..." />';
                }
            }

            // Connect to wallet
            await adapter.connect();

            if (adapter.connected) {
                console.log("Wallet connected successfully");

                // Update state with connected wallet info
                setState(prev => ({
                    ...prev,
                    accountAddress: adapter.address,
                    tronlink: {
                        ...prev.tronlink,
                        installed: true,
                        loggedIn: true,
                        viewer: false,
                        adapter: adapter
                    }
                }));

                // Load contracts with connected wallet
                //await loadContracts(adapter.address);

                // Update UI
                const loginElement = document.getElementById("login");
                if (loginElement) {
                    loginElement.innerHTML = 'Connected';
                }

                return true;
            } else {
                console.log("Connection failed");
                return false;
            }
        } catch (error) {
            console.error("Connection error:", error);
            return false;
        }
    };

    const desconectar = async () => {
        const adapter = getAdapter();
        if (adapter && adapter.connected) {
            await adapter.disconnect();
        }
        return true;
    };

    const firmar = async (message) => {
        const adapter = getAdapter();
        if (adapter && adapter.connected) {
            try {
                const signature = await adapter.signMessage(message);
                return signature;
            } catch (error) {
                console.error("Error signing message:", error);
                return null;
            }
        }
        return null;
    };



    return {
        conectar,
        desconectar,
        firmar,
        ...state
    }



}

