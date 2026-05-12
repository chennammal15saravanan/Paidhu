import React, { useState, useEffect } from 'react';
import {
    Heart, ShoppingCart, Menu, ArrowRight, Leaf, ShieldCheck,
    Sun, Star, Camera, Globe, Search,
    X, Sparkles, Droplets, User, LayoutDashboard, Smile,
    Plus, Trash2, Gift, ChevronRight, ChevronDown
} from 'lucide-react';
import AdminDashboard from './AdminDashboard';
import ShopAllView from './ShopAllView';

interface LandingPageProps {
    onStart?: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
    const API_URL = "http://localhost:5000";
    const [scrolled, setScrolled] = useState(false);
    const [currentView, setCurrentView] = useState<'home' | 'shopAll'>('home');
    const [selectedShopCategory, setSelectedShopCategory] = useState<string>('All');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Auth & View States
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
    const [loginRole, setLoginRole] = useState<'customer' | 'admin'>('customer');
    const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
    const [isAdminView, setIsAdminView] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Product-Based Login State
    const [selectedProductForLogin, setSelectedProductForLogin] = useState<any>(null);

    // Data States
    const [products, setProducts] = useState<any[]>([]);
    const [adminProducts, setAdminProducts] = useState<any[]>([]);

    // Forms
    const [authFormData, setAuthFormData] = useState({ fullName: '', email: '', phone: '', password: '' });
    const [authMessage, setAuthMessage] = useState({ type: '', text: '' });



    // eCommerce State
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [cart, setCart] = useState<any[]>(() => {
        const savedCart = localStorage.getItem('paidhu_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [wishlist, setWishlist] = useState<any[]>(() => {
        const savedWishlist = localStorage.getItem('paidhu_wishlist');
        return savedWishlist ? JSON.parse(savedWishlist) : [];
    });
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);
    const [activeDetailTab, setActiveDetailTab] = useState('description');
    const [activeTab, setActiveTab] = useState('Bestsellers');

    // FAQ States & Data
    const [activeFaqTab, setActiveFaqTab] = useState('Orders & Payments');
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

    const faqTabsList = ['Orders & Payments', 'Shipping & Delivery', 'Returns & Refunds', 'General Queries'];
    const faqsData: Record<string, { q: string, a: string }[]> = {
        'Orders & Payments': [
            { q: "How do I place an order on Paidhu?", a: "You can place an order easily by browsing our products, adding your favorites to the cart, and proceeding to checkout. We offer a seamless and secure checkout process." },
            { q: "What payment methods do you accept?", a: "We accept all major credit/debit cards, UPI, net banking, and popular mobile wallets." },
            { q: "Can I change or cancel my order after placing it?", a: "Orders can be canceled or modified within 2 hours of placing them. Please contact our support team immediately if you need to make changes." },
            { q: "Do I need an account to place an order?", a: "No, you can place an order as a guest. However, creating an account helps you track orders easily and enjoy faster checkouts." },
            { q: "I didn't receive my order confirmation. What should I do?", a: "Please check your spam or promotions folder. If you still can't find it, contact our support team." },
            { q: "My payment failed, but the amount was deducted. What now?", a: "Don't worry! If your payment failed but the amount was deducted, it will automatically be refunded to your original payment method within 3-5 business days." }
        ],
        'Shipping & Delivery': [
            { q: "What are your shipping charges?", a: "We offer free shipping on all orders above ₹999. For orders below that, a nominal shipping fee is applied at checkout." },
            { q: "How long does delivery take?", a: "Orders are typically delivered within 3-5 business days, depending on your location." }
        ],
        'Returns & Refunds': [
            { q: "What is your return policy?", a: "We accept returns within 7 days of delivery for unopened and undamaged products. Please refer to our full Return Policy for details." }
        ],
        'General Queries': [
            { q: "Are your products 100% natural?", a: "Yes! All Paidhu products are made with 100% natural ingredients, free from preservatives and artificial additives." }
        ]
    };

