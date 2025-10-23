import React, { useState, useEffect, useCallback, useRef } from "react";
import { withTranslation } from 'react-i18next';

import utils from "../utils";

const Galeria = ({ accountAddress, contrato, tronWeb, isViewerMode, t }) => {
  const [state, setState] = useState({
    imagerobots: [],
    loading: true,
    error: null
  });

  const mountedRef = useRef(true);
  const intervalRef = useRef(null);
  const nextUpdateRef = useRef(0);
  const previousAddressRef = useRef(null);

  // Fetch NFT data
  const fetchNFTData = useCallback(async () => {
    // Don't fetch if contracts aren't ready
    if (!contrato?.ready || !contrato?.MBOX || !contrato?.BRGY) {
      console.log("Contracts not ready yet");
      return;
    }

    // Don't fetch if no account address
    if (!accountAddress) {
      console.log("No account address available");
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      let robots = [];

      // Fetch NFT IDs from mystery box contract
      for (let index = 0; index < 25; index++) {
        try {
          const nftId = await contrato.MBOX.entregaNFT(accountAddress, index).call();
          
          if (nftId) {
            robots.push(parseInt(nftId));
          } else {
            break;
          }
        } catch (error) {
          // No more NFTs for this user
          break;
        }
      }

      // If no NFTs found, update state and return
      if (robots.length === 0) {
        if (mountedRef.current) {
          setState({
            imagerobots: [],
            loading: false,
            error: null
          });
        }
        return;
      }

      // Check ownership status for each NFT
      const ownershipChecks = await Promise.all(
        robots.map(async (nftId) => {
          try {
            const owner = await contrato.BRGY.ownerOf(nftId).call();
            const ownerAddress = window.tronWeb.address.fromHex(owner);
            return ownerAddress === accountAddress;
          } catch (error) {
            console.error(`Error checking ownership for NFT ${nftId}:`, error);
            return false;
          }
        })
      );

      // Fetch metadata for each NFT
      const nftDataPromises = robots.map(async (nftId, index) => {
        try {
          const uri = await contrato.BRGY.tokenURI(nftId).call();
          const response = await fetch(utils.proxy + uri);
          const metadata = await response.json();
          
          return {
            ...metadata,
            numero: nftId,
            isOwned: ownershipChecks[index]
          };
        } catch (error) {
          console.error(`Error fetching metadata for NFT ${nftId}:`, error);
          return {
            numero: nftId,
            name: `NFT #${nftId}`,
            image: '',
            isOwned: ownershipChecks[index],
            error: true
          };
        }
      });

      const nftData = await Promise.all(nftDataPromises);

      // Generate image components
      const imagerobots = nftData.map((nft, index) => {
        const claimButton = !nft.isOwned ? (
          <button 
            className="btn btn-success" 
            onClick={async () => {
              try {
                await contrato.MBOX.claimNFT_especifico(index).send();
                // Refresh data after claiming
                setTimeout(() => fetchNFTData(), 3000);
              } catch (error) {
                console.error("Error claiming NFT:", error);
              }
            }}
          >
            Claim
          </button>
        ) : null;

        return (
          <div className="col-xl-3 col-lg-6 col-sm-6" key={`robbrutN${nft.numero}`}>
            <div className="card">
              <div className="card-body">
                <div className="new-arrival-product">
                  <div className="new-arrivals-img-contnent">
                    {nft.image ? (
                      <a href={nft.image} rel="noopener noreferrer" target="_blank">
                        <img 
                          src={nft.image} 
                          alt={nft.name} 
                          className="img-thumbnail"
                          onError={(e) => {
                            e.target.src = '/images/brgy.png';
                          }}
                        />
                      </a>
                    ) : (
                      <img 
                        src="/images/brgy.png" 
                        alt={nft.name} 
                        className="img-thumbnail"
                      />
                    )}
                  </div>
                  <div className="new-arrival-content text-center mt-3">
                    <h4>#{nft.numero} {nft.name}</h4>
                    {claimButton}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      });

      if (mountedRef.current) {
        setState({
          imagerobots,
          loading: false,
          error: null
        });
      }
    } catch (error) {
      console.error("Error fetching NFT data:", error);
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message || "Failed to load NFT data"
        }));
      }
    }
  }, [accountAddress, contrato]);

  // Effect to handle wallet address changes
  useEffect(() => {
    // Check if wallet address has changed
    if (previousAddressRef.current !== accountAddress) {
      console.log(`Wallet address changed from ${previousAddressRef.current} to ${accountAddress}`);
      previousAddressRef.current = accountAddress;
      
      // Immediately fetch data when wallet changes
      if (contrato?.ready) {
        fetchNFTData();
      }
    }
  }, [accountAddress, contrato?.ready, fetchNFTData]);

  // Effect to set up periodic updates
  useEffect(() => {
    mountedRef.current = true;

    // Set document title
    document.title = "BRGY | Brutus.Finance";

    // Initial fetch
    if (contrato?.ready && accountAddress) {
      fetchNFTData();
    }

    // Set up interval for periodic updates
    intervalRef.current = setInterval(() => {
      if (!mountedRef.current) return;

      const now = Date.now();
      
      // Update every 60 seconds if contracts are ready, otherwise every 3 seconds
      const updateInterval = contrato?.ready ? 60 * 1000 : 3 * 1000;
      
      if (now >= nextUpdateRef.current) {
        nextUpdateRef.current = now + updateInterval;
        
        if (contrato?.ready && accountAddress) {
          fetchNFTData();
        }
      }
    }, 3000);

    // Cleanup function
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [contrato?.ready, accountAddress, fetchNFTData]);

  // Render loading state
  if (state.loading && state.imagerobots.length === 0) {
    return (
      <>
        <div className="row page-titles mx-0">
          <div className="col-sm-6 p-md-0">
            <div className="welcome-text">
              <h4>My Collectibles</h4>
              <p className="mb-0">BRGY</p>
            </div>
          </div>
          <div className="col-sm-6 p-md-0 justify-content-sm-end mt-2 mt-sm-0 d-flex">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">All collection on </li>
              <li className="breadcrumb-item active">
                <a href="https://bit.ly/Brutus-Gallery" rel="noopener noreferrer" target="_blank">
                  APENFT
                </a>
              </li>
            </ol>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center py-5">
                <img src="/images/cargando.gif" height="40px" alt="Loading..." />
                <p className="mt-3">Loading your NFT collection...</p>
                {isViewerMode && (
                  <p className="text-muted" style={{ fontSize: '0.9em' }}>
                    Connect your wallet to view your personal collection
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Render error state
  if (state.error) {
    return (
      <>
        <div className="row page-titles mx-0">
          <div className="col-sm-6 p-md-0">
            <div className="welcome-text">
              <h4>My Collectibles</h4>
              <p className="mb-0">BRGY</p>
            </div>
          </div>
          <div className="col-sm-6 p-md-0 justify-content-sm-end mt-2 mt-sm-0 d-flex">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">All collection on </li>
              <li className="breadcrumb-item active">
                <a href="https://bit.ly/Brutus-Gallery" rel="noopener noreferrer" target="_blank">
                  APENFT
                </a>
              </li>
            </ol>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center py-5">
                <div className="alert alert-danger">
                  <h5>Error Loading NFTs</h5>
                  <p>{state.error}</p>
                  <button 
                    className="btn btn-primary mt-3" 
                    onClick={() => fetchNFTData()}
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Render empty state
  if (state.imagerobots.length === 0) {
    return (
      <>
        <div className="row page-titles mx-0">
          <div className="col-sm-6 p-md-0">
            <div className="welcome-text">
              <h4>My Collectibles</h4>
              <p className="mb-0">BRGY</p>
            </div>
          </div>
          <div className="col-sm-6 p-md-0 justify-content-sm-end mt-2 mt-sm-0 d-flex">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">All collection on </li>
              <li className="breadcrumb-item active">
                <a href="https://bit.ly/Brutus-Gallery" rel="noopener noreferrer" target="_blank">
                  APENFT
                </a>
              </li>
            </ol>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center py-5">
                <img src="/images/brgy.png" alt="BRGY" style={{ maxWidth: '200px', opacity: 0.5 }} />
                <h4 className="mt-4">No NFTs Found</h4>
                <p className="text-muted">
                  {isViewerMode 
                    ? "Connect your wallet to view your NFT collection"
                    : "You don't have any BRGY NFTs yet"}
                </p>
                <a 
                  href="https://bit.ly/Brutus-Gallery" 
                  rel="noopener noreferrer" 
                  target="_blank"
                  className="btn btn-primary mt-3"
                >
                  View Collection on APENFT
                </a>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Render NFT gallery
  return (
    <>
      <div className="row page-titles mx-0">
        <div className="col-sm-6 p-md-0">
          <div className="welcome-text">
            <h4>My Collectibles</h4>
            <p className="mb-0">BRGY</p>
          </div>
        </div>
        <div className="col-sm-6 p-md-0 justify-content-sm-end mt-2 mt-sm-0 d-flex">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">All collection on </li>
            <li className="breadcrumb-item active">
              <a href="https://bit.ly/Brutus-Gallery" rel="noopener noreferrer" target="_blank">
                APENFT
              </a>
            </li>
          </ol>
        </div>
      </div>
      <div className="row">
        {state.imagerobots}
      </div>
    </>
  );
};

export default withTranslation()(Galeria);