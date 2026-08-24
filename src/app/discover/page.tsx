'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, TrendingUp, X } from 'lucide-react';
import { products, productCategories } from '@/data/products';
import { getCurrentSeasonalPicks } from '@/data/seasonal';
import { ProductCard } from '@/components/products/ProductCard';
import { FilterChip } from '@/components/ui/FilterChip';
import { MobileNavigation, DesktopNavigation } from '@/components/ui/Navigation';
import { Product } from '@/types/product';
import { cn } from '@/lib/utils';

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);
  const [showOrganic, setShowOrganic] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const seasonalPicks = getCurrentSeasonalPicks();

  const filteredProducts = useMemo(() => {
    let result = products;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (priceMax !== null) {
      result = result.filter(p => p.price <= priceMax);
    }

    if (showOrganic) {
      result = result.filter(p => p.organic || p.dietaryTags?.includes('organic'));
    }

    return result;
  }, [searchQuery, selectedCategory, priceMax, showOrganic]);

  const seasonalProducts = useMemo(() => {
    const names = seasonalPicks.map(p => p.productName.toLowerCase());
    return products.filter(p => names.some(n => p.name.toLowerCase().includes(n)));
  }, [seasonalPicks]);

  const clearFilters = () => {
    setSelectedCategory(null);
    setPriceMax(null);
    setShowOrganic(false);
  };

  const clearAll = () => {
    clearFilters();
    setSearchQuery('');
  };

  const hasActiveFilters = !!(selectedCategory || priceMax !== null || showOrganic);

  return (
    <div className="min-h-screen bg-background">
      <div className="hidden md:flex">
        <DesktopNavigation />
        <main className="flex-1 max-w-4xl mx-auto px-6 py-8">
          <PageContent
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            priceMax={priceMax}
            setPriceMax={setPriceMax}
            showOrganic={showOrganic}
            setShowOrganic={setShowOrganic}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            filteredProducts={filteredProducts}
            seasonalProducts={seasonalProducts}
            seasonalPicks={seasonalPicks}
            hasActiveFilters={hasActiveFilters}
            clearFilters={clearFilters}
            clearAll={clearAll}
          />
        </main>
      </div>

      <div className="md:hidden">
        <MobileNavigation />
        <main className="max-w-lg mx-auto px-4 pt-6 pb-24">
          <PageContent
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            priceMax={priceMax}
            setPriceMax={setPriceMax}
            showOrganic={showOrganic}
            setShowOrganic={setShowOrganic}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            filteredProducts={filteredProducts}
            seasonalProducts={seasonalProducts}
            seasonalPicks={seasonalPicks}
            hasActiveFilters={hasActiveFilters}
            clearFilters={clearFilters}
            clearAll={clearAll}
          />
        </main>
      </div>
    </div>
  );
}

interface PageContentProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (c: string | null) => void;
  priceMax: number | null;
  setPriceMax: (p: number | null) => void;
  showOrganic: boolean;
  setShowOrganic: (o: boolean) => void;
  showFilters: boolean;
  setShowFilters: (s: boolean) => void;
  filteredProducts: Product[];
  seasonalProducts: Product[];
  seasonalPicks: { productName: string; description: string }[];
  hasActiveFilters: boolean;
  clearFilters: () => void;
  clearAll: () => void;
}

function PageContent({
  searchQuery, setSearchQuery,
  selectedCategory, setSelectedCategory,
  priceMax, setPriceMax,
  showOrganic, setShowOrganic,
  showFilters, setShowFilters,
  filteredProducts, seasonalProducts, seasonalPicks,
  hasActiveFilters, clearFilters, clearAll,
}: PageContentProps) {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Discover</h1>
        <p className="text-sm text-text-muted mt-1">Browse products and find what you need</p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder='Search products... try "organic apples under 250"'
          className="w-full pl-10 pr-10 py-3 rounded-xl bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filter toggle */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
            showFilters ? 'bg-primary/10 text-primary' : 'bg-surface-hover text-text-secondary',
          )}
        >
          <Filter size={14} />
          Filters
        </button>

        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-xs text-primary hover:text-primary-dark">
            Clear filters
          </button>
        )}
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="p-4 rounded-xl bg-surface border border-border space-y-3">
              {/* Categories */}
              <div>
                <p className="text-xs font-semibold text-text-muted mb-2">Category</p>
                <div className="flex flex-wrap gap-2">
                  {productCategories.map(cat => (
                    <FilterChip
                      key={cat}
                      label={cat}
                      active={selectedCategory === cat}
                      onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                    />
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <p className="text-xs font-semibold text-text-muted mb-2">Max Price</p>
                <div className="flex gap-2">
                  {[100, 200, 500, 1000].map(price => (
                    <FilterChip
                      key={price}
                      label={`≤ ₹${price}`}
                      active={priceMax === price}
                      onClick={() => setPriceMax(priceMax === price ? null : price)}
                    />
                  ))}
                </div>
              </div>

              {/* Organic */}
              <div>
                <FilterChip
                  label="🌱 Organic Only"
                  active={showOrganic}
                  onClick={() => setShowOrganic(!showOrganic)}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedCategory && (
            <FilterChip label={selectedCategory} active onRemove={() => setSelectedCategory(null)} />
          )}
          {priceMax && (
            <FilterChip label={`Under ₹${priceMax}`} active onRemove={() => setPriceMax(null)} />
          )}
          {showOrganic && (
            <FilterChip label="Organic" active onRemove={() => setShowOrganic(false)} />
          )}
        </div>
      )}

      {/* Results count */}
      <p className="text-xs text-text-muted mb-3">
        {filteredProducts.length} products found
      </p>

      {/* Seasonal Picks (only when no active search/filters) */}
      {!hasActiveFilters && !searchQuery && seasonalProducts.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-success" />
            <h2 className="text-sm font-semibold text-text-primary">Seasonal Picks</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {seasonalProducts.slice(0, 3).map((product, idx) => (
              <ProductCard key={product.id} product={product} index={idx} />
            ))}
          </div>
          <div className="mt-4">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">In Season Now</h3>
            <div className="flex flex-wrap gap-2">
              {seasonalPicks.map(pick => (
                <span
                  key={pick.productName}
                  className="text-xs px-2.5 py-1 rounded-full bg-success/10 text-success font-medium"
                >
                  {pick.productName} · {pick.description}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product, idx) => (
            <ProductCard key={product.id} product={product} index={idx} />
          ))}
        </AnimatePresence>
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-16">
          <p className="text-sm text-text-muted">No products match your search.</p>
          <button
            onClick={clearAll}
            className="mt-2 text-sm text-primary hover:text-primary-dark"
          >
            Clear filters
          </button>
        </div>
      )}
    </>
  );
}
