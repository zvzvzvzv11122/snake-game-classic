
export enum Rarity {
  COMMON = "Common",
  UNCOMMON = "Uncommon",
  RARE = "Rare",
  EPIC = "Epic",
  LEGENDARY = "Legendary",
  MYTHIC = "Mythic"
}

export interface NFTItem {
  id: string;
  name: string;
  imageUrl: string;
  rarity: Rarity;
  rarityColor: string; // Tailwind color class e.g., text-green-400
  description: string;
  sellPriceTon?: number; // Price for which the user can sell this NFT
}

export interface CaseLoot {
  nftId: string;
  weight: number; // Higher weight means higher chance
}

export interface Case {
  id: string;
  name: string;
  priceTon: number;
  imageUrl: string;
  lootTable: CaseLoot[];
  description: string;
}

// Type for the actual NFT object won, not just the ID.
export type ChosenNFT = NFTItem;

// Type for NFT items in the user's inventory, with a unique instance ID
export interface InventoryNFTItem extends NFTItem {
  instanceId: string;
}
