import React, { useState, useMemo } from 'react';
import { Heart, Plus, Search, Filter, ChevronDown, Check } from 'lucide-react';

interface ShopAllViewProps {
    products: any[];
    wishlist: any[];
    addToCart: (product: any) => void;
    toggleWishlist: (product: any) => void;
    initialCategory?: string;
}

export default function ShopAllView({ products, wishlist, addToCart, toggleWishlist, initialCategory = 'All' }: ShopAllViewProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState<'featured' | 'price-low' | 'price-high'>('featured');

    // Extract unique categories from active products
    const categories = useMemo(() => {
        const cats = products.map(p => p.category).filter(Boolean);
        return ['All', ...Array.from(new Set(cats))];
    }, [products]);

    // Filter and Sort Products
    const filteredProducts = useMemo(() => {
        let result = [...products];

        // Filter by category
        if (selectedCategory !== 'All') {
            result = result.filter(p => p.category === selectedCategory);
        }

        // Filter by search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p => 
                p.name.toLowerCase().includes(query) || 
                (p.description && p.description.toLowerCase().includes(query))
            );
        }

        // Sort
        if (sortOrder === 'price-low') {
            result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        } else if (sortOrder === 'price-high') {
            result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        }

        return result;
    }, [products, selectedCategory, searchQuery, sortOrder]);

    const images = {
        saffron: "https://paidhu.com/wp-content/uploads/2024/12/Saffron-2-300x300.png",
    };

    return (
        <div className="bg-paidhu-cream min-h-screen pb-20">
            {/* Premium Header Banner */}
            <div className="relative bg-paidhu-maroon py-20 px-6 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                </div>
                <div className="max-w-7xl mx-auto relative z-10 text-center space-y-6">
                    <span className="inline-block px-4 py-1.5 bg-paidhu-peach text-paidhu-maroon rounded-full text-xs font-bold uppercase tracking-widest font-brand shadow-sm">
                        Curated Selection
                    </span>
                    <h1 className="text-5xl md:text-7xl font-brand font-black text-white drop-shadow-sm">
                        Shop All <span className="text-paidhu-yellow">Products</span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-sans font-medium">
                        Discover our complete range of 100% natural, premium Kashmiri saffron, exquisite floral blends, and healthy indulgences.
                    </p>
                </div>
                {/* Wavy bottom divider matching landing page */}
                <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-20 translate-y-[1px]">
                    <svg className="relative block w-full h-[60px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,112.56,189.92,98.33,235.18,87.52,279.71,71.4,321.39,56.44Z" fill="var(--paidhu-cream)"></path>
                    </svg>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-10">
                {/* Sidebar Filters */}
                <div className="w-full lg:w-64 flex-shrink-0 space-y-8">
                    {/* Search */}
                    <div className="space-y-3">
                        <h3 className="font-brand font-bold text-lg text-paidhu-slate">Search</h3>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-paidhu-maroon transition-colors">
                                <Search className="w-4 h-4" />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Find products..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-white border-2 border-paidhu-peach rounded-2xl text-sm font-bold focus:outline-none focus:border-paidhu-maroon transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="space-y-4">
                        <h3 className="font-brand font-bold text-lg text-paidhu-slate flex items-center gap-2">
                            <Filter className="w-5 h-5 text-paidhu-maroon" /> Categories
                        </h3>
                        <div className="flex flex-col gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`flex items-center justify-between px-4 py-3 rounded-2xl font-brand font-bold text-sm transition-all border-2 ${
                                        selectedCategory === cat 
                                        ? 'bg-paidhu-maroon text-white border-paidhu-maroon shadow-md' 
                                        : 'bg-white text-paidhu-slate border-transparent hover:border-paidhu-peach hover:bg-paidhu-peach/30'
                                    }`}
                                >
                                    <span>{cat}</span>
                                    {selectedCategory === cat && <Check className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sort */}
                    <div className="space-y-3">
                        <h3 className="font-brand font-bold text-lg text-paidhu-slate">Sort By</h3>
                        <div className="relative">
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value as any)}
                                className="w-full appearance-none px-4 py-3 bg-white border-2 border-paidhu-peach rounded-2xl text-sm font-bold text-paidhu-slate focus:outline-none focus:border-paidhu-maroon transition-all shadow-sm cursor-pointer"
                            >
                                <option value="featured">Featured Collection</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Product Grid Area */}
                <div className="flex-1">
                    {/* Grid Header Info */}
                    <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-paidhu-peach/50">
                        <h2 className="font-brand font-bold text-2xl text-paidhu-slate">
                            {selectedCategory === 'All' ? 'All Products' : selectedCategory}
                        </h2>
                        <span className="text-sm font-bold text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                            {filteredProducts.length} Results
                        </span>
                    </div>

                    {/* The Grid */}
                    {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                            {filteredProducts.map((prod) => (
                                <div key={prod.id} className="group flex flex-col bg-white rounded-[32px] p-5 border-2 border-paidhu-peach/20 hover:border-paidhu-maroon/20 hover:shadow-2xl transition-all duration-500 relative">
                                    {/* Badge */}
                                    {prod.category === 'Bestsellers' || parseFloat(prod.price) < 500 ? (
                                        <div className="absolute top-4 left-4 z-10 bg-paidhu-yellow text-paidhu-slate text-[10px] font-black uppercase px-3 py-1.5 rounded-full shadow-sm tracking-widest">
                                            Must Have
                                        </div>
                                    ) : null}

                                    {/* Image */}
                                    <div className="aspect-square w-full mb-6 bg-paidhu-cream/50 rounded-[24px] overflow-hidden p-6 relative group-hover:bg-paidhu-peach/30 transition-colors duration-500 flex items-center justify-center">
                                        <img src={prod.image_url || images.saffron} alt={prod.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" />
                                        
                                        {/* Wishlist Toggle */}
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleWishlist(prod);
                                            }}
                                            className="absolute top-3 right-3 bg-white/90 backdrop-blur-md p-2.5 rounded-full shadow-sm hover:scale-110 hover:shadow-md transition-all border border-gray-100"
                                        >
                                            <Heart className={`w-4 h-4 ${wishlist.some(item => item.id === prod.id) ? 'fill-paidhu-maroon text-paidhu-maroon' : 'text-gray-400'}`} />
                                        </button>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 space-y-3 px-2">
                                        <h4 className="font-brand font-bold text-paidhu-slate text-xl leading-tight line-clamp-2 group-hover:text-paidhu-maroon transition-colors">{prod.name}</h4>
                                        <div className="flex items-center gap-3 pt-1">
                                            <span className="text-2xl font-brand font-black text-paidhu-maroon">₹{parseFloat(prod.price).toFixed(0)}</span>
                                            <span className="text-sm text-gray-400 line-through font-bold">₹{(parseFloat(prod.price) * 1.2).toFixed(0)}</span>
                                            <span className="bg-paidhu-mint text-paidhu-teal text-[10px] font-black px-2 py-1 rounded-lg">20% OFF</span>
                                        </div>
                                    </div>

                                    {/* Add to Cart Footer */}
                                    <div className="mt-6">
                                        <button 
                                            onClick={() => addToCart(prod)}
                                            className="w-full bg-paidhu-maroon text-white py-4 rounded-2xl font-brand font-bold text-lg flex items-center justify-between px-6 hover:bg-paidhu-maroon/90 transition-all shadow-lg hover:-translate-y-1 active:scale-95 border-b-4 border-paidhu-maroon/50"
                                        >
                                            <span>Add To Cart</span>
                                            <Plus className="w-6 h-6 border-2 border-white/30 rounded-lg p-0.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-[32px] p-12 text-center border-2 border-paidhu-peach border-dashed flex flex-col items-center justify-center min-h-[400px]">
                            <div className="w-24 h-24 bg-paidhu-cream rounded-full flex items-center justify-center mb-6">
                                <Search className="w-10 h-10 text-paidhu-maroon opacity-50" />
                            </div>
                            <h3 className="text-2xl font-brand font-bold text-paidhu-slate mb-2">No products found</h3>
                            <p className="text-gray-500 font-medium">Try adjusting your category filters or search query.</p>
                            <button 
                                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSortOrder('featured'); }}
                                className="mt-8 px-8 py-3 bg-paidhu-peach text-paidhu-maroon font-brand font-bold rounded-full hover:bg-paidhu-peach/80 transition-colors"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
