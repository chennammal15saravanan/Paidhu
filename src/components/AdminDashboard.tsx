import React, { useState } from 'react';
import {
    PlusCircle, LayoutList, Check, AlertCircle, Smile, Eye, X, Camera, Sparkles, LayoutDashboard, Leaf,
    Package, Truck, Link, Tag, Settings, ClipboardList
} from 'lucide-react';

interface Product {
    id: number;
    name: string;
    title: string;
    category: string;
    description: string;
    short_description: string;
    image_url: string;
    banner_image: string;
    features: any;
    benefits: any;
    interest_rate: string;
    eligibility_details: string;
    status: string;
    display_order: number;
    slug: string;
    cta_text: string;
    redirect_link: string;
    price: any;
    gallery_images: any;
    on_sale: boolean;
    original_price: any;
    sizes: any;
    sku: string;
    additional_info: any;
    gtin: string;
    stock_status: string;
    weight_g: any;
    length_cm: any;
    width_cm: any;
    height_cm: any;
    upsell_ids: any;
    cross_sell_ids: any;
    attributes: any;
}

interface AdminDashboardProps {
    adminProducts: Product[];
    fetchProducts: () => void;
}

export default function AdminDashboard({ adminProducts, fetchProducts }: AdminDashboardProps) {
    const API_URL = "http://localhost:5001";
    const [productForm, setProductForm] = useState({
        name: '', title: '', category: 'Petal Jam', description: '', short_description: '',
        image_url: '', banner_image: '', features: '', benefits: '', interest_rate: '',
        eligibility_details: '', status: 'Active', display_order: '0', slug: '', cta_text: 'Buy Now',
        redirect_link: '', price: '',
        gallery_images: '', on_sale: false, original_price: '', sizes: '', sku: '', additional_info: '',
        gtin: '', stock_status: 'In stock', weight_g: '', length_cm: '', width_cm: '', height_cm: '',
        upsell_ids: '', cross_sell_ids: '', attributes: ''
    });

    const seedPaidhuProducts = async () => {
        setProductFormMessage({ type: 'info', text: 'Seeding Paidhu catalog...' });
        const productsToSeed = [
            {
                name: "Kashmiri Mongra Saffron",
                title: "Premium Grade Saffron",
                category: "Saffron",
                price: "1700",
                image_url: "https://paidhu.com/wp-content/uploads/2024/12/Saffron-2-300x300.png",
                short_description: "The finest Kashmiri Mongra Saffron, known for deep red color.",
                features: "Pure, Hand-picked, ISO Certified",
                benefits: "Anti-inflammatory, Boosts Mood"
            },
            {
                name: "Tanner's Jam",
                title: "Avaram Poo Floral Jam",
                category: "Petal Jam",
                price: "350",
                image_url: "https://paidhu.com/wp-content/uploads/2025/04/cassia--300x300.jpg",
                short_description: "Traditional wellness spread made from Avaram Poo flowers.",
                features: "No Maida, 100% Natural, No Preservatives",
                benefits: "Body Cooling, Skin Health"
            },
            {
                name: "Bloom Cookies - Hibiscus",
                title: "Floral Infused Healthy Cookies",
                category: "Bloom Cookies",
                price: "150",
                image_url: "https://paidhu.com/wp-content/uploads/2025/07/Paidhu-Cookies-300x300.jpg",
                short_description: "Delicious cookies baked with the goodness of hibiscus.",
                features: "No Refined Sugar, No Maida",
                benefits: "Healthy Snack, Rich in Fiber"
            }
        ];

        for (const prod of productsToSeed) {
            try {
                const token = localStorage.getItem('paidhu_token');
                await fetch(`${API_URL}/api/products`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ ...prod, status: 'Active' })
                });
            } catch (err) {
                console.error("Failed to seed", prod.name);
            }
        }
        setProductFormMessage({ type: 'success', text: 'Catalog seeded successfully! 🌸' });
        fetchProducts();
    };
    const [editingProductId, setEditingProductId] = useState<number | null>(null);
    const [productFormMessage, setProductFormMessage] = useState({ type: '', text: '' });

    const handleProductSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProductFormMessage({ type: 'info', text: 'Saving product module...' });

        try {
            const token = localStorage.getItem('paidhu_token');
            const url = editingProductId ? `${API_URL}/api/products/${editingProductId}` : `${API_URL}/api/products`;
            const method = editingProductId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...productForm,
                    features: Array.isArray(productForm.features) ? productForm.features : productForm.features ? productForm.features.split(',').map((f: string) => f.trim()) : null,
                    benefits: Array.isArray(productForm.benefits) ? productForm.benefits : productForm.benefits ? productForm.benefits.split(',').map((b: string) => b.trim()) : null,
                    gallery_images: Array.isArray(productForm.gallery_images) ? productForm.gallery_images : productForm.gallery_images ? productForm.gallery_images.split(',').map((img: string) => img.trim()) : null,
                    sizes: Array.isArray(productForm.sizes) ? productForm.sizes : productForm.sizes ? productForm.sizes.split(',').map((s: string) => s.trim()) : null,
                    upsell_ids: Array.isArray(productForm.upsell_ids) ? productForm.upsell_ids : productForm.upsell_ids ? productForm.upsell_ids.split(',').map((id: string) => id.trim()) : null,
                    cross_sell_ids: Array.isArray(productForm.cross_sell_ids) ? productForm.cross_sell_ids : productForm.cross_sell_ids ? productForm.cross_sell_ids.split(',').map((id: string) => id.trim()) : null
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to save product');

            setProductFormMessage({ type: 'success', text: editingProductId ? 'Awesome! Product updated successfully!' : 'Awesome! Product added successfully!' });
            setProductForm({ 
                name: '', title: '', category: 'Petal Jam', description: '', short_description: '', image_url: '', banner_image: '', 
                features: '', benefits: '', interest_rate: '', eligibility_details: '', status: 'Active', display_order: '0', slug: '', 
                cta_text: 'Buy Now', redirect_link: '', price: '',
                gallery_images: '', on_sale: false, original_price: '', sizes: '', sku: '', additional_info: '',
                gtin: '', stock_status: 'In stock', weight_g: '', length_cm: '', width_cm: '', height_cm: '',
                upsell_ids: '', cross_sell_ids: '', attributes: ''
            });
            setEditingProductId(null);
            
            fetchProducts();
            
            setTimeout(() => setProductFormMessage({ type: '', text: '' }), 5000);
        } catch (err: any) {
            setProductFormMessage({ type: 'error', text: err.message });
        }
    };

    const handleEditProduct = (prod: Product) => {
        setProductForm({
            name: prod.name || '',
            title: prod.title || '',
            category: prod.category || 'Petal Jam',
            description: prod.description || '',
            short_description: prod.short_description || '',
            image_url: prod.image_url || '',
            banner_image: prod.banner_image || '',
            features: Array.isArray(prod.features) ? prod.features.join(', ') : (prod.features || ''),
            benefits: Array.isArray(prod.benefits) ? prod.benefits.join(', ') : (prod.benefits || ''),
            interest_rate: prod.interest_rate || '',
            eligibility_details: prod.eligibility_details || '',
            status: prod.status || 'Active',
            display_order: String(prod.display_order || '0'),
            slug: prod.slug || '',
            cta_text: prod.cta_text || 'Buy Now',
            redirect_link: prod.redirect_link || '',
            price: String(prod.price || ''),
            gallery_images: Array.isArray(prod.gallery_images) ? prod.gallery_images.join(', ') : (prod.gallery_images || ''),
            on_sale: Boolean(prod.on_sale),
            original_price: String(prod.original_price || ''),
            sizes: Array.isArray(prod.sizes) ? prod.sizes.join(', ') : (prod.sizes || ''),
            sku: prod.sku || '',
            additional_info: typeof prod.additional_info === 'object' ? JSON.stringify(prod.additional_info) : (prod.additional_info || ''),
            gtin: prod.gtin || '',
            stock_status: prod.stock_status || 'In stock',
            weight_g: String(prod.weight_g || ''),
            length_cm: String(prod.length_cm || ''),
            width_cm: String(prod.width_cm || ''),
            height_cm: String(prod.height_cm || ''),
            upsell_ids: Array.isArray(prod.upsell_ids) ? prod.upsell_ids.join(', ') : (prod.upsell_ids || ''),
            cross_sell_ids: Array.isArray(prod.cross_sell_ids) ? prod.cross_sell_ids.join(', ') : (prod.cross_sell_ids || ''),
            attributes: typeof prod.attributes === 'object' ? JSON.stringify(prod.attributes) : (prod.attributes || '')
        });
        setEditingProductId(prod.id);
        window.scrollTo({ top: 100, behavior: 'smooth' });
    };

    const handleDeleteProduct = async (id: number) => {
        if (!confirm('Are you sure you want to delete this module? This cannot be undone!')) return;

        try {
            const token = localStorage.getItem('paidhu_token');
            const res = await fetch(`${API_URL}/api/products/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to delete product');
            
            setProductFormMessage({ type: 'success', text: 'Product module removed successfully.' });
            fetchProducts();
            setTimeout(() => setProductFormMessage({ type: '', text: '' }), 3000);
        } catch (err: any) {
            setProductFormMessage({ type: 'error', text: err.message });
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-10 px-6 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* STATS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-3xl shadow-sm border-2 border-paidhu-mint flex items-center gap-6 relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-paidhu-mint rounded-full opacity-50"></div>
                    <div className="w-16 h-16 bg-paidhu-teal rounded-2xl flex items-center justify-center rotate-3 shadow-md relative z-10">
                        <LayoutList className="w-8 h-8 text-white" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-bold text-paidhu-teal uppercase tracking-widest font-brand">Total Modules</p>
                        <p className="text-4xl font-brand font-bold text-paidhu-slate">{adminProducts.length}</p>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border-2 border-paidhu-peach flex items-center gap-6 relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-paidhu-peach rounded-full opacity-50"></div>
                    <div className="w-16 h-16 bg-paidhu-yellow rounded-2xl flex items-center justify-center -rotate-3 shadow-md relative z-10">
                        <Check className="w-8 h-8 text-paidhu-slate" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-bold text-paidhu-yellow drop-shadow-sm uppercase tracking-widest font-brand">Active Storefront</p>
                        <p className="text-4xl font-brand font-bold text-paidhu-slate">{adminProducts.filter(p => p.status === 'Active').length}</p>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border-2 border-paidhu-peach flex items-center gap-6 relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-paidhu-peach rounded-full opacity-50"></div>
                    <div className="w-16 h-16 bg-paidhu-maroon rounded-2xl flex items-center justify-center rotate-6 shadow-md relative z-10">
                        <AlertCircle className="w-8 h-8 text-white" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-bold text-paidhu-maroon uppercase tracking-widest font-brand">Inactive / Drafts</p>
                        <p className="text-4xl font-brand font-bold text-paidhu-slate">{adminProducts.filter(p => p.status !== 'Active').length}</p>
                    </div>
                </div>
            </div>


            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* LEFT COLUMN: PRODUCT LIST */}
                <div className="xl:col-span-1 bg-white rounded-3xl shadow-md border-2 border-paidhu-peach overflow-hidden flex flex-col h-[750px]">
                    <div className="bg-paidhu-peach px-8 py-5 border-b-2 border-paidhu-yellow/20 flex items-center gap-3">
                        <Smile className="w-6 h-6 text-paidhu-maroon" />
                        <h2 className="text-lg font-brand font-bold text-paidhu-slate uppercase tracking-wider">Added Modules</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {adminProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-paidhu-maroon/60 font-brand">
                                <Leaf className="w-12 h-12 mb-4 opacity-50" />
                                <p className="text-lg font-bold">No products found!</p>
                            </div>

                        ) : (
                            <div className="space-y-3">
                                {adminProducts.map((prod, i) => (
                                    <div key={i} className="p-4 bg-paidhu-cream hover:bg-paidhu-mint border border-transparent hover:border-paidhu-teal/30 rounded-2xl flex items-center gap-4 transition-all duration-300">
                                        <div className="w-14 h-14 bg-white rounded-xl shadow-sm border border-gray-100 p-1 flex-shrink-0">
                                            {prod.image_url ? (
                                                <img src={prod.image_url} alt={prod.name} className="w-full h-full object-contain" />
                                            ) : (
                                                <div className="w-full h-full bg-gray-50 rounded-lg flex items-center justify-center text-gray-300"><LayoutList className="w-5 h-5"/></div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-base font-brand text-paidhu-slate truncate">{prod.name}</h4>
                                            <p className="text-sm font-semibold text-gray-500 truncate">{prod.category} • ₹{parseFloat(prod.price).toFixed(2)}</p>
                                        </div>

                                        <div className="flex-shrink-0 flex flex-col gap-2">
                                            <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full text-center ${prod.status === 'Active' ? 'bg-paidhu-teal text-white' : 'bg-paidhu-maroon text-white'}`}>
                                                {prod.status}
                                            </span>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleEditProduct(prod)} className="p-1.5 bg-white border border-paidhu-peach rounded-lg text-paidhu-teal hover:bg-paidhu-mint transition-colors shadow-sm">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDeleteProduct(prod.id)} className="p-1.5 bg-white border border-paidhu-peach rounded-lg text-paidhu-maroon hover:bg-red-50 transition-colors shadow-sm">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: ADD FORM */}
                <div className="xl:col-span-2 bg-white rounded-3xl shadow-md border-2 border-paidhu-teal/20 overflow-hidden h-[750px] flex flex-col relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-paidhu-mint rounded-bl-full opacity-50 pointer-events-none"></div>
                    <div className={`px-8 py-5 flex items-center justify-between flex-shrink-0 relative z-10 transition-colors duration-500 ${editingProductId ? 'bg-paidhu-maroon' : 'bg-paidhu-maroon'}`}>
                        <div className="flex items-center gap-3">
                            {editingProductId ? <Sparkles className="w-6 h-6 text-white" /> : <PlusCircle className="w-6 h-6 text-paidhu-yellow" />}
                            <h2 className="text-lg font-brand font-bold text-white uppercase tracking-wider">
                                {editingProductId ? 'Update Existing Module' : 'Add New Product Module'}
                            </h2>
                        </div>

                        <div className="flex gap-4">
                            {!editingProductId && (
                                <button 
                                    onClick={seedPaidhuProducts}
                                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-1.5 rounded-full text-xs font-bold font-brand flex items-center gap-2"
                                >
                                    <Leaf className="w-3 h-3" /> Seed Official Catalog
                                </button>
                            )}
                            {editingProductId && (
                                <button 
                                    onClick={() => {
                                        setEditingProductId(null);
                                        setProductForm({ 
                                            name: '', title: '', category: 'Petal Jam', description: '', short_description: '', image_url: '', banner_image: '', features: '', benefits: '', interest_rate: '', eligibility_details: '', status: 'Active', display_order: '0', slug: '', cta_text: 'Buy Now', redirect_link: '', price: '',
                                            gallery_images: '', on_sale: false, original_price: '', sizes: '', sku: '', additional_info: '',
                                            gtin: '', stock_status: 'In stock', weight_g: '', length_cm: '', width_cm: '', height_cm: '',
                                            upsell_ids: '', cross_sell_ids: '', attributes: ''
                                        });
                                    }}
                                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-1.5 rounded-full text-xs font-bold font-brand"
                                >
                                    Cancel Edit
                                </button>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        <form className="space-y-10" onSubmit={handleProductSubmit}>
                            {productFormMessage.text && (
                                <div className={`p-4 rounded-xl text-base font-bold text-center border-2 ${productFormMessage.type === 'error' ? 'bg-red-50 text-paidhu-maroon border-red-100' : productFormMessage.type === 'success' ? 'bg-paidhu-mint text-paidhu-teal border-paidhu-teal/30' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                    {productFormMessage.text}
                                </div>
                            )}


                            {/* SECTION 1: IDENTITY */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-paidhu-cream p-8 rounded-3xl border-2 border-paidhu-peach">
                                <div className="col-span-full border-b-2 border-paidhu-peach pb-4 mb-2">
                                    <h3 className="font-brand font-bold text-paidhu-maroon text-lg uppercase tracking-widest flex items-center gap-2">
                                        <Smile className="w-5 h-5"/> Brand Identity
                                    </h3>
                                </div>

                                
                                <div><label className="block text-xs font-bold text-paidhu-slate uppercase tracking-wider mb-2">Product Name *</label>
                                <input type="text" required value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full px-4 py-3 bg-white border-2 border-paidhu-peach focus:border-paidhu-yellow outline-none rounded-xl text-base font-semibold transition-colors shadow-sm" placeholder="e.g. Tanner's Jam" /></div>
                                
                                <div><label className="block text-xs font-bold text-paidhu-slate uppercase tracking-wider mb-2">Product Title (Tagline)</label>
                                <input type="text" value={productForm.title} onChange={e => setProductForm({...productForm, title: e.target.value})} className="w-full px-4 py-3 bg-white border-2 border-paidhu-peach focus:border-paidhu-yellow outline-none rounded-xl text-base font-semibold transition-colors shadow-sm" placeholder="e.g. Ayurvedic Tonic" /></div>

                                
                                <div><label className="block text-xs font-bold text-paidhu-slate uppercase tracking-wider mb-2">Category</label>
                                <select value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} className="w-full px-4 py-3 bg-white border-2 border-paidhu-peach focus:border-paidhu-yellow outline-none rounded-xl text-base font-semibold transition-colors shadow-sm cursor-pointer">
                                    <option>Petal Jam</option>
                                    <option>Saffron</option>
                                    <option>Brew Flora</option>
                                    <option>Bloom Cookies</option>
                                    <option>Dry Flowers</option>
                                    <option>Bloom Powders</option>
                                    <option>Medley Teas</option>
                                </select></div>

                                <div><label className="block text-xs font-bold text-paidhu-slate uppercase tracking-wider mb-2">URL Slug</label>
                                <input type="text" value={productForm.slug} onChange={e => setProductForm({...productForm, slug: e.target.value})} className="w-full px-4 py-3 bg-white border-2 border-paidhu-peach focus:border-paidhu-yellow outline-none rounded-xl text-base font-semibold transition-colors shadow-sm" placeholder="e.g. tanners-jam" /></div>

                            </div>

                            {/* SECTION 2: CONTENT & MEDIA */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 rounded-3xl border-2 border-paidhu-mint">
                                <div className="col-span-full border-b-2 border-paidhu-mint pb-4 mb-2">
                                    <h3 className="font-brand font-bold text-paidhu-teal text-lg uppercase tracking-widest flex items-center gap-2">
                                        <Camera className="w-5 h-5"/> Visuals & Content
                                    </h3>
                                </div>


                                <div className="col-span-full"><label className="block text-xs font-bold text-paidhu-slate uppercase tracking-wider mb-2">Short Catchy Description</label>
                                <textarea value={productForm.short_description} onChange={e => setProductForm({...productForm, short_description: e.target.value})} className="w-full px-4 py-3 bg-paidhu-cream border-2 border-paidhu-peach focus:border-paidhu-yellow outline-none rounded-xl text-base font-semibold transition-colors shadow-sm" rows={2} placeholder="Appears on cards..."></textarea></div>

                                <div className="col-span-full"><label className="block text-xs font-bold text-paidhu-slate uppercase tracking-wider mb-2">Full Product Description (Detailed)</label>
                                <textarea value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="w-full px-4 py-3 bg-paidhu-cream border-2 border-paidhu-peach focus:border-paidhu-yellow outline-none rounded-xl text-base font-semibold transition-colors shadow-sm" rows={4} placeholder="Full health benefits, usage, etc..."></textarea></div>

                                <div><label className="block text-xs font-bold text-paidhu-slate uppercase tracking-wider mb-2">Main Image URL</label>
                                <input type="text" value={productForm.image_url} onChange={e => setProductForm({...productForm, image_url: e.target.value})} className="w-full px-4 py-3 bg-paidhu-cream border-2 border-paidhu-peach focus:border-paidhu-yellow outline-none rounded-xl text-base font-semibold transition-colors shadow-sm" /></div>

                                <div><label className="block text-xs font-bold text-paidhu-slate uppercase tracking-wider mb-2">Banner/Hero Image URL</label>
                                <input type="text" value={productForm.banner_image} onChange={e => setProductForm({...productForm, banner_image: e.target.value})} className="w-full px-4 py-3 bg-paidhu-cream border-2 border-paidhu-peach focus:border-paidhu-yellow outline-none rounded-xl text-base font-semibold transition-colors shadow-sm" /></div>

                                <div className="col-span-full"><label className="block text-xs font-bold text-paidhu-slate uppercase tracking-wider mb-2">Gallery Image URLs (Comma separated)</label>
                                <textarea value={productForm.gallery_images} onChange={e => setProductForm({...productForm, gallery_images: e.target.value})} className="w-full px-4 py-3 bg-paidhu-cream border-2 border-paidhu-peach focus:border-paidhu-yellow outline-none rounded-xl text-base font-semibold transition-colors shadow-sm" rows={2} placeholder="url1, url2, url3..."></textarea></div>

                            </div>

                            {/* SECTION 3: FEATURES & SPECS */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-paidhu-mint/30 p-8 rounded-3xl border-2 border-paidhu-mint">
                                <div className="col-span-full border-b-2 border-paidhu-mint pb-4 mb-2">
                                    <h3 className="font-brand font-bold text-paidhu-teal text-lg uppercase tracking-widest flex items-center gap-2">
                                        <Sparkles className="w-5 h-5"/> Features & Benefits
                                    </h3>
                                </div>


                                <div><label className="block text-xs font-bold text-paidhu-slate uppercase tracking-wider mb-2">Product Features (Comma separated)</label>
                                <textarea value={productForm.features} onChange={e => setProductForm({...productForm, features: e.target.value})} className="w-full px-4 py-3 bg-white border-2 border-paidhu-mint focus:border-paidhu-teal outline-none rounded-xl text-base font-semibold transition-colors shadow-sm" rows={3} placeholder="No Preservatives, Organic, Hand-picked..."></textarea></div>

                                <div><label className="block text-xs font-bold text-paidhu-slate uppercase tracking-wider mb-2">Wellness Benefits (Comma separated)</label>
                                <textarea value={productForm.benefits} onChange={e => setProductForm({...productForm, benefits: e.target.value})} className="w-full px-4 py-3 bg-white border-2 border-paidhu-mint focus:border-paidhu-teal outline-none rounded-xl text-base font-semibold transition-colors shadow-sm" rows={3} placeholder="Digestive Balance, Skin Health, Body Cooling..."></textarea></div>

                                <div><label className="block text-xs font-bold text-paidhu-slate uppercase tracking-wider mb-2">Size/Weight Options (Comma separated)</label>
                                <input type="text" value={productForm.sizes} onChange={e => setProductForm({...productForm, sizes: e.target.value})} className="w-full px-4 py-3 bg-white border-2 border-paidhu-mint focus:border-paidhu-teal outline-none rounded-xl text-base font-semibold transition-colors shadow-sm" placeholder="e.g. 30g, 250g, 500g" /></div>

                                <div><label className="block text-xs font-bold text-paidhu-slate uppercase tracking-wider mb-2">SKU Number</label>
                                <input type="text" value={productForm.sku} onChange={e => setProductForm({...productForm, sku: e.target.value})} className="w-full px-4 py-3 bg-white border-2 border-paidhu-mint focus:border-paidhu-teal outline-none rounded-xl text-base font-semibold transition-colors shadow-sm" placeholder="e.g. JAM-001" /></div>

                            </div>

                            {/* ALL-IN-ONE SCROLLABLE DATA SECTION */}
                            <div className="space-y-10">
                                {/* SECTION 4: PRICING (GENERAL) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 rounded-3xl border-2 border-paidhu-peach">
                                    <div className="col-span-full border-b-2 border-paidhu-peach pb-4 mb-2">
                                        <h3 className="font-brand font-bold text-paidhu-maroon text-lg uppercase tracking-widest flex items-center gap-2">
                                            <Settings className="w-5 h-5"/> General & Pricing
                                        </h3>
                                    </div>

                                    <div><label className="block text-xs font-bold text-paidhu-slate uppercase tracking-wider mb-2">Regular price (₹)</label>
                                    <input type="number" value={productForm.original_price} onChange={e => setProductForm({...productForm, original_price: e.target.value})} className="w-full px-4 py-3 bg-paidhu-cream border-2 border-paidhu-peach focus:border-paidhu-yellow outline-none rounded-xl text-base font-semibold" /></div>
                                    <div><label className="block text-xs font-bold text-paidhu-slate uppercase tracking-wider mb-2">Sale price (₹) *</label>
                                    <input type="number" required value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} className="w-full px-4 py-3 bg-paidhu-cream border-2 border-paidhu-peach focus:border-paidhu-yellow outline-none rounded-xl text-base font-semibold" /></div>

                                    <div className="flex items-center gap-3 py-2">
                                        <input type="checkbox" id="onSale" checked={productForm.on_sale} onChange={e => setProductForm({...productForm, on_sale: e.target.checked})} className="w-6 h-6 rounded-lg accent-paidhu-maroon" />
                                        <label htmlFor="onSale" className="text-sm font-bold text-paidhu-slate uppercase tracking-wider cursor-pointer">Show "ON SALE" Badge</label>
                                    </div>
                                    <div><label className="block text-xs font-bold text-paidhu-slate uppercase tracking-wider mb-2">Redirect Link (External)</label>
                                    <input type="text" value={productForm.redirect_link} onChange={e => setProductForm({...productForm, redirect_link: e.target.value})} className="w-full px-4 py-3 bg-paidhu-cream border-2 border-paidhu-peach focus:border-paidhu-yellow outline-none rounded-xl text-base font-semibold" placeholder="https://..." /></div>

                                </div>

                                {/* SECTION 5: INVENTORY */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 rounded-3xl border-2 border-paidhu-mint">
                                    <div className="col-span-full border-b-2 border-paidhu-mint pb-4 mb-2">
                                        <h3 className="font-brand font-bold text-paidhu-teal text-lg uppercase tracking-widest flex items-center gap-2">
                                            <Package className="w-5 h-5"/> Inventory (Woo Style)
                                        </h3>
                                    </div>

                                    <div><label className="block text-xs font-bold text-paidhu-slate uppercase tracking-wider mb-2">SKU Number</label>
                                    <input type="text" value={productForm.sku} onChange={e => setProductForm({...productForm, sku: e.target.value})} className="w-full px-4 py-3 bg-white border-2 border-paidhu-mint focus:border-paidhu-teal outline-none rounded-xl text-base font-semibold" placeholder="e.g. JAM-001" /></div>
                                    <div><label className="block text-xs font-bold text-paidhu-slate uppercase tracking-wider mb-2">GTIN / UPC / EAN</label>
                                    <input type="text" value={productForm.gtin} onChange={e => setProductForm({...productForm, gtin: e.target.value})} className="w-full px-4 py-3 bg-white border-2 border-paidhu-mint focus:border-paidhu-teal outline-none rounded-xl text-base font-semibold" /></div>
                                    <div><label className="block text-xs font-bold text-paidhu-slate uppercase tracking-wider mb-2">Stock status</label>
                                    <select value={productForm.stock_status} onChange={e => setProductForm({...productForm, stock_status: e.target.value})} className="w-full px-4 py-3 bg-white border-2 border-paidhu-mint focus:border-paidhu-teal outline-none rounded-xl text-base font-semibold cursor-pointer">
                                        <option>In stock</option><option>Out of stock</option><option>On backorder</option>
                                    </select></div>

                                </div>

                                {/* SECTION 6: SHIPPING */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-paidhu-mint/30 p-8 rounded-3xl border-2 border-paidhu-mint">
                                    <div className="col-span-full border-b-2 border-paidhu-mint pb-4 mb-2">
                                        <h3 className="font-brand font-bold text-paidhu-teal text-lg uppercase tracking-widest flex items-center gap-2">
                                            <Truck className="w-5 h-5"/> Shipping Dimensions
                                        </h3>
                                    </div>

                                    <div><label className="block text-xs font-bold text-paidhu-slate uppercase tracking-wider mb-2">Weight (g)</label>
                                    <input type="number" value={productForm.weight_g} onChange={e => setProductForm({...productForm, weight_g: e.target.value})} className="w-full px-4 py-3 bg-white border-2 border-paidhu-mint focus:border-paidhu-teal outline-none rounded-xl text-base font-semibold" /></div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div><label className="block text-[10px] font-bold text-paidhu-slate uppercase tracking-wider mb-1">Length (cm)</label>
                                        <input type="number" value={productForm.length_cm} onChange={e => setProductForm({...productForm, length_cm: e.target.value})} className="w-full px-2 py-3 bg-white border-2 border-paidhu-mint focus:border-paidhu-teal outline-none rounded-xl text-xs font-semibold" /></div>
                                        <div><label className="block text-[10px] font-bold text-paidhu-slate uppercase tracking-wider mb-1">Width (cm)</label>
                                        <input type="number" value={productForm.width_cm} onChange={e => setProductForm({...productForm, width_cm: e.target.value})} className="w-full px-2 py-3 bg-white border-2 border-paidhu-mint focus:border-paidhu-teal outline-none rounded-xl text-xs font-semibold" /></div>
                                        <div><label className="block text-[10px] font-bold text-paidhu-slate uppercase tracking-wider mb-1">Height (cm)</label>
                                        <input type="number" value={productForm.height_cm} onChange={e => setProductForm({...productForm, height_cm: e.target.value})} className="w-full px-2 py-3 bg-white border-2 border-paidhu-mint focus:border-paidhu-teal outline-none rounded-xl text-xs font-semibold" /></div>
                                    </div>

                                </div>

                                {/* SECTION 7: LINKED & ATTRIBUTES */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 rounded-3xl border-2 border-paidhu-peach">
                                    <div className="col-span-full border-b-2 border-paidhu-peach pb-4 mb-2">
                                        <h3 className="font-brand font-bold text-paidhu-maroon text-lg uppercase tracking-widest flex items-center gap-2">
                                            <Link className="w-5 h-5"/> Links & Attributes
                                        </h3>
                                    </div>

                                    <div><label className="block text-xs font-bold text-paidhu-slate uppercase tracking-wider mb-2">Upsells (Comma separated IDs)</label>
                                    <textarea value={productForm.upsell_ids} onChange={e => setProductForm({...productForm, upsell_ids: e.target.value})} className="w-full px-4 py-3 bg-paidhu-cream border-2 border-paidhu-peach focus:border-paidhu-yellow outline-none rounded-xl text-base font-semibold" rows={2} placeholder="Search for a product..."></textarea></div>
                                    <div><label className="block text-xs font-bold text-paidhu-slate uppercase tracking-wider mb-2">Attributes (JSON)</label>
                                    <textarea value={productForm.attributes} onChange={e => setProductForm({...productForm, attributes: e.target.value})} className="w-full px-4 py-3 bg-paidhu-cream border-2 border-paidhu-peach focus:border-paidhu-yellow outline-none rounded-xl text-base font-semibold" rows={2} placeholder='[{"name":"Color","value":"Red"}]' /></div>

                                </div>

                                {/* SECTION 8: ADVANCED */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-paidhu-cream p-8 rounded-3xl border-2 border-paidhu-mint">
                                    <div className="col-span-full border-b-2 border-paidhu-mint pb-4 mb-2">
                                        <h3 className="font-brand font-bold text-paidhu-teal text-lg uppercase tracking-widest flex items-center gap-2">
                                            <ClipboardList className="w-5 h-5"/> Advanced Options
                                        </h3>
                                    </div>

                                    <div><label className="block text-xs font-bold text-paidhu-slate uppercase tracking-wider mb-2">Display Order</label>
                                    <input type="number" value={productForm.display_order} onChange={e => setProductForm({...productForm, display_order: e.target.value})} className="w-full px-4 py-3 bg-white border-2 border-paidhu-mint focus:border-paidhu-teal outline-none rounded-xl text-base font-semibold" /></div>
                                    <div><label className="block text-xs font-bold text-paidhu-slate uppercase tracking-wider mb-2">Module Status</label>
                                    <select value={productForm.status} onChange={e => setProductForm({...productForm, status: e.target.value})} className="w-full px-4 py-3 bg-white border-2 border-paidhu-mint focus:border-paidhu-teal outline-none rounded-xl text-base font-semibold cursor-pointer">
                                        <option>Active</option><option>Inactive</option><option>Draft</option>
                                    </select></div>
                                    <div className="col-span-full"><label className="block text-xs font-bold text-paidhu-slate uppercase tracking-wider mb-2">Additional Info (Static Text)</label>
                                    <textarea value={productForm.additional_info} onChange={e => setProductForm({...productForm, additional_info: e.target.value})} className="w-full px-4 py-3 bg-white border-2 border-paidhu-mint focus:border-paidhu-teal outline-none rounded-xl text-base font-semibold" rows={2} placeholder="Add descriptive pieces of information..."></textarea></div>

                                </div>
                            </div>

                            <div className="pt-6 flex justify-end">
                                <button type="submit" className={`w-full text-white px-10 py-5 rounded-2xl text-xl font-brand font-bold shadow-xl hover:-translate-y-1 transition-all duration-300 border-b-4 ${editingProductId ? 'bg-paidhu-maroon border-paidhu-maroon/50 hover:bg-paidhu-maroon/90' : 'bg-paidhu-maroon border-paidhu-maroon/50 hover:bg-paidhu-maroon/90'}`}>
                                    {editingProductId ? '✨ Update Product Module' : '🚀 Deploy Product Module'}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
