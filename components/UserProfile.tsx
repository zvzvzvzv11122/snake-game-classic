
import React from 'react';
import type { InventoryNFTItem } from '../types';
import { NftItemCard } from './NftItemCard';
import { TonIcon } from './icons/TonIcon';

interface UserProfileProps {
  inventory: InventoryNFTItem[];
  onSellNft: (itemInstanceId: string) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ inventory, onSellNft }) => {
  if (inventory.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-3xl font-bold text-slate-100 mb-4">My NFT Collection</h2>
        <p className="text-slate-400 text-lg">Your inventory is currently empty.</p>
        <p className="text-slate-400 text-lg mt-2">Go open some gift boxes to find treasures!</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold my-8 text-slate-100 text-center">My NFT Collection</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {inventory.map(item => (
          <div key={item.instanceId} className="bg-slate-800 rounded-xl shadow-lg overflow-hidden flex flex-col">
            <NftItemCard nft={item} />
            {typeof item.sellPriceTon === 'number' && item.sellPriceTon > 0 && (
              <div className="p-4 mt-auto">
                <button
                  onClick={() => onSellNft(item.instanceId)}
                  className="w-full flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  Sell for <TonIcon className="w-4 h-4 mx-1 text-white" /> {item.sellPriceTon}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
