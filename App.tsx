
import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { CaseCard } from './components/CaseCard';
import { Modal } from './components/Modal';
import { NftItemCard } from './components/NftItemCard';
import { Spinner } from './components/Spinner';
import { UserProfile } from './components/UserProfile';
import { AddFundsModal } from './components/AddFundsModal'; // Import the new modal
import { CASES, NFT_ITEMS, INITIAL_TON_BALANCE, APP_WALLET_ADDRESS, TON_NANO_MULTIPLIER } from './constants';
import type { ChosenNFT, NFTItem, Case, InventoryNFTItem } from './types';
import { Rarity } from './types';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { SendTransactionRequest } from '@tonconnect/sdk';


const App: React.FC = () => {
  const [balance, setBalance] = useState<number>(INITIAL_TON_BALANCE);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isOpening, setIsOpening] = useState<boolean>(false);
  const [wonNft, setWonNft] = useState<ChosenNFT | null>(null);
  const [showResultModal, setShowResultModal] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [spinnerItems, setSpinnerItems] = useState<NFTItem[]>([]);
  const [inventory, setInventory] = useState<InventoryNFTItem[]>([]);
  const [currentView, setCurrentView] = useState<'cases' | 'profile'>('cases');
  const [showAddFundsModal, setShowAddFundsModal] = useState<boolean>(false); // State for new modal
  const [wonItemProcessed, setWonItemProcessed] = useState<boolean>(false); // Tracks if won NFT was handled by sell/keep

  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet(); // Get connected wallet information

  useEffect(() => {
    const savedInventory = localStorage.getItem('nftInventory');
    if (savedInventory) {
      setInventory(JSON.parse(savedInventory));
    }
    const savedBalance = localStorage.getItem('userBalance');
    if (savedBalance) {
      setBalance(parseFloat(savedBalance));
    } else {
      setBalance(INITIAL_TON_BALANCE); // Ensure initial balance is set if nothing in local storage
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('nftInventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('userBalance', balance.toString());
  }, [balance]);


  useEffect(() => {
    let timerId: number | undefined;
    // Only set a hide timer if there is a notification AND it's not a "pending" state message like "Sending transaction..."
    if (notification && !notification.startsWith("Sending transaction...")) {
      timerId = window.setTimeout(() => {
        setNotification(null);
      }, 4000); // Notification clears after 4 seconds for non-pending messages
    }
    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [notification]);

  const handleOpenAddFundsModal = useCallback(() => {
    if (!wallet) {
        setNotification("Please connect your wallet first.");
        return;
    }
    setShowAddFundsModal(true);
  }, [wallet]);

  const handleCloseAddFundsModal = useCallback(() => {
    setShowAddFundsModal(false);
  }, []);

  const handleConfirmDeposit = useCallback(async (amount: number) => {
    if (!wallet || !tonConnectUI) {
      setNotification("Wallet not connected or TON Connect UI not available.");
      return;
    }
    if (amount <= 0) {
      setNotification("Deposit amount must be positive.");
      return;
    }

    if (APP_WALLET_ADDRESS === "UQBwDwHoaO4ui_VtMr7c5NiB1lKps-yBGJlORQun_bPQvV75") { // Placeholder check
        console.warn("WARNING: You are using a placeholder recipient address for TON deposits. Please update APP_WALLET_ADDRESS in constants.ts to your actual wallet address.");
        setNotification("Developer Alert: Recipient address is a placeholder. See console.");
    }

    const transaction: SendTransactionRequest = {
      validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes from now
      messages: [
        {
          address: APP_WALLET_ADDRESS,
          amount: (amount * TON_NANO_MULTIPLIER).toString(), // Amount in nanoTON
        },
      ],
    };

    try {
      setNotification("Sending transaction... Please confirm in your wallet.");
      await tonConnectUI.sendTransaction(transaction);
      setBalance(prev => prev + amount);
      setNotification(`Successfully deposited ${amount} TON! Balance updated.`);
      
    } catch (error: unknown) { 
      console.error("TON Connect transaction failed:", error);
      let errorMessage = "Transaction failed or was rejected.";
      if (error instanceof Error) {
        if (error.message.toLowerCase().includes('user rejected')) {
          errorMessage = "Transaction rejected by user.";
        } else if (error.message.toLowerCase().includes('timeout')) {
          errorMessage = "Transaction timed out. Please try again.";
        } else if (error.message.toLowerCase().includes('aborted')) { 
            errorMessage = "Transaction aborted. Please try again.";
        } else if (error.message.toLowerCase().includes('bad request')) {
            errorMessage = "Transaction failed: Bad request. Check parameters or network.";
        }
      } else if (typeof error === 'string' && error.toLowerCase().includes('aborted')) {
        errorMessage = "Transaction aborted. Please try again.";
      }
      setNotification(errorMessage);
    } finally {
      setShowAddFundsModal(false); 
    }

  }, [wallet, tonConnectUI, setNotification, setBalance, setShowAddFundsModal]);


  const selectNftForOpening = useCallback((caseData: Case): ChosenNFT => {
    const lootTable = caseData.lootTable;
    let totalWeight = 0;
    for (const item of lootTable) {
      totalWeight += item.weight;
    }

    let randomWeight = Math.random() * totalWeight;
    let chosenNftId: string | null = null;

    for (const item of lootTable) {
      if (randomWeight < item.weight) {
        chosenNftId = item.nftId;
        break;
      }
      randomWeight -= item.weight;
    }
    
    if (!chosenNftId) {
        chosenNftId = lootTable[Math.floor(Math.random() * lootTable.length)].nftId;
    }

    const nft = NFT_ITEMS.find(nftItem => nftItem.id === chosenNftId);
    if (!nft) {
        console.error("Chosen NFT ID not found in NFT_ITEMS:", chosenNftId);
        // Fallback to a default item if something goes wrong
        const fallbackItem = NFT_ITEMS[0] || { id: 'fallback', name: 'Fallback NFT', imageUrl: '', rarity: Rarity.COMMON, rarityColor: 'text-slate-400', description: 'Error item' };
        return fallbackItem;
    }
    return nft;
  }, []);

  const prepareSpinnerItems = useCallback((targetNft: NFTItem, caseData: Case): NFTItem[] => {
    const itemsForSpinner: NFTItem[] = [];
    const numItems = 50; 
    const targetIndex = Math.floor(numItems * 0.75); // Winning item appears around 3/4th mark

    const caseNftIds = new Set(caseData.lootTable.map(item => item.nftId));
    const nftsInCase = NFT_ITEMS.filter(nft => caseNftIds.has(nft.id));

    if (nftsInCase.length === 0) {
        // Fallback if case has no valid NFTs (should not happen with proper config)
        const fallbackNft = NFT_ITEMS[0] || { id: 'fallback', name: 'Fallback NFT', imageUrl: '', rarity: Rarity.COMMON, rarityColor: 'text-slate-400', description: 'Error item' };
        return Array(numItems).fill(fallbackNft);
    }

    for (let i = 0; i < numItems; i++) {
      if (i === targetIndex) {
        itemsForSpinner.push(targetNft);
      } else {
        itemsForSpinner.push(nftsInCase[Math.floor(Math.random() * nftsInCase.length)]);
      }
    }
    return itemsForSpinner;
  }, []);


  const handleOpenCase = useCallback((caseData: Case) => {
    if (balance < caseData.priceTon) {
      setNotification("Insufficient TON balance!");
      return;
    }
    if (isOpening) return;

    setBalance(prev => prev - caseData.priceTon);
    setSelectedCase(caseData);
    setIsOpening(true);
    setCurrentView('cases'); 
    setWonNft(null); 

    const newlyWonNft = selectNftForOpening(caseData);
    setWonNft(newlyWonNft);
    setWonItemProcessed(false); // Reset for the new item
    setSpinnerItems(prepareSpinnerItems(newlyWonNft, caseData));
    
  }, [balance, isOpening, selectNftForOpening, prepareSpinnerItems, setWonItemProcessed]);

  const handleSpinEnd = useCallback(() => {
    setShowResultModal(true);
  }, []);

  // This function is now ONLY for closing the modal via 'X' or backdrop click
  const handleCloseModal = useCallback(() => {
    if (wonNft && !wonItemProcessed) {
      const newInventoryItem: InventoryNFTItem = { 
        ...wonNft, 
        instanceId: self.crypto.randomUUID()
      };
      setInventory(prev => [...prev, newInventoryItem]);
      setNotification(`${wonNft.name} has been added to your inventory.`);
    }
    
    setShowResultModal(false);
    setIsOpening(false);
    setSelectedCase(null);
    // wonNft is not reset here to allow handleSell/Keep to reference it if they were called.
    // wonItemProcessed is reset when a new case is opened.
  }, [wonNft, wonItemProcessed, setInventory, setNotification, setShowResultModal, setIsOpening, setSelectedCase]);

  const handleSellWonItem = useCallback(() => {
    if (!wonNft || typeof wonNft.sellPriceTon !== 'number') return;
    setBalance(prev => prev + (wonNft.sellPriceTon || 0));
    setNotification(`Sold ${wonNft.name} for ${wonNft.sellPriceTon} TON!`);
    setWonItemProcessed(true); // Mark item as processed

    // Directly close modal and reset states
    setShowResultModal(false);
    setIsOpening(false);
    setSelectedCase(null);
  }, [wonNft, setBalance, setNotification, setWonItemProcessed, setShowResultModal, setIsOpening, setSelectedCase]);

  const handleKeepWonItem = useCallback(() => {
    if (!wonNft) return;
    const newInventoryItem: InventoryNFTItem = { 
      ...wonNft, 
      instanceId: self.crypto.randomUUID()
    };
    setInventory(prev => [...prev, newInventoryItem]);
    setNotification(`${wonNft.name} added to your inventory!`);
    setWonItemProcessed(true); // Mark item as processed

    // Directly close modal and reset states
    setShowResultModal(false);
    setIsOpening(false);
    setSelectedCase(null);
  }, [wonNft, setInventory, setNotification, setWonItemProcessed, setShowResultModal, setIsOpening, setSelectedCase]);

  const handleSellFromInventory = useCallback((itemInstanceId: string) => {
    const itemToSell = inventory.find(item => item.instanceId === itemInstanceId);
    if (itemToSell && typeof itemToSell.sellPriceTon === 'number') {
      setBalance(prev => prev + (itemToSell.sellPriceTon || 0));
      setInventory(prev => prev.filter(item => item.instanceId !== itemInstanceId));
      setNotification(`Sold ${itemToSell.name} for ${itemToSell.sellPriceTon} TON!`);
    }
  }, [inventory, setBalance, setInventory, setNotification]);


  const renderMainContent = () => {
    if (isOpening && selectedCase && wonNft) {
      return (
        <div className="w-full flex flex-col items-center mt-2 sm:mt-8">
            <h2 className="text-3xl font-bold mb-4 text-slate-100">Opening {selectedCase.name}...</h2>
            <Spinner items={spinnerItems} winningItem={wonNft} onSpinEnd={handleSpinEnd} />
        </div>
      );
    }

    if (currentView === 'profile') {
      return <UserProfile inventory={inventory} onSellNft={handleSellFromInventory} />;
    }

    return (
      <>
        <h2 className="text-3xl font-bold my-4 sm:my-8 text-slate-100">Choose a Gift Box</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
          {CASES.map(caseItem => (
            <CaseCard key={caseItem.id} caseData={caseItem} onOpen={() => handleOpenCase(caseItem)} disabled={isOpening || balance < caseItem.priceTon} />
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center p-4 selection:bg-sky-500 selection:text-white">
      <Header 
        balance={balance} 
        onShowProfile={() => setCurrentView('profile')}
        onShowCases={() => setCurrentView('cases')}
        currentView={currentView}
        onOpenAddFundsModal={handleOpenAddFundsModal}
      />

      {notification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-sky-500 text-white px-6 py-3 rounded-lg shadow-lg z-[1001]" role="alert" aria-live="assertive">
          {notification}
        </div>
      )}

      {renderMainContent()}

      {showResultModal && wonNft && (
        <Modal onClose={handleCloseModal} title="Congratulations!">
          <div className="flex flex-col items-center">
            <p className="text-lg text-slate-300 mb-4">You've received:</p>
            <NftItemCard nft={wonNft} />
            <div className="mt-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full">
              {typeof wonNft.sellPriceTon === 'number' && wonNft.sellPriceTon > 0 && (
                 <button
                  onClick={handleSellWonItem}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  Sell for {wonNft.sellPriceTon} TON
                </button>
              )}
              <button
                onClick={handleKeepWonItem}
                className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                Keep Item
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showAddFundsModal && (
        <AddFundsModal
          onClose={handleCloseAddFundsModal}
          onConfirmDeposit={handleConfirmDeposit}
          currentBalance={balance}
        />
      )}
    </div>
  );
};

export default App;
