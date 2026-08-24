import { SeasonalPick } from '@/types/recommendation';

export const seasonalPicks: SeasonalPick[] = [
  { productName: 'Mango (Alphonso)', category: 'Produce', season: 'Summer', month: [4, 5, 6], description: 'In season now' },
  { productName: 'Watermelon', category: 'Produce', season: 'Summer', month: [4, 5, 6, 7], description: 'In season now' },
  { productName: 'Sweet Corn', category: 'Produce', season: 'Summer', month: [3, 4, 5, 6], description: 'Peak season' },
  { productName: 'Strawberries', category: 'Produce', season: 'Winter', month: [12, 1, 2, 3], description: 'Fresh and in season' },
  { productName: 'Apples', category: 'Produce', season: 'Winter', month: [10, 11, 12, 1, 2], description: 'Peak harvest' },
  { productName: 'Spinach', category: 'Produce', season: 'Winter', month: [11, 12, 1, 2, 3], description: 'Winter greens' },
  { productName: 'Oranges', category: 'Produce', season: 'Winter', month: [11, 12, 1, 2, 3], description: 'Citrus season' },
  { productName: 'Pomegranate', category: 'Produce', season: 'Winter', month: [10, 11, 12, 1], description: 'Rich in antioxidants' },
  { productName: 'Grapes', category: 'Produce', season: 'Winter', month: [11, 12, 1, 2], description: 'Sweet and fresh' },
  { productName: 'Cauliflower', category: 'Produce', season: 'Winter', month: [10, 11, 12, 1, 2, 3], description: 'Winter staple' },
  { productName: 'Peas', category: 'Produce', season: 'Winter', month: [11, 12, 1, 2, 3], description: 'Fresh and sweet' },
  { productName: 'Carrots', category: 'Produce', season: 'Winter', month: [11, 12, 1, 2], description: 'Crunchy and sweet' },
  { productName: 'Corn', category: 'Produce', season: 'Monsoon', month: [7, 8, 9], description: 'Monsoon favorite' },
  { productName: 'Bitter Gourd', category: 'Produce', season: 'Monsoon', month: [6, 7, 8, 9], description: 'Rainy season crop' },
  { productName: 'Jackfruit', category: 'Produce', season: 'Summer', month: [4, 5, 6], description: 'Tropical delight' },
  { productName: 'Guava', category: 'Produce', season: 'Winter', month: [10, 11, 12, 1], description: 'Fresh from the farm' },
];

export function getCurrentSeasonalPicks(): SeasonalPick[] {
  const currentMonth = new Date().getMonth() + 1;
  return seasonalPicks.filter(p => p.month.includes(currentMonth));
}
