import React, { useState, useEffect } from 'react';
import {
    Heart, ShoppingCart, Menu, ArrowRight, Leaf, ShieldCheck,
    Sun, Star, Camera, Globe,
    X, Sparkles, Droplets, User, LayoutDashboard, Smile,
    Plus, Trash2
} from 'lucide-react';
import AdminDashboard from './AdminDashboard';

interface LandingPageProps {
    onStart?: () => void;
}

export default function LandingPage() {
    const API_URL = "http://localhost:5001";
    const [scrolled, setScrolled] = useState(false);
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
    const [activeDetailTab, setActiveDetailTab] = useState('description');

    useEffect(() => {
        localStorage.setItem('paidhu_cart', JSON.stringify(cart));
    }, [cart]);

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
                @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&display=swap');
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
            `}</style>

            {/* ── PLAYFUL ANNOUNCEMENT BAR ── */}
            {!isAdminView && (
                <div className="bg-paidhu-maroon text-white py-2.5 text-sm font-bold text-center tracking-wide relative z-[60]">
                    🎉 Free Shipping on All Happy Healthy Orders Over ₹999! 🥳
                </div>
            )}


            {/* ── VIBRANT NAVIGATION ── */}
            <nav className={`sticky z-50 transition-all duration-300 top-0 pt-3 pb-3 ${scrolled || isAdminView ? 'bg-white shadow-md' : 'bg-transparent'} ${!isAdminView && 'absolute w-full pt-6'}`}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    {!isAdminView && (
                        <button className="lg:hidden text-paidhu-maroon bg-white p-2 rounded-full shadow-sm" onClick={() => setMobileMenuOpen(true)}>
                            <Menu className="w-6 h-6" />
                        </button>
                    )}


                    <div className="flex items-center gap-4">
                        <a href="#" className="flex items-center justify-center">
                            <img src={images.logo} alt="Paidhu" className="h-10 md:h-12 object-contain" />
                        </a>
                        {isAdminView && (
                            <div className="hidden sm:flex items-center gap-2 border-l-2 border-paidhu-peach pl-4 ml-2">
                                <LayoutDashboard className="w-5 h-5 text-paidhu-maroon" />
                                <span className="font-brand font-bold text-paidhu-maroon text-lg tracking-wide">Admin Workspace</span>
                            </div>
                        )}

                    </div>

                    <div className="hidden lg:flex items-center gap-8 bg-white/80 backdrop-blur-md px-8 py-3 rounded-full shadow-sm border border-paidhu-peach">
                        {['All Yummies', 'Healthy Options', 'Our Story', 'Fun Recipes'].map((item) => (
                            <a key={item} href="#" className="font-brand text-base font-semibold text-paidhu-slate hover:text-paidhu-maroon transition-colors relative group">
                                {item}
                            </a>
                        ))}
                    </div>


                    <div className="flex items-center gap-3 lg:gap-4">
                        {currentUser?.role === 'admin' && (
                            <button
                                onClick={() => setIsAdminView(!isAdminView)}
                                className="hidden sm:flex items-center gap-1.5 text-sm font-bold bg-paidhu-yellow px-4 py-2 rounded-full text-paidhu-slate hover:bg-paidhu-yellow/80 transition-colors shadow-sm font-brand"
                            >
                                {isAdminView ? 'Back to Shop' : 'Admin Panel'}
                            </button>
                        )}


                        <div className="relative">
                            <button onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)} className="bg-white p-2.5 rounded-full shadow-sm text-paidhu-maroon hover:bg-paidhu-mint transition-colors flex items-center">
                                <User className={`w-5 h-5 ${currentUser ? 'text-paidhu-maroon' : ''}`} />
                            </button>

                            {isAccountDropdownOpen && (
                                <div className="absolute right-0 mt-3 w-56 bg-white border-2 border-paidhu-peach rounded-2xl shadow-xl py-2 z-50 overflow-hidden">
                                    {currentUser ? (
                                        <>
                                            <div className="px-5 py-3 border-b-2 border-paidhu-peach bg-paidhu-cream">
                                                <p className="font-brand font-bold text-paidhu-slate truncate text-lg">{currentUser.name}</p>
                                                <p className="text-xs font-bold text-paidhu-maroon uppercase tracking-wider">{currentUser.role}</p>
                                            </div>

                                            <button onClick={() => { setCurrentUser(null); localStorage.removeItem('paidhu_token'); setIsAccountDropdownOpen(false); setIsAdminView(false); }} className="block w-full text-left px-5 py-3 text-sm font-bold text-paidhu-slate hover:bg-paidhu-maroon hover:text-white transition-colors">Logout 👋</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => { setLoginRole('customer'); setIsLoginModalOpen(true); setIsAccountDropdownOpen(false); setAuthMessage({ type: '', text: '' }); }} className="block w-full text-left px-5 py-3 text-sm font-bold text-paidhu-slate hover:bg-paidhu-maroon hover:text-white transition-colors">Customer Login</button>
                                            <button onClick={() => { setLoginRole('admin'); setIsLoginModalOpen(true); setIsAccountDropdownOpen(false); setAuthMessage({ type: '', text: '' }); }} className="block w-full text-left px-5 py-3 text-sm font-bold text-paidhu-slate hover:bg-paidhu-yellow transition-colors">Admin Login</button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>


                        <button className="bg-white p-2.5 rounded-full shadow-sm text-paidhu-maroon hover:bg-paidhu-mint transition-colors relative">
                            <ShoppingCart className="w-5 h-5" />
                            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-paidhu-maroon text-white text-xs font-bold rounded-full flex items-center justify-center font-brand border-2 border-white">2</span>
                        </button>

                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div className={`fixed inset-0 bg-paidhu-slate/40 backdrop-blur-sm z-[70] transition-opacity duration-300 lg:hidden ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setMobileMenuOpen(false)}>
                <div className={`absolute left-0 top-0 bottom-0 w-4/5 max-w-sm bg-white p-8 transition-transform duration-500 ease-out flex flex-col rounded-r-3xl ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`} onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-10">
                        <img src={images.logo} alt="Paidhu" className="h-8 object-contain" />
                        <button onClick={() => setMobileMenuOpen(false)} className="bg-paidhu-peach p-2 rounded-full"><X className="w-6 h-6 text-paidhu-maroon" /></button>
                    </div>
                    <div className="flex flex-col gap-6 text-xl font-brand font-bold">
                        {['All Yummies', 'Healthy Options', 'Our Story', 'Fun Recipes'].map((item) => (
                            <a key={item} href="#" className="text-paidhu-slate hover:text-paidhu-maroon">{item}</a>
                        ))}
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
                                    <button className="w-full sm:w-auto px-10 py-5 bg-paidhu-maroon text-white text-lg font-brand font-bold tracking-wide hover:bg-paidhu-maroon/90 hover:-translate-y-1 transition-all shadow-lg rounded-2xl border-b-4 border-paidhu-maroon/50">
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


                    {/* ── FUN TRUST BADGES ── */}
                    <section className="bg-paidhu-cream relative z-20 pb-16">
                        <div className="max-w-7xl mx-auto px-6">
                            <div className="flex flex-wrap justify-center items-center gap-6 lg:gap-12 bg-white rounded-3xl shadow-sm border-2 border-paidhu-peach p-8 -mt-16 relative z-30">
                                {[
                                    { icon: Leaf, label: 'No Maida', color: 'text-paidhu-teal', bg: 'bg-paidhu-mint' },
                                    { icon: ShieldCheck, label: 'Zero Refined Sugar', color: 'text-paidhu-maroon', bg: 'bg-paidhu-peach' },
                                    { icon: Droplets, label: 'No Artificial Colors', color: 'text-paidhu-yellow', bg: 'bg-paidhu-peach' },
                                    { icon: Sun, label: '100% Natural', color: 'text-paidhu-teal', bg: 'bg-paidhu-mint' },
                                ].map((badge, i) => (
                                    <div key={i} className="flex items-center gap-4 group cursor-default">
                                        <div className={`w-14 h-14 ${badge.bg} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                            <badge.icon className={`w-7 h-7 ${badge.color}`} />
                                        </div>
                                        <span className="text-sm font-brand font-bold text-paidhu-slate uppercase tracking-wide">{badge.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>


                    {/* ── PLAYFUL CATEGORIES ── */}
                    <section className="py-24 px-6 bg-paidhu-cream">
                        <div className="max-w-7xl mx-auto space-y-16">
                            <div className="text-center space-y-4 max-w-2xl mx-auto">
                                <h2 className="text-5xl font-brand font-bold text-paidhu-slate">Shop by Category</h2>
                                <p className="text-paidhu-slate/70 font-bold text-lg">Find the perfect healthy treats for your little ones!</p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-10">
                                {[
                                    { title: 'Pure Saffron', img: images.saffron, color: 'bg-paidhu-yellow' },
                                    { title: 'Bloom Cookies', img: images.cookies, color: 'bg-paidhu-maroon' },
                                    { title: 'Medley Teas', img: images.tea, color: 'bg-paidhu-teal' },
                                    { title: 'Petal Jams', img: images.jam, color: 'bg-paidhu-maroon' },
                                ].map((cat, i) => (
                                    <div key={i} className="flex flex-col items-center group cursor-pointer">
                                        <div className={`w-full aspect-square rounded-[40px] ${cat.color} p-2 shadow-sm border-4 border-white group-hover:-translate-y-2 transition-all duration-300 relative`}>
                                            <div className="w-full h-full bg-white rounded-[32px] overflow-hidden">
                                                <img src={cat.img} alt={cat.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            </div>
                                            <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 border-2 border-paidhu-peach">
                                                <ArrowRight className="w-6 h-6 text-paidhu-maroon" />
                                            </div>
                                        </div>
                                        <h3 className="mt-6 text-paidhu-slate font-brand font-bold text-2xl text-center">{cat.title}</h3>
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
                                <button className="bg-paidhu-peach text-paidhu-slate px-6 py-3 rounded-full font-brand font-bold hover:bg-paidhu-yellow transition-colors shadow-sm">
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
                                            <li key={link}><a href="#" className="text-base font-bold text-white/80 hover:text-paidhu-maroon transition-colors">{link}</a></li>
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

        </div>
    );
}
