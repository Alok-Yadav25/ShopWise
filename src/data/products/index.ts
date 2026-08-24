import { Product } from '@/types/product';

export const products: Product[] = [
  // Dairy
  { id: 'p1', name: 'Amul Taaza Milk', category: 'Dairy', brand: 'Amul', price: 62, unit: 'L', size: '1L', attributes: ['fresh'], rating: 4.5, reviewCount: 1200, dietaryTags: ['vegetarian'] },
  { id: 'p2', name: 'Mother Dairy Milk', category: 'Dairy', brand: 'Mother Dairy', price: 60, unit: 'L', size: '1L', attributes: ['fresh'], rating: 4.3, reviewCount: 980, dietaryTags: ['vegetarian'] },
  { id: 'p3', name: 'Amul Gold Milk', category: 'Dairy', brand: 'Amul', price: 78, unit: 'L', size: '1L', attributes: ['premium', 'fresh'], rating: 4.6, reviewCount: 850, dietaryTags: ['vegetarian'] },
  { id: 'p4', name: 'Organic Valley Milk', category: 'Dairy', brand: 'Organic Valley', price: 120, unit: 'L', size: '1L', attributes: ['organic', 'premium'], rating: 4.7, reviewCount: 420, dietaryTags: ['vegetarian', 'organic'] },
  { id: 'p5', name: 'Amul Butter', category: 'Dairy', brand: 'Amul', price: 58, unit: 'pack', size: '100g', attributes: ['fresh'], rating: 4.6, reviewCount: 2100, dietaryTags: ['vegetarian'] },
  { id: 'p6', name: 'Amul Cheese Slices', category: 'Dairy', brand: 'Amul', price: 99, unit: 'pack', size: '200g', attributes: ['fresh'], rating: 4.3, reviewCount: 750, dietaryTags: ['vegetarian'] },
  { id: 'p7', name: 'Epigamia Greek Yogurt', category: 'Dairy', brand: 'Epigamia', price: 55, unit: 'pack', size: '90g', attributes: ['fresh'], rating: 4.4, reviewCount: 620, dietaryTags: ['vegetarian', 'low-fat'] },
  { id: 'p8', name: 'Almond Breeze Milk', category: 'Dairy Alternatives', brand: 'Blue Diamond', price: 120, unit: 'L', size: '1L', attributes: ['dairy-free'], rating: 4.2, reviewCount: 380, dietaryTags: ['vegan', 'dairy-free'] },
  { id: 'p9', name: 'Oatly Oat Milk', category: 'Dairy Alternatives', brand: 'Oatly', price: 199, unit: 'L', size: '1L', attributes: ['dairy-free', 'premium'], rating: 4.5, reviewCount: 290, dietaryTags: ['vegan', 'dairy-free'] },
  { id: 'p10', name: 'Free Range Eggs', category: 'Dairy', brand: 'Nestle', price: 85, unit: 'pack', size: '6 pcs', attributes: ['fresh'], rating: 4.4, reviewCount: 1500, dietaryTags: ['vegetarian'] },

  // Produce
  { id: 'p11', name: 'Apples', category: 'Produce', price: 180, unit: 'kg', size: '1 kg', attributes: ['fresh'], season: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb'], rating: 4.2, dietaryTags: ['vegan'] },
  { id: 'p12', name: 'Organic Apples', category: 'Produce', price: 280, unit: 'kg', size: '1 kg', attributes: ['organic', 'fresh'], season: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb'], rating: 4.5, dietaryTags: ['vegan', 'organic'] },
  { id: 'p13', name: 'Bananas', category: 'Produce', price: 50, unit: 'dozen', size: '1 dozen', attributes: ['fresh'], season: ['all'], rating: 4.3, dietaryTags: ['vegan'] },
  { id: 'p14', name: 'Tomatoes', category: 'Produce', price: 40, unit: 'kg', size: '1 kg', attributes: ['fresh'], season: ['all'], rating: 4.1, dietaryTags: ['vegan'] },
  { id: 'p15', name: 'Onions', category: 'Produce', price: 35, unit: 'kg', size: '1 kg', attributes: ['fresh'], season: ['all'], rating: 4.0, dietaryTags: ['vegan'] },
  { id: 'p16', name: 'Potatoes', category: 'Produce', price: 30, unit: 'kg', size: '1 kg', attributes: ['fresh'], season: ['all'], rating: 4.1, dietaryTags: ['vegan'] },
  { id: 'p17', name: 'Spinach', category: 'Produce', price: 25, unit: 'bunch', attributes: ['fresh'], season: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar'], rating: 4.0, dietaryTags: ['vegan'] },
  { id: 'p18', name: 'Mango (Alphonso)', category: 'Produce', price: 350, unit: 'kg', size: '1 kg', attributes: ['premium', 'fresh'], season: ['Apr', 'May', 'Jun'], rating: 4.8, dietaryTags: ['vegan'] },
  { id: 'p19', name: 'Watermelon', category: 'Produce', price: 25, unit: 'kg', attributes: ['fresh'], season: ['Apr', 'May', 'Jun', 'Jul'], rating: 4.2, dietaryTags: ['vegan'] },
  { id: 'p20', name: 'Sweet Corn', category: 'Produce', price: 40, unit: 'pack', size: '4 pcs', attributes: ['fresh'], season: ['Mar', 'Apr', 'May', 'Jun'], rating: 4.3, dietaryTags: ['vegan'] },
  { id: 'p21', name: 'Strawberries', category: 'Produce', price: 150, unit: 'pack', size: '250g', attributes: ['fresh'], season: ['Dec', 'Jan', 'Feb', 'Mar'], rating: 4.5, dietaryTags: ['vegan'] },
  { id: 'p22', name: 'Lemons', category: 'Produce', price: 20, unit: 'pcs', attributes: ['fresh'], season: ['all'], rating: 4.1, dietaryTags: ['vegan'] },
  { id: 'p23', name: 'Cucumber', category: 'Produce', price: 30, unit: 'kg', attributes: ['fresh'], season: ['all'], rating: 4.0, dietaryTags: ['vegan'] },

  // Bakery
  { id: 'p30', name: 'Whole Wheat Bread', category: 'Bakery', brand: 'Britannia', price: 45, unit: 'pack', size: '400g', attributes: ['whole-grain'], rating: 4.3, reviewCount: 1800, dietaryTags: ['vegetarian'] },
  { id: 'p31', name: 'Organic Multigrain Bread', category: 'Bakery', brand: 'Anmol', price: 80, unit: 'pack', size: '400g', attributes: ['organic', 'whole-grain'], rating: 4.5, reviewCount: 320, dietaryTags: ['vegetarian', 'organic'] },
  { id: 'p32', name: 'Croissant', category: 'Bakery', brand: 'English Oven', price: 120, unit: 'pack', size: '4 pcs', attributes: ['premium'], rating: 4.2, reviewCount: 280, dietaryTags: ['vegetarian'] },
  { id: 'p33', name: 'Pav Bun', category: 'Bakery', brand: 'English Oven', price: 30, unit: 'pack', size: '6 pcs', attributes: ['fresh'], rating: 4.1, reviewCount: 950, dietaryTags: ['vegetarian'] },

  // Beverages
  { id: 'p40', name: 'Tata Gold Tea', category: 'Beverages', brand: 'Tata', price: 165, unit: 'pack', size: '500g', attributes: [], rating: 4.4, reviewCount: 3200, dietaryTags: ['vegan'] },
  { id: 'p41', name: 'Nescafe Classic Coffee', category: 'Beverages', brand: 'Nescafe', price: 210, unit: 'pack', size: '200g', attributes: [], rating: 4.5, reviewCount: 5600, dietaryTags: ['vegan'] },
  { id: 'p42', name: 'Real Fruit Juice - Mango', category: 'Beverages', brand: 'Real', price: 65, unit: 'pack', size: '1L', attributes: ['fresh'], rating: 4.2, reviewCount: 1200, dietaryTags: ['vegan'] },
  { id: 'p43', name: 'Bisleri Water', category: 'Beverages', brand: 'Bisleri', price: 20, unit: 'bottle', size: '1L', attributes: [], rating: 4.0, reviewCount: 8900, dietaryTags: [] },
  { id: 'p44', name: 'Sting Energy Drink', category: 'Beverages', brand: 'Sting', price: 20, unit: 'bottle', size: '250ml', attributes: [], rating: 4.1, reviewCount: 4200, dietaryTags: [] },

  // Snacks
  { id: 'p50', name: "Lay's Classic Salted Chips", category: 'Snacks', brand: "Lay's", price: 20, unit: 'pack', size: '52g', attributes: [], rating: 4.2, reviewCount: 8500, dietaryTags: ['vegetarian'] },
  { id: 'p51', name: 'Nature Valley Granola Bar', category: 'Snacks', brand: 'Nature Valley', price: 99, unit: 'pack', size: '6 bars', attributes: ['whole-grain'], rating: 4.4, reviewCount: 1100, dietaryTags: ['vegetarian'] },
  { id: 'p52', name: 'Haldiram Aloo Bhujia', category: 'Snacks', brand: 'Haldiram', price: 65, unit: 'pack', size: '200g', attributes: [], rating: 4.5, reviewCount: 3400, dietaryTags: ['vegetarian'] },
  { id: 'p53', name: 'Dark Chocolate 70%', category: 'Snacks', brand: 'Amul', price: 120, unit: 'bar', size: '150g', attributes: ['premium'], rating: 4.6, reviewCount: 1800, dietaryTags: ['vegetarian'] },
  { id: 'p54', name: 'Mixed Nuts', category: 'Snacks', brand: 'Tata Sampann', price: 199, unit: 'pack', size: '200g', attributes: ['premium'], rating: 4.4, reviewCount: 680, dietaryTags: ['vegan'] },

  // Personal Care
  { id: 'p60', name: 'Colgate MaxFresh Toothpaste', category: 'Personal Care', brand: 'Colgate', price: 85, unit: 'tube', size: '150g', attributes: [], rating: 4.3, reviewCount: 4200, dietaryTags: [] },
  { id: 'p61', name: 'Dettol Soap', category: 'Personal Care', brand: 'Dettol', price: 42, unit: 'pack', size: '125g', attributes: [], rating: 4.4, reviewCount: 3800, dietaryTags: [] },
  { id: 'p62', name: 'Head & Shoulders Shampoo', category: 'Personal Care', brand: 'Head & Shoulders', price: 220, unit: 'bottle', size: '400ml', attributes: [], rating: 4.2, reviewCount: 2900, dietaryTags: [] },
  { id: 'p63', name: 'Himalaya Neem Face Wash', category: 'Personal Care', brand: 'Himalaya', price: 175, unit: 'tube', size: '150ml', attributes: ['organic'], rating: 4.3, reviewCount: 2100, dietaryTags: [] },

  // Household
  { id: 'p70', name: 'Surf Excel Detergent', category: 'Household', brand: 'Surf Excel', price: 180, unit: 'pack', size: '1 kg', attributes: [], rating: 4.4, reviewCount: 5200, dietaryTags: [] },
  { id: 'p71', name: 'Vim Dishwash Liquid', category: 'Household', brand: 'Vim', price: 99, unit: 'bottle', size: '500ml', attributes: [], rating: 4.3, reviewCount: 2800, dietaryTags: [] },
  { id: 'p72', name: 'Domex Toilet Cleaner', category: 'Household', brand: 'Domex', price: 85, unit: 'bottle', size: '500ml', attributes: [], rating: 4.2, reviewCount: 1900, dietaryTags: [] },
  { id: 'p73', name: 'Kitchen Towel', category: 'Household', brand: 'Origins', price: 75, unit: 'roll', attributes: [], rating: 4.1, reviewCount: 800, dietaryTags: [] },

  // Grains & Staples
  { id: 'p80', name: 'India Gate Basmati Rice', category: 'Grains & Staples', brand: 'India Gate', price: 350, unit: 'pack', size: '1 kg', attributes: ['premium'], rating: 4.5, reviewCount: 4800, dietaryTags: ['vegan'] },
  { id: 'p81', name: 'Toor Dal', category: 'Grains & Staples', brand: 'Tata Sampann', price: 160, unit: 'pack', size: '1 kg', attributes: [], rating: 4.4, reviewCount: 3200, dietaryTags: ['vegan'] },
  { id: 'p82', name: 'Aashirvaad Atta', category: 'Grains & Staples', brand: 'Aashirvaad', price: 280, unit: 'pack', size: '5 kg', attributes: ['whole-grain'], rating: 4.6, reviewCount: 6500, dietaryTags: ['vegan'] },
  { id: 'p83', name: 'Quinoa', category: 'Grains & Staples', brand: 'True Elements', price: 320, unit: 'pack', size: '500g', attributes: ['organic'], rating: 4.3, reviewCount: 420, dietaryTags: ['vegan', 'organic'] },

  // Condiments
  { id: 'p90', name: 'Kissan Jam', category: 'Condiments', brand: 'Kissan', price: 125, unit: 'jar', size: '500g', attributes: [], rating: 4.3, reviewCount: 2800, dietaryTags: ['vegetarian'] },
  { id: 'p91', name: 'Maggi Hot & Sweet Sauce', category: 'Condiments', brand: 'Maggi', price: 110, unit: 'bottle', size: '500g', attributes: [], rating: 4.2, reviewCount: 1900, dietaryTags: ['vegan'] },
  { id: 'p92', name: 'Saffola Gold Oil', category: 'Condiments', brand: 'Saffola', price: 220, unit: 'bottle', size: '1 L', attributes: [], rating: 4.4, reviewCount: 3600, dietaryTags: ['vegan'] },

  // Frozen
  { id: 'p100', name: "McCain Smiles", category: 'Frozen', brand: 'McCain', price: 125, unit: 'pack', size: '400g', attributes: ['frozen'], rating: 4.5, reviewCount: 2100, dietaryTags: ['vegetarian'] },
  { id: 'p101', name: 'Suguna Chicken Nuggets', category: 'Frozen', brand: 'Suguna', price: 185, unit: 'pack', size: '500g', attributes: ['frozen'], rating: 4.2, reviewCount: 800, dietaryTags: [] },
];

export const productCategories = [
  'Dairy', 'Dairy Alternatives', 'Produce', 'Bakery', 'Beverages',
  'Snacks', 'Personal Care', 'Household', 'Grains & Staples', 'Condiments', 'Frozen'
];

export function findProductByName(name: string): Product | undefined {
  const lower = name.toLowerCase();
  return products.find(p => p.name.toLowerCase().includes(lower) || lower.includes(p.name.toLowerCase()));
}

export function findProductsByCategory(category: string): Product[] {
  const lower = category.toLowerCase();
  return products.filter(p => p.category.toLowerCase().includes(lower));
}

export function findProductsByBrand(brand: string): Product[] {
  const lower = brand.toLowerCase();
  return products.filter(p => p.brand?.toLowerCase().includes(lower));
}