    useEffect(() => {
        localStorage.setItem('paidhu_cart', JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        localStorage.setItem('paidhu_wishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    const addToCart = (product: any, size?: string) => {
        const cartItem = {
            ...product,
            selectedSize: size || (Array.isArray(product.sizes) ? product.sizes[0] : ''),
            cartId: `${product.id}-${Date.now()}`
        };
        setCart([...cart, cartItem]);
        setIsCartOpen(true);
        setSelectedProduct(null);
    };

    const removeFromCart = (cartId: string) => {
        setCart(cart.filter(item => item.cartId !== cartId));
    };

    const toggleWishlist = (product: any) => {
        const isInWishlist = wishlist.find(item => item.id === product.id);
        if (isInWishlist) {
            setWishlist(wishlist.filter(item => item.id !== product.id));
        } else {
            setWishlist([...wishlist, product]);
        }
    };

    const cartTotal = cart.reduce((acc, item) => acc + parseFloat(item.price), 0);

    // Premium Brand Assets from paidhu.com
    const images = {
        logo: "https://paidhu.com/wp-content/uploads/2025/07/paidhu-logo-meroon.png",
        hero: "https://paidhu.com/wp-content/uploads/2025/11/Thumbnail-6.jpg",
        saffron: "https://paidhu.com/wp-content/uploads/2024/12/Saffron-2-300x300.png",
        tea: "https://paidhu.com/wp-content/uploads/2025/07/Medley-Teas-300x300.jpg",
        bloom: "https://paidhu.com/wp-content/uploads/2024/12/Bloom-Powder-2-300x300.png",
        cookies: "https://paidhu.com/wp-content/uploads/2025/07/Paidhu-Cookies-300x300.jpg",
        jam: "https://paidhu.com/wp-content/uploads/2025/04/cassia--300x300.jpg"
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        fetchProducts();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (isAdminView && currentUser?.role === 'admin') {
            fetchAdminProducts();
        }
    }, [isAdminView, currentUser]);

    const fetchProducts = async () => {
        try {
            const res = await fetch(`${API_URL}/api/products/active`);
            const data = await res.json();
            setProducts(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch active products", err);
        }
    };

    const fetchAdminProducts = async () => {
        try {
            const token = localStorage.getItem('paidhu_token');
            const res = await fetch(`${API_URL}/api/products/all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setAdminProducts(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch admin products", err);
        }
    };

    // --- SUBMISSION HANDLERS ---
    const handleAuthSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthMessage({ type: 'info', text: 'Processing...' });

        if (selectedProductForLogin && authMode === 'login') {
            try {
                const res = await fetch(`${API_URL}/api/product-access/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: authFormData.email, password: authFormData.password, productId: selectedProductForLogin.id })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Authentication failed');

                localStorage.setItem('paidhu_token', data.token);
                setCurrentUser(data.user);
                setIsLoginModalOpen(false);
                setSelectedProductForLogin(null);
                alert(`Yay! You've unlocked ${selectedProductForLogin.name}.`);
                return;
            } catch (err: any) {
                setAuthMessage({ type: 'error', text: err.message });
                return;
            }
        }

        const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
        const payload = authMode === 'login'
            ? { email: authFormData.email, password: authFormData.password, role: loginRole }
            : { fullName: authFormData.fullName, email: authFormData.email, phone: authFormData.phone, password: authFormData.password, role: loginRole };

        try {
            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Authentication failed');

            if (authMode === 'login') {
                localStorage.setItem('paidhu_token', data.token);
                setCurrentUser(data.user);
                setIsLoginModalOpen(false);
                if (data.user.role === 'admin') setIsAdminView(true);
            } else {
                setAuthMessage({ type: 'success', text: 'Yay! Registered successfully! Please login.' });
                setAuthMode('login');
            }
        } catch (err: any) {
            setAuthMessage({ type: 'error', text: err.message });
        }
    };

    // Helper to parse JSON fields safely
    const parseField = (field: any) => {
        if (!field) return [];
        if (Array.isArray(field)) return field;
        try {
            return JSON.parse(field);
        } catch (e) {
            return String(field).split(',').map(s => s.trim());
        }
    };

    const triggerProductLogin = (product: any) => {
        setSelectedProductForLogin(product);
        setLoginRole('customer');
        setAuthMode('login');
        setIsLoginModalOpen(true);
    };

    const SlurpForm = () => {
        const [step, setStep] = useState(1);
        const [formData, setFormData] = useState({ name: '', interest: '', message: '' });

        const nextStep = () => setStep(step + 1);

        return (
            <div className="relative overflow-hidden rounded-[40px] p-1 lg:p-2 bg-white/30 backdrop-blur-xl border-4 border-white shadow-2xl">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-paidhu-yellow/40 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-paidhu-maroon/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                
                <div className="relative z-10 bg-white rounded-[32px] p-8 lg:p-12 min-h-[400px] flex flex-col justify-center">
                    {step === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-4">
                                <span className="inline-block px-4 py-1.5 bg-paidhu-mint text-paidhu-teal rounded-full text-xs font-bold uppercase tracking-widest">Step 01</span>
                                <h3 className="text-4xl lg:text-5xl font-brand font-bold text-paidhu-slate">Hello! What's <br/><span className="text-paidhu-teal">your name?</span></h3>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Type your name here..." 
                                className="w-full text-2xl lg:text-3xl font-brand font-medium border-b-4 border-paidhu-peach focus:border-paidhu-teal outline-none py-4 bg-transparent transition-all"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                onKeyPress={(e) => e.key === 'Enter' && formData.name && nextStep()}
                            />
                            {formData.name && (
                                <button onClick={nextStep} className="flex items-center gap-3 bg-paidhu-maroon text-white px-8 py-4 rounded-2xl font-brand font-bold text-lg hover:bg-paidhu-maroon/90 transition-all group shadow-lg">
                                    Continue <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            )}
                        </div>
                    )}
                    {step === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-4">
                                <span className="inline-block px-4 py-1.5 bg-paidhu-peach text-paidhu-maroon rounded-full text-xs font-bold uppercase tracking-widest">Step 02</span>
                                <h3 className="text-4xl lg:text-5xl font-brand font-bold text-paidhu-slate">Nice to meet you, {formData.name}! What are you <span className="text-paidhu-maroon">interested in?</span></h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {['Saffron Powder', 'Kashmiri Saffron', 'Bloom Cookies', 'Wellness Teas'].map((opt) => (
                                    <button 
                                        key={opt}
                                        onClick={() => { setFormData({ ...formData, interest: opt }); nextStep(); }}
                                        className={`p-6 rounded-2xl border-4 font-brand font-bold text-xl transition-all text-left ${formData.interest === opt ? 'border-paidhu-maroon bg-paidhu-mint text-paidhu-maroon' : 'border-paidhu-peach hover:border-paidhu-yellow bg-white'}`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {step === 3 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-4">
                                <span className="inline-block px-4 py-1.5 bg-paidhu-mint text-paidhu-teal rounded-full text-xs font-bold uppercase tracking-widest">Step 03</span>
                                <h3 className="text-4xl lg:text-5xl font-brand font-bold text-paidhu-slate">Any special <br/><span className="text-paidhu-yellow drop-shadow-sm">requests?</span></h3>
                            </div>
                            <textarea 
                                placeholder="Type your message here..." 
                                className="w-full text-xl font-brand font-medium border-b-4 border-paidhu-peach focus:border-paidhu-yellow outline-none py-4 bg-transparent transition-all min-h-[150px]"
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            />
                            <button onClick={nextStep} className="w-full bg-paidhu-maroon text-white py-5 rounded-2xl font-brand font-bold text-xl shadow-xl hover:-translate-y-1 transition-all border-b-4 border-paidhu-maroon/50">
                                Slurp it up! 🚀
                            </button>
                        </div>
                    )}
                    {step === 4 && (
                        <div className="text-center space-y-8 animate-in zoom-in duration-500">
                            <div className="w-32 h-32 bg-paidhu-mint rounded-full flex items-center justify-center mx-auto mb-6">
                                <Sparkles className="w-16 h-16 text-paidhu-teal" />
                            </div>
                            <h3 className="text-5xl font-brand font-bold text-paidhu-slate">Thanks, {formData.name}!</h3>
                            <p className="text-xl text-gray-500 font-bold max-w-sm mx-auto">We've slurped your request and our team will get back to you within 24 hours.</p>
                            <button onClick={() => setStep(1)} className="text-paidhu-maroon font-brand font-bold hover:underline">Send another request</button>
                        </div>
                    )}

                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-paidhu-cream font-sans text-paidhu-slate overflow-x-hidden">

            <style>{`
                .font-brand { font-family: 'Fredoka', sans-serif; }
                .font-sans { font-family: 'Nunito', sans-serif; }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .blob-shape { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; animation: morph 8s ease-in-out infinite; }
                @keyframes morph {
                    0%, 100% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
                    34% { border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%; }
                    67% { border-radius: 100% 60% 60% 100% / 100% 100% 60% 60%; }
                }
                .slurp-bg {
                    background: radial-gradient(circle at 50% 50%, var(--paidhu-yellow) 0%, var(--paidhu-maroon) 100%);
                    animation: slurp-pulse 10s ease infinite;
                }

                @keyframes slurp-pulse {
                    0%, 100% { transform: scale(1) rotate(0deg); }
                    50% { transform: scale(1.05) rotate(2deg); }
                }
                
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 20s linear infinite;
                    width: max-content;
                }
                .animate-marquee-slow {
                    animation: marquee 35s linear infinite;
                    width: max-content;
                }
                .animate-marquee-slow:hover {
                    animation-play-state: paused;
                }
            `}</style>

            {/* ── PLAYFUL ANNOUNCEMENT BAR ── */}
            {!isAdminView && (
                <div className="bg-paidhu-maroon text-white py-2.5 text-sm font-bold text-center tracking-wide relative z-[60]">
                    🎉 Free Shipping on All Happy Healthy Orders Over ₹999! 🥳
                </div>
            )}


            {/* ── REARRANGED NAVIGATION (Slurrp Farm Style) ── */}
            <nav className={`sticky z-50 transition-all duration-300 top-0 ${scrolled || isAdminView ? 'bg-white shadow-md' : 'bg-paidhu-cream'} border-b border-paidhu-peach`}>
                {/* ROW 1: SEARCH | LOGO | ACTIONS */}
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-8">
                    {/* Search Bar (Left) */}
                    {!isAdminView && (
                        <div className="hidden md:flex flex-1 items-center max-w-xs relative group">
                            <div className="absolute left-4 text-gray-400 group-focus-within:text-paidhu-maroon transition-colors">
                                <Search className="w-4 h-4" />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Search for yummies..." 
                                className="w-full pl-11 pr-4 py-2.5 bg-white border-2 border-paidhu-peach rounded-full text-sm font-bold focus:outline-none focus:border-paidhu-maroon transition-all shadow-sm"
                            />
                        </div>
                    )}
                    
                    {/* Mobile Menu Button (Mobile Only) */}
                    {!isAdminView && (
                        <button className="lg:hidden text-paidhu-maroon bg-white p-2 rounded-full shadow-sm" onClick={() => setMobileMenuOpen(true)}>
                            <Menu className="w-6 h-6" />
                        </button>
                    )}

                    {/* Logo (Center) */}
                    <div className="flex-1 flex justify-center">
                        <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('home'); }} className="flex items-center justify-center transition-transform hover:scale-105">
                            <img src={images.logo} alt="Paidhu" className="h-10 md:h-14 object-contain" />
                        </a>
                        {isAdminView && (
                            <div className="hidden sm:flex items-center gap-2 border-l-2 border-paidhu-peach pl-4 ml-4">
                                <LayoutDashboard className="w-5 h-5 text-paidhu-maroon" />
                                <span className="font-brand font-bold text-paidhu-maroon text-lg tracking-wide">Admin</span>
                            </div>
                        )}
                    </div>

                    {/* Action Icons (Right) */}
                    <div className="flex-1 flex justify-end items-center gap-3 lg:gap-4">
                        {currentUser?.role === 'admin' && (
                            <button
                                onClick={() => setIsAdminView(!isAdminView)}
                                className="hidden sm:flex items-center gap-1.5 text-xs font-bold bg-paidhu-yellow px-4 py-2 rounded-full text-paidhu-slate hover:bg-paidhu-yellow/80 transition-colors shadow-sm font-brand"
                            >
                                {isAdminView ? 'Shop' : 'Admin'}
                            </button>
                        )}

                        <div className="relative">
                            <button onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)} className="bg-white p-2.5 rounded-full shadow-sm text-paidhu-maroon hover:bg-paidhu-mint transition-colors">
                                <User className="w-5 h-5" />
                            </button>
                            {isAccountDropdownOpen && (
                                <div className="absolute right-0 mt-3 w-56 bg-white border-2 border-paidhu-peach rounded-2xl shadow-xl py-2 z-50">
                                    {currentUser ? (
                                        <>
                                            <div className="px-5 py-3 border-b-2 border-paidhu-peach bg-paidhu-cream">
                                                <p className="font-brand font-bold text-paidhu-slate truncate">{currentUser.name}</p>
                                                <p className="text-xs font-bold text-paidhu-maroon uppercase tracking-wider">{currentUser.role}</p>
                                            </div>
                                            <button onClick={() => { setCurrentUser(null); localStorage.removeItem('paidhu_token'); setIsAccountDropdownOpen(false); setIsAdminView(false); }} className="block w-full text-left px-5 py-3 text-sm font-bold text-paidhu-slate hover:bg-paidhu-maroon hover:text-white transition-colors">Logout 👋</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => { setLoginRole('customer'); setIsLoginModalOpen(true); setIsAccountDropdownOpen(false); }} className="block w-full text-left px-5 py-3 text-sm font-bold text-paidhu-slate hover:bg-paidhu-maroon hover:text-white transition-colors">Customer Login</button>
                                            <button onClick={() => { setLoginRole('admin'); setIsLoginModalOpen(true); setIsAccountDropdownOpen(false); }} className="block w-full text-left px-5 py-3 text-sm font-bold text-paidhu-slate hover:bg-paidhu-yellow transition-colors">Admin Login</button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        <button onClick={() => setIsWishlistOpen(true)} className="bg-white p-2.5 rounded-full shadow-sm text-paidhu-maroon hover:bg-paidhu-mint transition-colors relative">
                            <Heart className={`w-5 h-5 ${wishlist.length > 0 ? 'fill-paidhu-maroon' : ''}`} />
                            {wishlist.length > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-paidhu-teal text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">{wishlist.length}</span>
                            )}
                        </button>

                        <button onClick={() => setIsCartOpen(true)} className="bg-white p-2.5 rounded-full shadow-sm text-paidhu-maroon hover:bg-paidhu-mint transition-colors relative">
                            <ShoppingCart className="w-5 h-5" />
                            {cart.length > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-paidhu-maroon text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">{cart.length}</span>
                            )}
                        </button>
                    </div>
                </div>

                {/* ROW 2: NAVIGATION LINKS (Desktop) */}
                {!isAdminView && (
                    <div className="hidden lg:block bg-white/50 backdrop-blur-sm border-t border-paidhu-peach">
                        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap justify-center items-center gap-x-10 gap-y-3">
                            {[
                                'Shop All', 'Deal of the Day', 'Shop by Category', 'For your Family', 
                                'Starting Floral Food Habitat', 'BYOC', 'Our Community', 
                                'Our Philosophy', 'Bulk Orders', 'Blogs', 'About Us'
                            ].map((item) => (
                                <a 
                                    key={item} 
                                    href="#" 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        const lowerItem = item.toLowerCase();
                                        if (lowerItem.includes('shop all') || lowerItem.includes('shop by category')) {
                                            setSelectedShopCategory('All');
                                            setCurrentView('shopAll');
                                        }
                                    }}
                                    className="font-brand text-[13px] font-bold text-paidhu-slate hover:text-paidhu-maroon transition-colors uppercase tracking-wider"
                                >
                                    {item}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </nav>

            {/* Mobile Menu Overlay */}
            <div className={`fixed inset-0 bg-paidhu-slate/40 backdrop-blur-sm z-[70] transition-opacity duration-300 lg:hidden ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setMobileMenuOpen(false)}>
                <div className={`absolute left-0 top-0 bottom-0 w-4/5 max-w-sm bg-white p-8 transition-transform duration-500 ease-out flex flex-col rounded-r-3xl ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`} onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-10">
                        <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('home'); setMobileMenuOpen(false); }}>
                            <img src={images.logo} alt="Paidhu" className="h-8 object-contain" />
                        </a>
                        <button onClick={() => setMobileMenuOpen(false)} className="bg-paidhu-peach p-2 rounded-full"><X className="w-6 h-6 text-paidhu-maroon" /></button>
                    </div>
                    <div className="flex flex-col gap-5 text-lg font-brand font-bold overflow-y-auto hide-scrollbar">
                        {[
                            'Shop All', 'Deal of the Day', 'Shop by Category', 'For your Family', 
                            'Starting Floral Food Habitat', 'BYOC', 'Our Community', 
                            'Our Philosophy', 'Bulk Orders', 'Blogs', 'About Us'
                        ].map((item) => (
                            <a 
                                key={item} 
                                href="#" 
                                onClick={(e) => {
                                    e.preventDefault();
                                    const lowerItem = item.toLowerCase();
                                    if (lowerItem.includes('shop all') || lowerItem.includes('shop by category')) {
                                        setSelectedShopCategory('All');
                                        setCurrentView('shopAll');
                                        setMobileMenuOpen(false);
                                    }
                                }}
                                className="text-paidhu-slate hover:text-paidhu-maroon"
                            >
                                {item}
                            </a>
                        ))}
                        <button 
                            onClick={() => { setIsWishlistOpen(true); setMobileMenuOpen(false); }}
                            className="text-left text-paidhu-slate hover:text-paidhu-teal flex items-center gap-2 border-t-2 border-paidhu-peach pt-4"
                        >
                            <Heart className={`w-5 h-5 ${wishlist.length > 0 ? 'fill-paidhu-teal text-paidhu-teal' : ''}`} />
                            My Wishlist {wishlist.length > 0 && `(${wishlist.length})`}
                        </button>
                        {currentUser?.role === 'admin' && (
                            <button onClick={() => { setIsAdminView(true); setMobileMenuOpen(false); }} className="text-left text-paidhu-yellow font-bold border-t-2 border-paidhu-peach pt-6 mt-4">Admin Panel</button>
                        )}
                    </div>

                </div>
            </div>

            {/* ── ADMIN DASHBOARD VIEW ── */}
            {isAdminView ? (
                <AdminDashboard 
                    adminProducts={adminProducts} 
                    fetchProducts={() => { fetchProducts(); fetchAdminProducts(); }} 
                />
            ) : currentView === 'shopAll' ? (
                <ShopAllView 
                    products={products} 
                    wishlist={wishlist} 
                    addToCart={addToCart} 
                    toggleWishlist={toggleWishlist} 
                    initialCategory={selectedShopCategory}
                />
            ) : (
                /* ── STOREFRONT RENDERER ── */
                <>
                    {/* HERO SECTION - Playful & Vibrant */}
                    <section className="relative min-h-[90vh] flex items-center pt-24 pb-32 overflow-hidden bg-paidhu-yellow">
                        {/* Wavy bottom divider */}
                        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-20">
                            <svg className="relative block w-full h-[80px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,112.56,189.92,98.33,235.18,87.52,279.71,71.4,321.39,56.44Z" fill="var(--paidhu-cream)"></path>
                            </svg>
                        </div>

                        {/* Decorative Blobs */}
                        <div className="absolute top-20 right-10 w-64 h-64 bg-paidhu-teal blob-shape opacity-20"></div>
                        <div className="absolute bottom-40 left-10 w-48 h-48 bg-paidhu-maroon blob-shape opacity-20" style={{ animationDelay: '2s' }}></div>

                        <div className="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-12 lg:gap-8 items-center relative z-10">
                            <div className="space-y-8 text-center lg:text-left pt-10 lg:pt-0">
                                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white shadow-sm border-2 border-paidhu-slate/10 mx-auto lg:mx-0 transform -rotate-2">
                                    <Sparkles className="w-4 h-4 text-paidhu-maroon" />
                                    <span className="text-sm font-bold uppercase tracking-widest text-paidhu-slate font-brand">Real Food. Real Love.</span>
                                </div>
                                <h1 className="text-6xl lg:text-8xl font-brand font-bold text-paidhu-slate leading-[1.05] tracking-tight drop-shadow-sm">
                                    Floral <br />
                                    <span className="text-paidhu-maroon">Wellness.</span>
                                </h1>
                                <p className="text-xl text-paidhu-slate/80 max-w-md mx-auto lg:mx-0 font-bold leading-relaxed">
                                    Experience the pure essence of Kashmir with our hand-picked Saffron and 100% natural floral delights.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center gap-5 justify-center lg:justify-start pt-6">
                                    <button 
                                        onClick={() => { setSelectedShopCategory('All'); setCurrentView('shopAll'); }}
                                        className="w-full sm:w-auto px-10 py-5 bg-paidhu-maroon text-white text-lg font-brand font-bold tracking-wide hover:bg-paidhu-maroon/90 hover:-translate-y-1 transition-all shadow-lg rounded-2xl border-b-4 border-paidhu-maroon/50"
                                    >
                                        Shop Saffron
                                    </button>
                                    <button className="w-full sm:w-auto px-10 py-5 bg-white text-paidhu-slate text-lg font-brand font-bold tracking-wide hover:bg-gray-50 hover:-translate-y-1 transition-all shadow-lg rounded-2xl border-b-4 border-gray-200 flex items-center justify-center gap-2 group">
                                        Our Story
                                        <ArrowRight className="w-5 h-5 text-paidhu-maroon group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>

                            <div className="relative h-[600px] w-full hidden lg:block">
                                <div className="absolute top-1/2 right-10 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-white shadow-xl border-8 border-paidhu-peach z-10 overflow-hidden">
                                    <img src={images.cookies} alt="Healthy Cookies" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                                </div>
                                <div className="absolute top-20 right-80 bg-white px-6 py-4 rounded-3xl shadow-xl z-30 flex items-center gap-3 border-2 border-paidhu-mint rotate-6 hover:rotate-0 transition-transform cursor-pointer">
                                    <div className="w-12 h-12 bg-paidhu-mint rounded-full flex items-center justify-center">
                                        <ShieldCheck className="w-6 h-6 text-paidhu-teal" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-brand font-bold text-paidhu-slate">No Maida!</p>
                                    </div>
                                </div>
                                <div className="absolute bottom-20 right-0 bg-paidhu-maroon px-6 py-4 rounded-3xl shadow-xl z-30 flex items-center gap-3 border-2 border-white -rotate-6 hover:rotate-0 transition-transform cursor-pointer">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                                        <Heart className="w-6 h-6 text-paidhu-maroon fill-paidhu-maroon" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-brand font-bold text-white">100% Natural</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ── SHOP BY COLLECTION (Tabbed Products) ── */}
                    <section className="py-20 px-6 bg-white overflow-hidden">
                        <div className="max-w-7xl mx-auto space-y-12">
                            {/* Collection Tabs */}
                            <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start overflow-x-auto hide-scrollbar pb-4">
                                {['Bestsellers', 'New Launches', 'Deals of the Day', 'Pure Saffron', 'Medley Teas', 'Bloom Cookies', 'Petal Jams'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-8 py-3 rounded-full font-brand font-bold text-sm transition-all whitespace-nowrap shadow-sm border-2 ${
                                            activeTab === tab 
                                            ? 'bg-paidhu-maroon text-white border-paidhu-maroon scale-105' 
                                            : 'bg-paidhu-cream text-paidhu-slate border-paidhu-peach hover:bg-paidhu-peach'
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {/* Product List / Carousel */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                {products
                                    .filter(p => activeTab === 'Bestsellers' || activeTab === 'New Launches' || activeTab === 'Deals of the Day' || p.category === activeTab)
                                    .slice(0, 4)
                                    .map((prod) => (
                                        <div key={prod.id} className="group flex flex-col bg-paidhu-cream/30 rounded-[32px] p-5 border-2 border-paidhu-peach/20 hover:border-paidhu-maroon/20 hover:shadow-xl transition-all duration-500 relative">
                                            {/* Badge */}
                                            <div className="absolute top-4 left-4 z-10 bg-paidhu-yellow text-paidhu-slate text-[10px] font-black uppercase px-3 py-1.5 rounded-full shadow-sm tracking-widest">
                                                {activeTab === 'Bestsellers' ? 'Top Rated' : 'Just In'}
                                            </div>

                                            {/* Image */}
                                            <div className="aspect-square w-full mb-6 bg-white rounded-[24px] overflow-hidden p-6 relative group-hover:bg-paidhu-cream transition-colors duration-500">
                                                <img src={prod.image_url || images.saffron} alt={prod.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                                                
                                                {/* Wishlist Toggle */}
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleWishlist(prod);
                                                    }}
                                                    className="absolute top-3 right-3 bg-white/80 backdrop-blur-md p-2 rounded-full shadow-sm hover:scale-110 transition-transform"
                                                >
                                                    <Heart className={`w-4 h-4 ${wishlist.some(item => item.id === prod.id) ? 'fill-paidhu-maroon text-paidhu-maroon' : 'text-gray-400'}`} />
                                                </button>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 space-y-3 px-1">
                                                <h4 className="font-brand font-bold text-paidhu-slate text-lg line-clamp-1 group-hover:text-paidhu-maroon transition-colors">{prod.name}</h4>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl font-brand font-bold text-paidhu-maroon">₹{parseFloat(prod.price).toFixed(0)}</span>
                                                    <span className="text-sm text-gray-400 line-through font-bold">₹{(parseFloat(prod.price) * 1.2).toFixed(0)}</span>
                                                    <span className="bg-paidhu-mint text-paidhu-teal text-[10px] font-black px-2 py-1 rounded-lg">20% OFF</span>
                                                </div>
                                            </div>

                                            {/* Add to Cart Footer */}
                                            <div className="mt-6">
                                                <button 
                                                    onClick={() => addToCart(prod)}
                                                    className="w-full bg-paidhu-maroon text-white py-4 rounded-2xl font-brand font-bold flex items-center justify-between px-6 hover:bg-paidhu-maroon/90 transition-all shadow-lg hover:-translate-y-1 active:scale-95"
                                                >
                                                    <span>Add To Cart</span>
                                                    <Plus className="w-6 h-6 border-2 border-white/30 rounded-lg p-0.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                            </div>

                            {/* View All Footer */}
                            <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-paidhu-peach/30 gap-6">
                                <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('shopAll'); }} className="flex items-center gap-4 bg-paidhu-cream px-8 py-3 rounded-full font-brand font-bold text-paidhu-slate hover:bg-paidhu-peach transition-all group">
                                    View All {activeTab} Products
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                                </a>
                                <div className="flex gap-4">
                                    <button className="w-12 h-12 rounded-full border-2 border-paidhu-peach flex items-center justify-center text-paidhu-maroon hover:bg-paidhu-peach transition-all"><ArrowRight className="w-6 h-6 rotate-180" /></button>
                                    <button className="w-12 h-12 rounded-full border-2 border-paidhu-peach flex items-center justify-center text-paidhu-maroon hover:bg-paidhu-peach transition-all"><ArrowRight className="w-6 h-6" /></button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ── SCROLLING MARQUEE BANNER ── */}
                    <div className="bg-[#C1272D] text-white py-4 relative flex overflow-hidden whitespace-nowrap w-full">
                        <div className="animate-marquee flex items-center">
                            {Array.from({ length: 4 }).map((_, groupIndex) => (
                                <div key={groupIndex} className="flex items-center gap-12 px-6">
                                    {[
                                        { text: "No Maida", icon: <ShieldCheck className="w-6 h-6" /> },
                                        { text: "Made with Millets", icon: <Leaf className="w-6 h-6" /> },
                                        { text: "No Preservatives", icon: <Droplets className="w-6 h-6" /> },
                                        { text: "100% Natural", icon: <Star className="w-6 h-6" /> },
                                        { text: "No Refined Sugar", icon: <Sparkles className="w-6 h-6" /> },
                                    ].map((item, i) => (
                                        <span key={i} className="flex items-center gap-2 font-brand font-black text-xl tracking-wide uppercase drop-shadow-sm">
                                            {item.icon} {item.text}
                                        </span>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── PREMIUM CATEGORIES (Slurrp Farm Style) ── */}
                    <section className="py-20 px-6 bg-white relative">
                        <div className="max-w-7xl mx-auto space-y-10">
                            {/* Header Section */}
                            <div className="flex flex-col items-center justify-center space-y-2">
                                <h2 className="text-4xl md:text-5xl font-brand font-black text-[#5C4033] tracking-wide">Explore Category</h2>
                            </div>

                            {/* Categories Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                                {[
                                    { title: 'PURE\nSAFFRON', cat: 'Pure Saffron', img: images.saffron, bg: 'bg-[#FCA5B9]', textColor: 'text-[#4A3B32]' },
                                    { title: 'BLOOM\nCOOKIES', cat: 'Bloom Cookies', img: images.cookies, bg: 'bg-[#F9C846]', textColor: 'text-[#4A3B32]' },
                                    { title: 'MEDLEY\nTEAS', cat: 'Medley Teas', img: images.tea, bg: 'bg-[#93D5F0]', textColor: 'text-[#4A3B32]' },
                                    { title: 'PETAL\nJAMS', cat: 'Petal Jams', img: images.jam, bg: 'bg-[#6D4C41]', textColor: 'text-white' },
                                    { title: 'WELLNESS\nPOWDERS', cat: 'Wellness Powders', img: images.bloom, bg: 'bg-[#9DCB60]', textColor: 'text-[#4A3B32]' },
                                    { title: 'GIFT\nHAMPERS', cat: 'Gift Hampers', img: images.saffron, bg: 'bg-[#EF3D4A]', textColor: 'text-white' },
                                    { title: 'KIDS\nSPECIAL', cat: 'Kids Special', img: images.cookies, bg: 'bg-[#C2A38D]', textColor: 'text-[#4A3B32]' },
                                    { title: 'HEALTHY\nSNACKS', cat: 'Healthy Snacks', img: images.tea, bg: 'bg-[#F2C051]', textColor: 'text-[#4A3B32]' },
                                ].map((cat, i) => (
                                    <div 
                                        key={i} 
                                        onClick={() => { setSelectedShopCategory(cat.cat); setCurrentView('shopAll'); }}
                                        className={`group relative flex items-center rounded-2xl cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden h-[130px] md:h-[150px] ${cat.bg}`}
                                    >
                                        <div className="w-[50%] h-full relative overflow-hidden flex items-center justify-center">
                                            {/* Enlarged image positioned to overlap */}
                                            <img src={cat.img} alt={cat.title.replace('\n', ' ')} className="absolute w-[130%] h-[130%] max-w-none object-cover object-center mix-blend-multiply group-hover:scale-110 transition-transform duration-700 -left-2" />
                                        </div>
                                        <div className="w-[50%] pr-4 pl-1 flex flex-col justify-center z-10">
                                            <h3 className={`font-brand font-black text-xl md:text-[22px] leading-[1.05] ${cat.textColor} uppercase whitespace-pre-line drop-shadow-sm`}>
                                                {cat.title}
                                            </h3>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* View More Button */}
                            <div className="flex justify-center pt-6">
                                <button className="flex items-center gap-3 border-2 border-gray-300 bg-white text-[#4A3B32] px-8 py-3 rounded-full font-brand font-bold hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm group">
                                    View More
                                    <svg className="w-5 h-5 text-gray-500 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* ── REAL-LIFE SOLUTIONS (Bento Grid) ── */}
                    <section className="py-20 px-6 bg-paidhu-cream/30 relative overflow-hidden">
                        <div className="max-w-7xl mx-auto space-y-12">
                            {/* Header Section */}
                            <div className="flex flex-col items-center justify-center space-y-1 text-center">
                                <h2 className="text-4xl md:text-5xl font-brand font-black text-[#C1272D] tracking-wide drop-shadow-sm">Real-Life Solutions</h2>
                                <h3 className="text-2xl md:text-3xl font-brand font-black text-[#5C4033]">For Indian Families</h3>
                            </div>

                            {/* Bento Grid */}
                            <div className="flex flex-col lg:flex-row gap-6">
                                {/* Left Side (Pink + Blue + Yellow) */}
                                <div className="flex flex-col flex-[1.5] gap-6">
                                    {/* Top Pink Box */}
                                    <div className="bg-[#FCA5B9] rounded-[32px] p-8 flex items-center justify-end relative overflow-hidden h-[250px] cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
                                        {/* Placeholder for Spoon image */}
                                        <div className="absolute -left-16 top-1/2 -translate-y-1/2 w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>
                                        <img src={images.jam} alt="Slurrp It Up" className="absolute -left-10 top-1/2 -translate-y-1/2 w-64 h-64 object-cover mix-blend-multiply opacity-90 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700 rounded-full" />
                                        
                                        <div className="relative z-10 text-right space-y-2">
                                            <h4 className="text-4xl md:text-5xl font-brand font-black text-[#5C4033] tracking-wide">Slurrp It Up</h4>
                                            <p className="text-lg md:text-xl font-sans text-[#5C4033]/80 font-bold">Your ultimate starting solids guide</p>
                                        </div>
                                    </div>

                                    {/* Bottom Row (Blue & Yellow) */}
                                    <div className="flex flex-col sm:flex-row gap-6 h-auto sm:h-[250px]">
                                        {/* Blue Box - WhatsApp / Community */}
                                        <div className="flex-1 bg-[#93D5F0] rounded-[32px] p-6 md:p-8 relative overflow-hidden flex flex-col justify-end cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
                                            <div className="absolute top-6 left-6 bg-white p-3 rounded-full shadow-md z-10 group-hover:scale-110 transition-transform">
                                                <svg className="w-10 h-10 text-green-500" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.66-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                                            </div>
                                            <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-white/20 rounded-full blur-2xl"></div>
                                            <h4 className="text-3xl md:text-4xl font-brand font-black text-[#C1272D] relative z-10 text-right drop-shadow-sm">Join Our<br/>Community</h4>
                                        </div>

                                        {/* Yellow Box - Easy / Pancakes */}
                                        <div className="flex-1 bg-[#F9C846] rounded-[32px] p-6 md:p-8 relative overflow-hidden flex flex-col justify-end cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
                                            <img src={images.cookies} alt="Easy Pancakes" className="absolute -left-8 -top-8 w-48 h-48 object-cover mix-blend-multiply opacity-80 group-hover:scale-110 transition-transform duration-700 rounded-full" />
                                            <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/20 rounded-full blur-2xl"></div>
                                            <h4 className="text-3xl md:text-4xl font-brand font-black text-[#C1272D] relative z-10 text-right drop-shadow-sm">Quick &<br/>Easy</h4>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side (Orange Tall Box) */}
                                <div className="flex-1 bg-[#F2C051] rounded-[32px] p-8 md:p-10 relative overflow-hidden min-h-[300px] lg:min-h-[524px] flex flex-col justify-end cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
                                    <div className="absolute -right-20 top-0 w-full h-full bg-white/10 rounded-full blur-3xl"></div>
                                    <img src={images.bloom} alt="Travel Friendly Products" className="absolute -right-10 md:-right-20 top-10 w-72 md:w-[450px] h-72 md:h-[450px] object-contain group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-700" />
                                    
                                    <div className="relative z-10 text-right mt-auto pt-48 lg:pt-0">
                                        <h4 className="text-4xl md:text-5xl font-brand font-black text-[#5C4033] tracking-wide drop-shadow-sm">Travel</h4>
                                        <p className="text-xl font-brand font-bold text-[#5C4033]/80 mt-1">On-the-go wellness</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ── VIDEO SECTION (Real Food, Really Easy) ── */}
                    <section className="py-24 px-6 relative overflow-hidden bg-[#FDCB33]">
                        {/* Decorative Clouds */}
                        <svg className="absolute top-12 left-4 md:left-20 w-32 md:w-48 h-auto text-white opacity-90 drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.5 19c2.485 0 4.5-2.015 4.5-4.5S19.985 10 17.5 10c-.17 0-.336.015-.498.041C16.402 7.72 14.372 6 12 6c-2.373 0-4.402 1.72-4.998 4.041-.162-.026-.328-.041-.498-.041-2.485 0-4.5 2.015-4.5 4.5S4.015 19 6.5 19h11z"/>
                        </svg>
                        <svg className="absolute bottom-12 right-4 md:right-20 w-40 md:w-64 h-auto text-white opacity-90 drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.5 19c2.485 0 4.5-2.015 4.5-4.5S19.985 10 17.5 10c-.17 0-.336.015-.498.041C16.402 7.72 14.372 6 12 6c-2.373 0-4.402 1.72-4.998 4.041-.162-.026-.328-.041-.498-.041-2.485 0-4.5 2.015-4.5 4.5S4.015 19 6.5 19h11z"/>
                        </svg>

                        <div className="max-w-5xl mx-auto space-y-12 relative z-10 text-center">
                            {/* Title */}
                            <h2 className="text-5xl md:text-7xl font-brand font-black drop-shadow-sm tracking-wide">
                                <span className="text-[#C1272D]">Real Food, </span>
                                <span className="text-[#5C4033]">Really Easy</span>
                            </h2>

                            {/* Video Container */}
                            <div className="relative w-full aspect-video bg-[#5C4033] rounded-[40px] shadow-2xl overflow-hidden border-8 border-white/50 group cursor-pointer transition-transform duration-500 hover:scale-[1.02]">
                                {/* Placeholder Video (Chromecast Sample) */}
                                <video 
                                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                                    loop 
                                    muted 
                                    autoPlay 
                                    playsInline
                                >
                                    <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                                
                                {/* Play Button Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-20 h-20 md:w-28 md:h-28 bg-white rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                                        <svg className="w-10 h-10 md:w-14 md:h-14 text-[#C1272D] ml-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M4 4l12 6-12 6z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ── FLORAL INGREDIENTS SECTION ── */}
                    <section className="py-24 px-6 relative overflow-hidden bg-[#FDFBF7]">
                        {/* Decorative flowers in corners (using icons as placeholders) */}
                        <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 opacity-20 pointer-events-none">
                            <svg className="w-64 h-64 text-paidhu-maroon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-.9 0-1.7.3-2.3.8-1-.8-2.3-1.2-3.7-1.2-3.3 0-6 2.7-6 6 0 1.4.4 2.7 1.2 3.7-.5.6-.8 1.4-.8 2.3 0 2.2 1.8 4 4 4 1.4 0 2.7-.4 3.7-1.2.6.5 1.4.8 2.3.8s1.7-.3 2.3-.8c1 .8 2.3 1.2 3.7 1.2 3.3 0 6-2.7 6-6 0-1.4-.4-2.7-1.2-3.7.5-.6.8-1.4.8-2.3 0-2.2-1.8-4-4-4-1.4 0-2.7.4-3.7 1.2-.6-.5-1.4-.8-2.3-.8zm0 2c.6 0 1.2.2 1.7.5-1.1.9-1.7 2.3-1.7 3.5 0 1.2.6 2.6 1.7 3.5-.5.3-1.1.5-1.7.5s-1.2-.2-1.7-.5c1.1-.9 1.7-2.3 1.7-3.5 0-1.2-.6-2.6-1.7-3.5.5-.3 1.1-.5 1.7-.5z"/></svg>
                        </div>
                        <div className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 opacity-20 pointer-events-none">
                            <svg className="w-64 h-64 text-paidhu-yellow" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-.9 0-1.7.3-2.3.8-1-.8-2.3-1.2-3.7-1.2-3.3 0-6 2.7-6 6 0 1.4.4 2.7 1.2 3.7-.5.6-.8 1.4-.8 2.3 0 2.2 1.8 4 4 4 1.4 0 2.7-.4 3.7-1.2.6.5 1.4.8 2.3.8s1.7-.3 2.3-.8c1 .8 2.3 1.2 3.7 1.2 3.3 0 6-2.7 6-6 0-1.4-.4-2.7-1.2-3.7.5-.6.8-1.4.8-2.3 0-2.2-1.8-4-4-4-1.4 0-2.7.4-3.7 1.2-.6-.5-1.4-.8-2.3-.8zm0 2c.6 0 1.2.2 1.7.5-1.1.9-1.7 2.3-1.7 3.5 0 1.2.6 2.6 1.7 3.5-.5.3-1.1.5-1.7.5s-1.2-.2-1.7-.5c1.1-.9 1.7-2.3 1.7-3.5 0-1.2-.6-2.6-1.7-3.5.5-.3 1.1-.5 1.7-.5z"/></svg>
                        </div>

                        <div className="max-w-7xl mx-auto space-y-16 relative z-10">
                            {/* Header Section */}
                            <div className="flex flex-col items-center justify-center space-y-2 text-center">
                                <h2 className="text-6xl md:text-7xl font-brand font-black text-[#C1272D] tracking-wide uppercase">FLORAL INGREDIENTS</h2>
                                <h3 className="text-3xl md:text-4xl font-brand font-black text-[#5C4033]">Are Nature's Hidden Superfoods</h3>
                            </div>

                            {/* Carousel / Grid Container */}
                            <div className="relative flex items-center justify-center w-full">
                                {/* Left Arrow */}
                                <button className="absolute left-0 lg:-left-6 w-14 h-14 bg-[#C1272D] hover:bg-[#A01E22] text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:-translate-x-1 z-20">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                                </button>

                                {/* Cards Flex Row */}
                                <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-8 px-16 w-full">
                                    {/* Card 1 */}
                                    <div className="relative w-full max-w-[320px] rounded-[32px] overflow-hidden bg-[#FAD9B9] min-h-[420px] shadow-sm transform lg:-rotate-3 hover:rotate-0 transition-transform duration-300">
                                        {/* U-Shape Cutout Illusion */}
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-44 h-24 bg-[#FDFBF7] rounded-b-full overflow-hidden flex items-end justify-center z-10 shadow-inner">
                                            <img src={images.saffron} alt="Saffron" className="w-32 h-32 object-cover rounded-full mix-blend-multiply translate-y-4" />
                                        </div>
                                        
                                        <div className="pt-32 p-8 text-center flex flex-col items-center h-full">
                                            <h3 className="text-4xl font-brand font-black text-[#5C4033] leading-[1.1] mb-2 uppercase tracking-wide drop-shadow-sm">KASHMIRI<br/>SAFFRON</h3>
                                            <p className="text-[#5C4033]/80 font-bold text-lg mb-8">AKA Red Gold</p>
                                            
                                            <div className="mt-auto pt-6 border-t-2 border-[#5C4033]/10 w-full">
                                                <p className="text-[#5C4033] font-bold text-lg leading-snug">Richest source of <span className="text-[#C1272D] font-black">antioxidants</span> among all spices</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card 2 */}
                                    <div className="relative w-full max-w-[320px] rounded-[32px] overflow-hidden bg-[#FCA5B9] min-h-[450px] shadow-xl lg:z-10 transform lg:scale-105 hover:scale-110 transition-transform duration-300">
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-28 bg-[#FDFBF7] rounded-b-full overflow-hidden flex items-end justify-center z-10 shadow-inner">
                                            <img src={images.bloom} alt="Rose Petals" className="w-36 h-36 object-cover rounded-full mix-blend-multiply translate-y-6" />
                                        </div>
                                        
                                        <div className="pt-36 p-8 text-center flex flex-col items-center h-full">
                                            <h3 className="text-[40px] font-brand font-black text-[#5C4033] leading-[1.1] mb-2 uppercase tracking-wide drop-shadow-sm">ROSE<br/>PETALS</h3>
                                            <p className="text-[#5C4033]/80 font-bold text-lg mb-8">AKA Gulab or Taruni</p>
                                            
                                            <div className="mt-auto pt-6 border-t-2 border-[#5C4033]/10 w-full">
                                                <p className="text-[#5C4033] font-bold text-lg leading-snug">Natural coolant that aids <span className="text-[#5C4033] font-black">digestion</span> and glowing skin</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card 3 */}
                                    <div className="relative w-full max-w-[320px] rounded-[32px] overflow-hidden bg-[#F2C051] min-h-[420px] shadow-sm transform lg:rotate-3 hover:rotate-0 transition-transform duration-300">
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-44 h-24 bg-[#FDFBF7] rounded-b-full overflow-hidden flex items-end justify-center z-10 shadow-inner">
                                            <img src={images.tea} alt="Chamomile" className="w-32 h-32 object-cover rounded-full mix-blend-multiply translate-y-4" />
                                        </div>
                                        
                                        <div className="pt-32 p-8 text-center flex flex-col items-center h-full">
                                            <h3 className="text-4xl font-brand font-black text-[#5C4033] leading-[1.1] mb-2 uppercase tracking-wide drop-shadow-sm">CHAMOMILE<br/>FLOWERS</h3>
                                            <p className="text-[#5C4033]/80 font-bold text-lg mb-8">AKA Babuna</p>
                                            
                                            <div className="mt-auto pt-6 border-t-2 border-[#5C4033]/10 w-full">
                                                <p className="text-[#5C4033] font-bold text-lg leading-snug">Has calming properties for <span className="text-[#C1272D] font-black">better sleep</span> and relaxation</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Arrow */}
                                <button className="absolute right-0 lg:-right-6 w-14 h-14 bg-[#C1272D] hover:bg-[#A01E22] text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:translate-x-1 z-20">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* ── SCROLLING TESTIMONIALS (Happy Lifestyles) ── */}
                    <section className="pt-24 pb-16 relative overflow-hidden bg-[#FDFBF7]">
                        {/* Wavy Yellow Background */}
                        <div className="absolute bottom-0 w-full h-[40%] bg-[#FDCB33] z-0">
                            <svg className="absolute bottom-full left-0 w-full h-[60px] md:h-[120px] text-[#FDCB33]" viewBox="0 0 1440 100" fill="currentColor" preserveAspectRatio="none">
                                <path d="M0,50 C320,150 420,-50 1440,50 L1440,100 L0,100 Z"></path>
                            </svg>
                        </div>

                        {/* Top Decorations (Teapot & Utensils Illusions) */}
                        <div className="absolute top-0 left-10 md:left-20 w-24 md:w-32 opacity-30 pointer-events-none">
                            <svg viewBox="0 0 100 100" className="w-full h-full text-[#5C4033]" fill="currentColor"><circle cx="30" cy="80" r="15" fill="none" stroke="currentColor" strokeWidth="4"/><path d="M30 65 L40 0" stroke="currentColor" strokeWidth="4"/><circle cx="70" cy="85" r="10" fill="none" stroke="currentColor" strokeWidth="4"/><path d="M70 75 L60 0" stroke="currentColor" strokeWidth="4"/></svg>
                        </div>
                        <div className="absolute top-4 right-10 md:right-20 w-32 md:w-48 opacity-40 pointer-events-none text-[#93D5F0]">
                            <svg viewBox="0 0 100 100" className="w-full h-full" fill="currentColor"><path d="M20 90 L80 90 L75 50 L25 50 Z"/><path d="M75 50 C90 50 90 70 75 70" fill="none" stroke="currentColor" strokeWidth="8"/><circle cx="50" cy="30" r="10"/><path d="M50 40 L50 50" stroke="currentColor" strokeWidth="8"/></svg>
                        </div>

                        <div className="relative z-10 space-y-16">
                            {/* Title */}
                            <div className="flex flex-col items-center justify-center space-y-1 text-center px-6">
                                <h2 className="text-5xl md:text-6xl font-brand font-black text-[#C1272D] tracking-wide drop-shadow-sm">For Happy Healthy</h2>
                                <h3 className="text-6xl md:text-7xl font-brand font-black text-[#5C4033] uppercase drop-shadow-md">LIFESTYLES!</h3>
                            </div>

                            {/* Scrolling Container */}
                            <div className="relative flex overflow-hidden whitespace-nowrap w-full py-10 px-4">
                                <div className="animate-marquee-slow flex items-center">
                                    {Array.from({ length: 2 }).map((_, groupIndex) => (
                                        <div key={groupIndex} className="flex items-center gap-8 md:gap-16 px-4 md:px-8 shrink-0">
                                            {[
                                                { name: 'RAVALI', text: "Paidhu's Kashmiri Saffron has become a part of our daily routine. The quality is exceptional, and it adds such beautiful color and flavor to our food!", image: images.saffron, pin: 'bg-[#93D5F0]', tilt: '-rotate-2' },
                                                { name: 'AAKANKSHA', text: "I choose Paidhu not just for the pure taste, but also for the peace of mind it gives me knowing everything is 100% natural and ethically sourced.", image: images.bloom, pin: 'bg-[#C1272D]', tilt: 'rotate-3' },
                                                { name: 'KARUNA ARORA', text: "The Chamomile tea is everywhere in our kitchen! It's so calming and has become my favorite evening ritual for relaxation.", image: images.tea, pin: 'bg-[#93D5F0]', tilt: '-rotate-1' },
                                                { name: 'NADIA', text: "Absolutely love the petal jams! They have a wonderful range of yummy and healthy products that are perfect for our family.", image: images.jam, pin: 'bg-[#C1272D]', tilt: 'rotate-2' },
                                            ].map((review, i) => (
                                                <div key={i} className={`relative shrink-0 inline-block w-[320px] md:w-[380px] bg-white p-4 md:p-5 pb-8 rounded-lg shadow-xl whitespace-normal transform transition-transform hover:scale-105 hover:z-30 duration-300 cursor-pointer ${review.tilt} z-10`}>
                                                    {/* Pin */}
                                                    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full shadow-md z-20 ${review.pin} border-2 border-white`}></div>
                                                    
                                                    {/* Photo */}
                                                    <div className="w-full h-[220px] md:h-[260px] bg-gray-100 rounded overflow-hidden mb-6 relative border-[6px] border-white shadow-inner">
                                                        <img src={review.image} alt={review.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    
                                                    {/* Text */}
                                                    <p className="text-gray-600 font-bold text-sm md:text-base leading-relaxed mb-6 font-sans">
                                                        "{review.text}"
                                                    </p>
                                                    
                                                    {/* Name */}
                                                    <div className="text-right">
                                                        <p className="font-brand font-black text-xl text-[#C1272D] uppercase tracking-wide">{review.name}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ── REAL MOMS, REAL TALK COMMUNITY SECTION ── */}
                    <section className="bg-[#FDCB33] py-16 md:py-0 w-full overflow-hidden relative">
                        <div className="max-w-[1500px] mx-auto flex flex-col md:flex-row items-stretch justify-between min-h-[500px] lg:min-h-[600px]">
                            {/* Left Content */}
                            <div className="flex-[1.2] px-6 md:pl-16 lg:pl-32 py-16 md:py-24 z-10 flex flex-col justify-center">
                                <h2 className="text-6xl md:text-8xl font-brand font-black text-[#5C4033] tracking-wide mb-4 drop-shadow-sm">Real Moms, Real Talk</h2>
                                <h3 className="text-2xl md:text-4xl font-brand font-black text-[#C1272D] mb-8 leading-snug">Need a supportive parenting group <br className="hidden md:block"/> to talk to?</h3>
                                
                                <div className="w-full max-w-2xl h-px bg-[#5C4033]/30 mb-10"></div>
                                
                                <ul className="space-y-5 mb-14 text-[#5C4033] font-bold text-xl md:text-2xl font-sans">
                                    <li className="flex items-center gap-5">
                                        <div className="w-5 h-5 rounded-full bg-[#C1272D] flex-shrink-0 shadow-sm"></div>
                                        <span>Connect with moms in your city</span>
                                    </li>
                                    <li className="flex items-center gap-5">
                                        <div className="w-5 h-5 rounded-full bg-[#C1272D] flex-shrink-0 shadow-sm"></div>
                                        <span>Tips from local experts</span>
                                    </li>
                                    <li className="flex items-center gap-5">
                                        <div className="w-5 h-5 rounded-full bg-[#C1272D] flex-shrink-0 shadow-sm"></div>
                                        <span>Exclusive meet-ups</span>
                                    </li>
                                    <li className="flex items-start gap-5">
                                        <div className="w-5 h-5 rounded-full bg-[#C1272D] flex-shrink-0 mt-1 shadow-sm"></div>
                                        <span>3 groups for different ages: First Bites, Toddler Meals and Tiffin Recipes</span>
                                    </li>
                                </ul>
                                
                                <div className="inline-flex">
                                    <button className="bg-[#C1272D] hover:bg-[#A01E22] text-white flex items-center rounded-xl overflow-hidden shadow-xl transition-transform hover:scale-105 active:scale-95 group">
                                        <div className="bg-[#9B1D21] p-4 flex items-center justify-center">
                                            <Gift className="w-6 h-6 md:w-8 md:h-8" />
                                        </div>
                                        <div className="px-6 md:px-8 py-4 font-brand font-black text-xl tracking-wide flex items-center gap-2">
                                            Join Now
                                            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </button>
                                </div>
                            </div>
                            
                            {/* Right Image Container (Organic Blob Shape) */}
                            <div className="flex-1 min-h-[400px] md:min-h-full relative mt-8 md:mt-0">
                                <div className="absolute inset-y-0 right-0 w-[120%] md:w-[130%] bg-gray-200 md:rounded-l-[400px] overflow-hidden shadow-2xl transform">
                                    <img src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=1200" alt="Supportive Community Meetup" className="w-full h-full object-cover object-center" />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ── FAQS SECTION ── */}
                    <section className="py-24 px-6 bg-[#FDFBF7] relative">
                        <div className="max-w-5xl mx-auto space-y-10">
                            {/* Header */}
                            <div className="text-center space-y-4">
                                <h2 className="text-5xl md:text-6xl font-brand font-black text-[#C1272D] uppercase tracking-wide drop-shadow-sm">FAQs</h2>
                                <p className="text-[#5C4033] font-bold text-lg md:text-xl">Find answers to your most common questions</p>
                            </div>

                            {/* Tabs */}
                            <div className="flex flex-wrap justify-center gap-3 md:gap-4 pt-4">
                                {faqTabsList.map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => {
                                            setActiveFaqTab(tab);
                                            setOpenFaqIndex(null);
                                        }}
                                        className={`px-6 py-2.5 rounded-full font-brand font-bold text-sm md:text-base transition-all shadow-sm border ${
                                            activeFaqTab === tab 
                                            ? 'bg-[#9B1D21] text-white border-[#9B1D21]' 
                                            : 'bg-white text-[#5C4033] border-gray-300 hover:border-[#C1272D]'
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {/* Accordion List */}
                            <div className="bg-[#F8F8F8] border border-gray-300 rounded-xl overflow-hidden mt-8 shadow-sm">
                                {faqsData[activeFaqTab].map((faq, index) => (
                                    <div key={index} className="border-b border-gray-300 last:border-0 bg-[#F4F4F4] hover:bg-white transition-colors">
                                        <button
                                            onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                                            className="w-full flex items-center justify-between p-5 md:p-6 text-left outline-none"
                                        >
                                            <span className="font-brand font-bold text-lg text-black">{faq.q}</span>
                                            <ChevronDown className={`w-6 h-6 text-black transition-transform duration-300 ${openFaqIndex === index ? 'rotate-180' : ''}`} />
                                        </button>
                                        
                                        {/* Expandable Content */}
                                        <div 
                                            className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaqIndex === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                                        >
                                            <div className="p-5 md:p-6 pt-0 text-gray-700 font-sans font-medium leading-relaxed bg-white border-t border-gray-100">
                                                {faq.a}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ── SLURP FORM SECTION ── */}
                    <section className="py-24 px-6 relative overflow-hidden">
                        <div className="absolute inset-0 slurp-bg opacity-10"></div>
                        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
                            <div className="space-y-8">
                                <h2 className="text-5xl lg:text-6xl font-brand font-bold text-paidhu-slate leading-tight">
                                    Got Questions? <br/>
                                    <span className="text-paidhu-teal">Let's Chat!</span>
                                </h2>
                                <p className="text-xl text-gray-500 font-bold leading-relaxed max-w-lg">
                                    Whether you're curious about our Kashmiri Saffron or want to know more about our floral teas, we're here to help.
                                </p>
                                <div className="flex flex-col gap-6">
                                    <div className="flex items-center gap-4 bg-white p-6 rounded-3xl border-2 border-paidhu-peach shadow-sm">
                                        <div className="w-12 h-12 bg-paidhu-mint rounded-full flex items-center justify-center">
                                            <Sparkles className="w-6 h-6 text-paidhu-teal" />
                                        </div>
                                        <p className="text-lg font-brand font-bold text-paidhu-slate">Pure & Hand-picked Quality</p>
                                    </div>
                                    <div className="flex items-center gap-4 bg-white p-6 rounded-3xl border-2 border-paidhu-peach shadow-sm">
                                        <div className="w-12 h-12 bg-paidhu-peach rounded-full flex items-center justify-center">
                                            <Heart className="w-6 h-6 text-paidhu-maroon" />
                                        </div>
                                        <p className="text-lg font-brand font-bold text-paidhu-slate">100% Ethical & Sustainable</p>
                                    </div>
                                </div>
                            </div>
                            <SlurpForm />
                        </div>
                    </section>


                    {/* ── DYNAMIC PRODUCTS (BESTSELLERS) ── */}
                    <section className="py-24 px-6 bg-white relative overflow-hidden">
                        {/* Wavy top divider */}
                        <div className="absolute top-0 left-0 right-0 w-full overflow-hidden leading-none z-20 rotate-180">
                            <svg className="relative block w-full h-[60px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,112.56,189.92,98.33,235.18,87.52,279.71,71.4,321.39,56.44Z" fill="var(--paidhu-cream)"></path>
                            </svg>
                        </div>


                        <div className="max-w-7xl mx-auto space-y-16 mt-10">
                            <div className="flex flex-col md:flex-row justify-between items-end gap-6 pb-6">
                                <div className="space-y-3">
                                    <h2 className="text-5xl font-brand font-bold text-paidhu-slate">Bestselling Yummies</h2>
                                    <p className="text-paidhu-slate/70 font-bold text-lg">The absolute favorites, loved by kids and approved by moms!</p>
                                </div>
                                <button 
                                    onClick={() => { setSelectedShopCategory('All'); setCurrentView('shopAll'); }}
                                    className="bg-paidhu-peach text-paidhu-slate px-6 py-3 rounded-full font-brand font-bold hover:bg-paidhu-yellow transition-colors shadow-sm"
                                >
                                    View All Products
                                </button>
                            </div>


                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                {products.length === 0 ? (
                                    <div className="col-span-full text-center py-16 bg-paidhu-cream rounded-3xl border-2 border-dashed border-paidhu-peach">
                                        <Smile className="w-16 h-16 text-paidhu-yellow mx-auto mb-4" />
                                        <p className="text-paidhu-slate font-brand font-bold text-2xl">No products yet! Admin needs to add some yummies.</p>
                                    </div>
                                ) : (
                                    products.map((prod, i) => (
                                        <div key={i} className="group flex flex-col bg-white rounded-[32px] p-4 shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-paidhu-peach relative cursor-pointer" onClick={() => setSelectedProduct(prod)}>
                                            <div className="relative aspect-square overflow-hidden bg-paidhu-cream mb-5 rounded-2xl">
                                                {prod.on_sale && (
                                                    <div className="absolute top-3 left-3 bg-paidhu-maroon text-white text-[10px] font-brand font-bold uppercase tracking-widest px-4 py-1.5 rounded-full z-10 shadow-md animate-pulse">
                                                        ON SALE!
                                                    </div>
                                                )}
                                                {prod.category === 'Petal Jam' && (
                                                    <div className="absolute top-3 right-3 bg-paidhu-teal text-white text-[10px] font-brand font-bold uppercase tracking-widest px-3 py-1.5 rounded-full z-10 shadow-sm">
                                                        Natural Bloom
                                                    </div>
                                                )}
                                                <img src={prod.image_url || images.saffron} alt={prod.name} className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500" />
                                                
                                                {/* WISHLIST TOGGLE */}
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleWishlist(prod);
                                                    }}
                                                    className="absolute top-3 right-3 z-20 bg-white/80 backdrop-blur-md p-2 rounded-full shadow-sm hover:scale-110 transition-transform border border-paidhu-peach"
                                                >
                                                    <Heart className={`w-4 h-4 ${wishlist.some(item => item.id === prod.id) ? 'fill-paidhu-maroon text-paidhu-maroon' : 'text-gray-400'}`} />
                                                </button>

                                                {/* QUICK VIEW OVERLAY */}
                                                <div className="absolute inset-0 bg-paidhu-slate/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <div className="bg-white text-paidhu-slate px-6 py-2.5 rounded-full font-brand font-bold text-sm shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                                        Quick View
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col flex-1 px-2">
                                                <div className="flex items-center gap-1 mb-2">
                                                    {[...Array(5)].map((_, j) => (
                                                        <Star key={j} className={`w-3.5 h-3.5 ${j < 5 ? 'text-paidhu-yellow fill-paidhu-yellow' : 'text-gray-200'}`} />
                                                    ))}
                                                    <span className="text-[10px] font-bold text-gray-400 ml-1">(12 reviews)</span>
                                                </div>
                                                <h3 className="text-lg font-brand font-bold text-paidhu-slate mb-1 line-clamp-2 leading-tight group-hover:text-paidhu-maroon transition-colors">{prod.name}</h3>
                                                <p className="text-[11px] font-bold text-paidhu-teal uppercase tracking-wider mb-4">{prod.category}</p>

                                                <div className="mt-auto flex items-center justify-between">
                                                    <div className="flex flex-col">
                                                        {prod.on_sale && prod.original_price && (
                                                            <span className="text-xs text-gray-400 line-through font-bold">₹{parseFloat(prod.original_price).toFixed(0)}</span>
                                                        )}
                                                        <p className="text-xl font-brand font-bold text-paidhu-slate">₹{parseFloat(prod.price).toFixed(0)}</p>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            addToCart(prod);
                                                        }}
                                                        className="w-10 h-10 bg-paidhu-maroon text-white rounded-xl flex items-center justify-center shadow-md hover:bg-paidhu-maroon/90 hover:rotate-6 transition-all"
                                                    >
                                                        <Plus className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}

                            </div>
                        </div>
                    </section>

                    {/* FOOTER */}
                    <footer className="bg-paidhu-slate text-white pt-24 pb-12 px-6 rounded-t-[60px] mt-10">
                        <div className="max-w-7xl mx-auto space-y-16">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-8">
                                <div className="space-y-6 md:col-span-1">
                                    <div className="bg-white p-3 rounded-2xl inline-block">
                                        <img src={images.logo} alt="Paidhu" className="h-10 object-contain" />
                                    </div>
                                    <p className="text-white/80 text-base font-bold leading-relaxed max-w-xs">
                                        Making healthy eating super fun for kids and absolutely guilt-free for parents!
                                    </p>
                                </div>
                                <div className="space-y-6">
                                    <h4 className="text-sm font-brand font-bold uppercase tracking-widest text-paidhu-yellow">Shop Yummies</h4>
                                    <ul className="space-y-4">
                                        {['All Products', 'Cereals', 'Pancakes', 'Milk Mixes', 'Combos'].map(link => (
                                            <li key={link}>
                                                <a 
                                                    href="#" 
                                                    onClick={(e) => { e.preventDefault(); setSelectedShopCategory('All'); setCurrentView('shopAll'); }}
                                                    className="text-base font-bold text-white/80 hover:text-paidhu-maroon transition-colors"
                                                >
                                                    {link}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="space-y-6">
                                    <h4 className="text-sm font-brand font-bold uppercase tracking-widest text-paidhu-yellow">Get in Touch</h4>
                                    <ul className="space-y-4 text-base font-bold text-white/80">
                                        <li>hello@paidhu.com</li>
                                        <li>1-800-YUMMY</li>
                                        <li className="pt-4 flex gap-4">
                                            <a href="#" className="bg-white/10 p-3 rounded-full hover:bg-paidhu-maroon transition-colors"><Camera className="w-5 h-5 text-white" /></a>
                                            <a href="#" className="bg-white/10 p-3 rounded-full hover:bg-paidhu-teal transition-colors"><Globe className="w-5 h-5 text-white" /></a>
                                        </li>
                                    </ul>
                                </div>

                            </div>
                            <div className="pt-8 border-t-2 border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-bold text-white/50">
                                <p>© {new Date().getFullYear()} Paidhu Wellness. All rights reserved.</p>
                            </div>
                        </div>
                    </footer>
                </>
            )}

            {/* AUTH MODAL */}
            {isLoginModalOpen && (
                <div className="fixed inset-0 bg-paidhu-slate/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden transform transition-all border-4 border-paidhu-peach">
                        <div className="bg-paidhu-yellow px-8 py-5 flex justify-between items-center text-paidhu-slate">
                            <div className="flex items-center gap-3">
                                <Smile className="w-8 h-8 text-paidhu-maroon" />
                                <h2 className="font-brand text-2xl font-bold">
                                    {selectedProductForLogin ? `Unlock Module` : (loginRole === 'admin' ? 'Admin Portal' : 'Welcome!')}
                                </h2>
                            </div>
                            <button onClick={() => { setIsLoginModalOpen(false); setSelectedProductForLogin(null); }} className="hover:bg-white/50 p-2 rounded-full transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-8">
                            {selectedProductForLogin && (
                                <div className="bg-paidhu-mint border-2 border-paidhu-teal/30 text-paidhu-teal text-sm p-4 rounded-2xl mb-6 font-bold text-center font-brand">
                                    Log in to unlock the fun {selectedProductForLogin.name} module! ✨
                                </div>
                            )}

                            <div className="flex border-b-4 border-paidhu-peach mb-8">
                                <button onClick={() => setAuthMode('login')} className={`flex-1 pb-3 text-lg font-brand font-bold border-b-4 -mb-1 transition-colors ${authMode === 'login' ? 'border-paidhu-maroon text-paidhu-maroon' : 'border-transparent text-gray-400'}`}>Login</button>
                                <button onClick={() => setAuthMode('register')} className={`flex-1 pb-3 text-lg font-brand font-bold border-b-4 -mb-1 transition-colors ${authMode === 'register' ? 'border-paidhu-maroon text-paidhu-maroon' : 'border-transparent text-gray-400'}`}>Register</button>
                            </div>

                            <form className="space-y-5" onSubmit={handleAuthSubmit}>
                                {authMessage.text && (
                                    <div className={`p-4 rounded-xl text-sm font-bold border-2 ${authMessage.type === 'error' ? 'bg-red-50 text-paidhu-maroon border-red-100' : 'bg-paidhu-mint text-paidhu-teal border-paidhu-teal/30'}`}>{authMessage.text}</div>
                                )}
                                {authMode === 'register' && (
                                    <div><label className="block text-xs font-bold text-paidhu-slate uppercase tracking-wider mb-2">Full Name</label><input type="text" value={authFormData.fullName} onChange={e => setAuthFormData({ ...authFormData, fullName: e.target.value })} required className="w-full px-5 py-4 bg-paidhu-cream border-2 border-paidhu-peach focus:border-paidhu-yellow outline-none rounded-2xl font-bold transition-colors" /></div>
                                )}
                                <div><label className="block text-xs font-bold text-paidhu-slate uppercase tracking-wider mb-2">Email ID</label><input type="email" value={authFormData.email} onChange={e => setAuthFormData({ ...authFormData, email: e.target.value })} required className="w-full px-5 py-4 bg-paidhu-cream border-2 border-paidhu-peach focus:border-paidhu-yellow outline-none rounded-2xl font-bold transition-colors" /></div>
                                {authMode === 'register' ? (
                                    <>
                                        <div><label className="block text-xs font-bold text-paidhu-slate uppercase tracking-wider mb-2">Phone Number</label><input type="tel" value={authFormData.phone} onChange={e => setAuthFormData({ ...authFormData, phone: e.target.value })} required className="w-full px-5 py-4 bg-paidhu-cream border-2 border-paidhu-peach focus:border-paidhu-yellow outline-none rounded-2xl font-bold transition-colors" /></div>
                                        <div><label className="block text-xs font-bold text-paidhu-slate uppercase tracking-wider mb-2">Password</label><input type="password" value={authFormData.password} onChange={e => setAuthFormData({ ...authFormData, password: e.target.value })} required className="w-full px-5 py-4 bg-paidhu-cream border-2 border-paidhu-peach focus:border-paidhu-yellow outline-none rounded-2xl font-bold transition-colors" /></div>
                                    </>
                                ) : (
                                    <div><label className="block text-xs font-bold text-paidhu-slate uppercase tracking-wider mb-2">Password</label><input type="password" value={authFormData.password} onChange={e => setAuthFormData({ ...authFormData, password: e.target.value })} required className="w-full px-5 py-4 bg-paidhu-cream border-2 border-paidhu-peach focus:border-paidhu-yellow outline-none rounded-2xl font-bold transition-colors" /></div>
                                )}
                                <button type="submit" className="w-full bg-paidhu-maroon text-white font-brand font-bold text-lg py-5 rounded-2xl hover:bg-paidhu-maroon/90 hover:-translate-y-1 transition-all mt-8 shadow-lg border-b-4 border-paidhu-maroon/50">
                                    {selectedProductForLogin ? 'Gain Access' : (authMode === 'login' ? 'Login Securely' : 'Join the Family')}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}


            {/* PRODUCT DETAIL MODAL */}
            {selectedProduct && (
                <div className="fixed inset-0 bg-paidhu-slate/60 backdrop-blur-md z-[150] flex items-center justify-center p-4 lg:p-10">
                    <div className="bg-paidhu-cream rounded-[40px] shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col lg:flex-row border-8 border-white relative animate-in zoom-in-95 duration-300">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-30 bg-white shadow-md p-3 rounded-full hover:bg-red-50 transition-colors">
                            <X className="w-6 h-6 text-paidhu-maroon" />
                        </button>


                        {/* Left: Gallery */}
                        <div className="lg:w-1/2 bg-white p-8 lg:p-12 flex flex-col">
                            <div className="flex-1 bg-paidhu-cream rounded-3xl overflow-hidden mb-6 flex items-center justify-center p-10 relative">
                                {selectedProduct.on_sale && (
                                    <div className="absolute top-5 left-5 bg-paidhu-maroon text-white font-brand font-bold px-6 py-2 rounded-full shadow-lg z-10 rotate-12">ON SALE!</div>
                                )}
                                <img src={selectedProduct.image_url} alt={selectedProduct.name} className="max-w-full max-h-full object-contain" />
                            </div>
                            <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                                {[selectedProduct.image_url, ...parseField(selectedProduct.gallery_images)].map((img, idx) => (
                                    <div key={idx} className="w-24 h-24 bg-paidhu-cream rounded-2xl flex-shrink-0 border-2 border-transparent hover:border-paidhu-yellow cursor-pointer overflow-hidden p-2 transition-all">
                                        <img src={img} className="w-full h-full object-contain" />
                                    </div>
                                ))}
                            </div>
                        </div>


                        {/* Right: Info */}
                        <div className="lg:w-1/2 p-8 lg:p-12 overflow-y-auto custom-scrollbar flex flex-col">
                            <div className="space-y-6 flex-1">
                                <div className="space-y-2">
                                    <p className="text-paidhu-teal font-brand font-bold uppercase tracking-widest text-sm">{selectedProduct.category}</p>
                                    <h2 className="text-4xl lg:text-5xl font-brand font-bold text-paidhu-slate leading-tight">{selectedProduct.name}</h2>
                                    <div className="flex items-center gap-4 pt-2">
                                        <div className="flex gap-1">
                                            {[...Array(5)].map((_, j) => <Star key={j} className="w-5 h-5 text-paidhu-yellow fill-paidhu-yellow" />)}
                                        </div>
                                        <span className="text-sm font-bold text-gray-400">5.0 (24 Customer Reviews)</span>
                                    </div>
                                </div>


                                <div className="flex items-baseline gap-4">
                                    {selectedProduct.on_sale && selectedProduct.original_price && (
                                        <span className="text-2xl text-gray-400 line-through font-bold">₹{parseFloat(selectedProduct.original_price).toFixed(0)}</span>
                                    )}
                                    <p className="text-5xl font-brand font-bold text-paidhu-maroon">₹{parseFloat(selectedProduct.price).toFixed(0)}</p>
                                </div>


                                <p className="text-lg text-paidhu-slate/70 leading-relaxed font-bold">{selectedProduct.short_description}</p>


                                {/* Tabs */}
                                <div className="pt-8">
                                    <div className="flex border-b-2 border-gray-100 gap-8 mb-6">
                                        {['description', 'additional', 'benefits'].map(tab => (
                                            <button
                                                key={tab}
                                                onClick={() => setActiveDetailTab(tab)}
                                                className={`pb-4 text-sm font-brand font-bold uppercase tracking-widest transition-all relative ${activeDetailTab === tab ? 'text-paidhu-teal' : 'text-gray-400'}`}
                                            >
                                                {tab}
                                                {activeDetailTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-paidhu-teal rounded-full" />}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="text-paidhu-slate/80 font-bold leading-relaxed animate-in fade-in duration-500">

                                        {activeDetailTab === 'description' && <p>{selectedProduct.description || 'No description provided.'}</p>}
                                        {activeDetailTab === 'additional' && (
                                            <div className="space-y-4">
                                                {parseField(selectedProduct.additional_info).length > 0 ? (
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {parseField(selectedProduct.additional_info).map((info: string, idx: number) => (
                                                            <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border-2 border-gray-50">{info}</div>
                                                        ))}
                                                    </div>
                                                ) : <p>No additional information available.</p>}
                                            </div>
                                        )}
                                        {activeDetailTab === 'benefits' && (
                                            <ul className="space-y-3">
                                                {parseField(selectedProduct.benefits).map((b: string, i: number) => (
                                                    <li key={i} className="flex items-center gap-3"><div className="w-2 h-2 bg-paidhu-yellow rounded-full" /> {b}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-10 flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => addToCart(selectedProduct)}
                                    className="flex-1 bg-paidhu-teal text-white py-5 rounded-2xl text-xl font-brand font-bold shadow-xl hover:bg-paidhu-teal/90 hover:-translate-y-1 transition-all border-b-4 border-paidhu-teal/50 flex items-center justify-center gap-3"
                                >
                                    <ShoppingCart className="w-6 h-6" />
                                    Add to Yummy Cart
                                </button>
                                <button
                                    onClick={() => triggerProductLogin(selectedProduct)}
                                    className="px-8 py-5 bg-paidhu-yellow text-paidhu-slate rounded-2xl text-xl font-brand font-bold shadow-xl hover:bg-paidhu-yellow/90 hover:-translate-y-1 transition-all border-b-4 border-paidhu-yellow/50"
                                >
                                    Unlock Module
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CART DRAWER */}
            {isCartOpen && (
                <div className="fixed inset-0 z-[200] overflow-hidden">
                    <div className="absolute inset-0 bg-paidhu-slate/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
                    <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
                        <div className="bg-paidhu-maroon p-8 text-white flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <ShoppingCart className="w-8 h-8" />
                                <h2 className="text-2xl font-brand font-bold">Your Yummy Cart</h2>
                            </div>
                            <button onClick={() => setIsCartOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                                <X className="w-7 h-7" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                                    <Smile className="w-20 h-20 text-paidhu-yellow" />
                                    <p className="text-xl font-brand font-bold text-paidhu-slate">Cart is empty!</p>
                                    <button onClick={() => setIsCartOpen(false)} className="bg-paidhu-teal text-white px-8 py-3 rounded-xl font-brand font-bold">Start Shopping</button>
                                </div>
                            ) : (
                                cart.map((item) => (
                                    <div key={item.cartId} className="flex gap-4 bg-paidhu-cream p-4 rounded-[24px] border-2 border-paidhu-peach relative group">
                                        <div className="w-20 h-20 bg-white rounded-xl overflow-hidden p-2 flex-shrink-0">
                                            <img src={item.image_url} className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-brand font-bold text-paidhu-slate truncate pr-8">{item.name}</h4>
                                            <p className="text-xs text-paidhu-teal font-bold uppercase tracking-wider mb-2">{item.category}</p>
                                            <p className="text-lg font-brand font-bold text-paidhu-maroon">₹{parseFloat(item.price).toFixed(0)}</p>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.cartId)}
                                            className="absolute top-2 right-2 p-2 text-gray-300 hover:text-paidhu-maroon transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="p-8 bg-paidhu-cream border-t-4 border-paidhu-peach space-y-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-brand font-bold text-gray-500 uppercase tracking-widest">Total Amount</span>
                                    <span className="text-4xl font-brand font-bold text-paidhu-slate">₹{cartTotal.toFixed(0)}</span>
                                </div>
                                <button className="w-full bg-paidhu-teal text-white py-5 rounded-2xl text-xl font-brand font-bold shadow-xl hover:bg-paidhu-teal/90 hover:-translate-y-1 transition-all border-b-4 border-paidhu-teal/50 flex items-center justify-center gap-3">
                                    Checkout Now 🚀
                                </button>
                                <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Safe & Secure Payment</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* WISHLIST DRAWER */}
            {isWishlistOpen && (
                <div className="fixed inset-0 z-[200] overflow-hidden">
                    <div className="absolute inset-0 bg-paidhu-slate/40 backdrop-blur-sm" onClick={() => setIsWishlistOpen(false)} />
                    <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
                        <div className="bg-paidhu-teal p-8 text-white flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Heart className="w-8 h-8 fill-white" />
                                <h2 className="text-2xl font-brand font-bold">My Wishlist</h2>
                            </div>
                            <button onClick={() => setIsWishlistOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                                <X className="w-7 h-7" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            {wishlist.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                                    <Heart className="w-20 h-20 text-paidhu-peach" />
                                    <p className="text-xl font-brand font-bold text-paidhu-slate">Wishlist is empty!</p>
                                    <button onClick={() => setIsWishlistOpen(false)} className="bg-paidhu-teal text-white px-8 py-3 rounded-xl font-brand font-bold">Explore Yummies</button>
                                </div>
                            ) : (
                                wishlist.map((item) => (
                                    <div key={item.id} className="flex gap-4 bg-paidhu-cream p-4 rounded-[24px] border-2 border-paidhu-peach relative group">
                                        <div className="w-20 h-20 bg-white rounded-xl overflow-hidden p-2 flex-shrink-0">
                                            <img src={item.image_url} className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-brand font-bold text-paidhu-slate truncate pr-8">{item.name}</h4>
                                            <p className="text-xs text-paidhu-teal font-bold uppercase tracking-wider mb-2">{item.category}</p>
                                            <div className="flex items-center justify-between mt-2">
                                                <p className="text-lg font-brand font-bold text-paidhu-maroon">₹{parseFloat(item.price).toFixed(0)}</p>
                                                <button 
                                                    onClick={() => {
                                                        addToCart(item);
                                                        toggleWishlist(item); // Remove from wishlist after adding to cart
                                                    }}
                                                    className="bg-paidhu-teal text-white px-4 py-1.5 rounded-lg text-xs font-brand font-bold hover:bg-paidhu-teal/90 transition-all shadow-sm"
                                                >
                                                    Move to Cart
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => toggleWishlist(item)}
                                            className="absolute top-2 right-2 p-2 text-gray-300 hover:text-paidhu-maroon transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
