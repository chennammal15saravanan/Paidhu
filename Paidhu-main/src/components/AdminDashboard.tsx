import React, { useState } from 'react';
import {
    PlusCircle, LayoutList, Check, AlertCircle, Smile, Eye, X, Camera, Sparkles, Leaf,
    Package, Truck, Link, Settings, ClipboardList, Upload, ShoppingBag, Tag, Copy, IndianRupee, TrendingUp
} from 'lucide-react';
import AdminOrderManagement from './AdminOrderManagement';
import AdminCouponManagement from './AdminCouponManagement';

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
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
    const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'coupons'>('products');
    const [productForm, setProductForm] = useState<any>({
        name: '', title: '', category: 'Petal Jam', description: '', short_description: '',
        image_url: '', banner_image: '', features: '', benefits: '', interest_rate: '',
        eligibility_details: '', status: 'Active', display_order: '0', slug: '', cta_text: 'Buy Now',
        redirect_link: '', price: '',
        gallery_images: '', on_sale: false, original_price: '', sizes: '', sku: '', additional_info: '',
        gtin: '', stock_status: 'In stock', weight_g: '', length_cm: '', width_cm: '', height_cm: '',
        upsell_ids: '', cross_sell_ids: '', attributes: '', rating: '5.0', tag: '',
        ingredients: '', brewing_guide: '', storage_instructions: '', floral_notes: '', 
        aroma_profile: '', taste_notes: '', caffeine_level: 'None', 
        is_organic: true, is_handcrafted: true, is_limited_edition: false, 
        seo_title: '', seo_description: '', seo_keywords: '',
        stock_count: 0
    });
    const [formTab, setFormTab] = useState('general');
    const [variants, setVariants] = useState<any[]>([]);
    const [newVariant, setNewVariant] = useState({ variant_name: '', price: '', stock_count: '', sku: '' });

    const [uploadingField, setUploadingField] = useState<string | null>(null);

    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${API_URL}${url}`;
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingField(field);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const token = localStorage.getItem('paidhu_token');
            const res = await fetch(`${API_URL}/api/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Upload failed');

            if (field === 'gallery_images') {
                const currentGallery = productForm.gallery_images ? productForm.gallery_images.split(',').map(s => s.trim()).filter(Boolean) : [];
                setProductForm({ ...productForm, gallery_images: [...currentGallery, data.url].join(', ') });
            } else {
                setProductForm({ ...productForm, [field]: data.url });
            }
            setProductFormMessage({ type: 'success', text: 'Image uploaded successfully!' });
        } catch (err: any) {
            setProductFormMessage({ type: 'error', text: err.message });
        } finally {
            setUploadingField(null);
        }
    };

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
                benefits: "Anti-inflammatory, Boosts Mood",
                slug: "kashmiri-mongra-saffron",
                sku: "SAF-MON-01"
            },
            {
                name: "Tanner's Jam",
                title: "Avaram Poo Floral Jam",
                category: "Petal Jam",
                price: "350",
                image_url: "https://paidhu.com/wp-content/uploads/2025/04/cassia--300x300.jpg",
                short_description: "Traditional wellness spread made from Avaram Poo flowers.",
                features: "No Maida, 100% Natural, No Preservatives",
                benefits: "Body Cooling, Skin Health",
                slug: "tanners-jam",
                sku: "JAM-TAN-02"
            },
            {
                name: "Bloom Cookies - Hibiscus",
                title: "Floral Infused Healthy Cookies",
                category: "Bloom Cookies",
                price: "150",
                image_url: "https://paidhu.com/wp-content/uploads/2025/07/Paidhu-Cookies-300x300.jpg",
                short_description: "Delicious cookies baked with the goodness of hibiscus.",
                features: "No Refined Sugar, No Maida",
                benefits: "Healthy Snack, Rich in Fiber",
                slug: "bloom-cookies-hibiscus",
                sku: "CKI-HIB-03"
            },
            {
                name: "Rose Gulkhand Jam",
                title: "Premium Rose Preserve",
                category: "Petal Jam",
                price: "350",
                image_url: "https://paidhu.com/wp-content/uploads/2024/12/Rose-Gulkhand-300x300.png",
                short_description: "Traditional cooling rose preserve packed with antioxidants.",
                features: "Fresh Rose Petals, Organic Honey",
                benefits: "Digestive Balance, Natural Coolant",
                slug: "rose-gulkhand-jam",
                sku: "JAM-ROS-04"
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
    const token = localStorage.getItem('paidhu_token');

    const fetchVariants = async (productId: number) => {
        try {
            const res = await fetch(`${API_URL}/api/products/${productId}/variants`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setVariants(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDuplicateProduct = async (id: number) => {
        try {
            const res = await fetch(`${API_URL}/api/products/${id}/duplicate`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            fetchProducts();
            setProductFormMessage({ text: 'Product duplicated successfully!', type: 'success' });
        } catch (err: any) {
            setProductFormMessage({ text: err.message, type: 'error' });
        }
    };

    const handleAddVariant = async () => {
        if (!editingProductId) return;
        try {
            await fetch(`${API_URL}/api/products/${editingProductId}/variants`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(newVariant)
            });
            fetchVariants(editingProductId);
            setNewVariant({ variant_name: '', price: '', stock_count: '', sku: '' });
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteVariant = async (vid: number) => {
        try {
            await fetch(`${API_URL}/api/admin/variants/${vid}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (editingProductId) fetchVariants(editingProductId);
        } catch (err) {
            console.error(err);
        }
    };

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
                upsell_ids: '', cross_sell_ids: '', attributes: '',
                ingredients: '', brewing_guide: '', storage_instructions: '', floral_notes: '', 
                aroma_profile: '', taste_notes: '', caffeine_level: 'None', 
                is_organic: true, is_handcrafted: true, is_limited_edition: false, 
                seo_title: '', seo_description: '', seo_keywords: '',
                stock_count: 0
            });
            setEditingProductId(null);
            
            fetchProducts();
            
            setTimeout(() => setProductFormMessage({ type: '', text: '' }), 5000);
        } catch (err: any) {
            setProductFormMessage({ type: 'error', text: err.message });
        }
    };

    const handleEditProduct = (prod: any) => {
        setEditingProductId(prod.id);
        setProductForm({
            ...prod,
            features: typeof prod.features === 'string' ? JSON.parse(prod.features || '[]').join(', ') : (Array.isArray(prod.features) ? prod.features.join(', ') : prod.features),
            benefits: typeof prod.benefits === 'string' ? JSON.parse(prod.benefits || '[]').join(', ') : (Array.isArray(prod.benefits) ? prod.benefits.join(', ') : prod.benefits),
            gallery_images: typeof prod.gallery_images === 'string' ? JSON.parse(prod.gallery_images || '[]').join(', ') : (Array.isArray(prod.gallery_images) ? prod.gallery_images.join(', ') : prod.gallery_images),
            sizes: typeof prod.sizes === 'string' ? JSON.parse(prod.sizes || '[]').join(', ') : (Array.isArray(prod.sizes) ? prod.sizes.join(', ') : prod.sizes),
            attributes: typeof prod.attributes === 'string' ? prod.attributes : JSON.stringify(prod.attributes || {}),
        });
        fetchVariants(prod.id);
        setFormTab('general');
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
                    <div className="w-16 h-16 bg-paidhu-maroon rounded-2xl flex items-center justify-center rotate-3 shadow-md relative z-10">
                        <LayoutList className="w-8 h-8 text-white" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-bold text-paidhu-maroon uppercase tracking-widest font-brand">Total Modules</p>
                        <p className="text-4xl font-brand font-bold text-paidhu-slate">{adminProducts.length}</p>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border-2 border-paidhu-peach flex items-center gap-6 relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-paidhu-peach rounded-full opacity-50"></div>
                    <div className="w-16 h-16 bg-paidhu-peach rounded-2xl flex items-center justify-center -rotate-3 shadow-md relative z-10">
                        <Check className="w-8 h-8 text-paidhu-slate" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-bold text-paidhu-peach drop-shadow-sm uppercase tracking-widest font-brand">Active Storefront</p>
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

        {/* Dashboard Tabs */}
        <div className="flex gap-4 mb-10">
            <button 
                onClick={() => setActiveTab('products')}
                className={`px-10 py-4 rounded-2xl font-brand font-bold text-lg transition-all flex items-center gap-3 shadow-md ${activeTab === 'products' ? 'bg-paidhu-maroon text-white scale-105' : 'bg-white text-paidhu-slate hover:bg-paidhu-peach'}`}
            >
                <Package className="w-5 h-5" /> Manage Products
            </button>
            <button
                onClick={() => setActiveTab('orders')}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-brand font-black transition-all ${activeTab === 'orders' ? 'bg-paidhu-maroon text-white shadow-xl translate-y-[-2px]' : 'bg-white text-paidhu-slate hover:bg-gray-50'}`}
            >
                <ShoppingBag className="w-5 h-5" /> Order Management
            </button>
            <button
                onClick={() => setActiveTab('coupons')}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-brand font-black transition-all ${activeTab === 'coupons' ? 'bg-paidhu-maroon text-white shadow-xl translate-y-[-2px]' : 'bg-white text-paidhu-slate hover:bg-gray-50'}`}
            >
                <Tag className="w-5 h-5" /> Coupons
            </button>
        </div>

        {activeTab === 'orders' && (
            <AdminOrderManagement 
                API_URL={API_URL}
                token={localStorage.getItem('paidhu_token') || ''}
            />
        )}
        {activeTab === 'coupons' && (
            <AdminCouponManagement 
                API_URL={API_URL}
                token={localStorage.getItem('paidhu_token') || ''}
            />
        )}

        {activeTab === 'products' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* LEFT COLUMN: PRODUCT LIST */}
                <div className="xl:col-span-1 bg-white rounded-3xl shadow-md border-2 border-paidhu-peach overflow-hidden flex flex-col h-[750px]">
                    <div className="bg-paidhu-peach px-8 py-5 border-b-2 border-paidhu-peach/20 flex items-center gap-3">
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
                                    <div key={i} className="p-4 bg-paidhu-cream hover:bg-paidhu-mint border border-transparent hover:border-paidhu-maroon/30 rounded-2xl flex items-center gap-4 transition-all duration-300">
                                        <div className="w-14 h-14 bg-white rounded-xl shadow-sm border border-gray-100 p-1 flex-shrink-0">
                                            {prod.image_url ? (
                                                <img src={getImageUrl(prod.image_url)} alt={prod.name} className="w-full h-full object-contain" />
                                            ) : (
                                                <div className="w-full h-full bg-gray-50 rounded-lg flex items-center justify-center text-gray-300"><LayoutList className="w-5 h-5"/></div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-base font-brand text-paidhu-slate truncate">{prod.name}</h4>
                                            <p className="text-sm font-semibold text-gray-500 truncate">{prod.category} • ₹{parseFloat(prod.price).toFixed(2)}</p>
                                        </div>

                                        <div className="flex-shrink-0 flex flex-col gap-2">
                                            <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full text-center ${prod.status === 'Active' ? 'bg-paidhu-maroon text-white' : 'bg-gray-400 text-white'}`}>
                                                {prod.status}
                                            </span>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleEditProduct(prod)} className="p-1.5 bg-white border border-paidhu-peach rounded-lg text-paidhu-maroon hover:bg-paidhu-mint transition-colors shadow-sm" title="Edit">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDuplicateProduct(prod.id)} className="p-1.5 bg-white border border-paidhu-peach rounded-lg text-paidhu-maroon hover:bg-paidhu-mint transition-colors shadow-sm" title="Duplicate">
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDeleteProduct(prod.id)} className="p-1.5 bg-white border border-paidhu-peach rounded-lg text-paidhu-maroon hover:bg-red-50 transition-colors shadow-sm" title="Delete">
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

                {/* RIGHT COLUMN: ADD FORM & ASSETS */}
                <div className="xl:col-span-2 space-y-8">
                    {/* ASSET BUCKET QUICK UPLOAD */}
                    <div className="bg-paidhu-maroon rounded-3xl p-6 shadow-lg border-2 border-paidhu-peach/30 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <Camera className="w-6 h-6 text-paidhu-peach" />
                                <h3 className="font-brand font-bold text-lg uppercase tracking-widest">Asset Bucket</h3>
                            </div>
                            <p className="text-xs font-bold text-white/70">Upload images for features/descriptions</p>
                        </div>
                        <div className="flex gap-4">
                            <label className={`flex-1 cursor-pointer bg-white/10 hover:bg-white/20 border-2 border-dashed border-white/30 rounded-2xl p-4 transition-all flex flex-col items-center justify-center gap-2 ${uploadingField === 'asset_bucket' ? 'animate-pulse' : ''}`}>
                                <Upload className="w-8 h-8 text-paidhu-peach" />
                                <span className="text-sm font-bold">Click to upload asset</span>
                                <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'asset_bucket')} accept="image/*" />
                            </label>
                            <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/10 overflow-y-auto max-h-[100px] custom-scrollbar">
                                <p className="text-[10px] font-black uppercase text-paidhu-peach mb-2 tracking-widest">Recent Uploads</p>
                                <div className="space-y-2">
                                    {/* This is a local UI state we'd need to track, but for now we'll just show the last one */}
                                    {productForm.image_url.startsWith('/uploads') && (
                                        <div className="flex items-center justify-between bg-black/20 p-2 rounded-lg gap-2">
                                            <span className="text-[10px] truncate flex-1 font-mono">{productForm.image_url}</span>
                                            <button onClick={() => navigator.clipboard.writeText(productForm.image_url)} className="text-[10px] bg-paidhu-maroon px-2 py-1 rounded font-bold hover:bg-paidhu-maroon/80">Copy</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-md border-2 border-paidhu-maroon/20 overflow-hidden h-[750px] flex flex-col relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-paidhu-mint rounded-bl-full opacity-50 pointer-events-none"></div>
                        <div className={`px-8 py-5 flex items-center justify-between flex-shrink-0 relative z-10 transition-colors duration-500 bg-paidhu-maroon`}>
                            <div className="flex items-center gap-3">
                                {editingProductId ? <Sparkles className="w-6 h-6 text-white" /> : <PlusCircle className="w-6 h-6 text-paidhu-peach" />}
                                <h2 className="text-lg font-brand font-bold text-white uppercase tracking-wider">
                                    {editingProductId ? 'Update Product' : 'Add New Product'}
                                </h2>
                            </div>

                            <div className="flex gap-4">
                                {editingProductId && (
                                    <button 
                                        onClick={() => {
                                            setEditingProductId(null);
                                            setProductForm({ 
                                                name: '', title: '', category: 'Petal Jam', description: '', short_description: '', image_url: '', banner_image: '', features: '', benefits: '', interest_rate: '', eligibility_details: '', status: 'Active', display_order: '0', slug: '', cta_text: 'Buy Now', redirect_link: '', price: '',
                                                gallery_images: '', on_sale: false, original_price: '', sizes: '', sku: '', additional_info: '',
                                                gtin: '', stock_status: 'In stock', weight_g: '', length_cm: '', width_cm: '', height_cm: '',
                                                upsell_ids: '', cross_sell_ids: '', attributes: '',
                                                ingredients: '', brewing_guide: '', storage_instructions: '', floral_notes: '', 
                                                aroma_profile: '', taste_notes: '', caffeine_level: 'None', 
                                                is_organic: true, is_handcrafted: true, is_limited_edition: false, 
                                                seo_title: '', seo_description: '', seo_keywords: '',
                                                stock_count: 0
                                            });
                                        }}
                                        className="bg-white/20 hover:bg-white/30 text-white px-4 py-1.5 rounded-full text-xs font-bold font-brand"
                                    >
                                        Cancel Edit
                                    </button>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                            {/* FORM TABS */}
                            <div className="flex bg-gray-50 border-b border-gray-100 px-8">
                                {['general', 'pricing', 'inventory', 'wellness', 'variants', 'seo'].map(tab => (
                                    <button 
                                        key={tab}
                                        onClick={() => setFormTab(tab)}
                                        className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-4 ${formTab === tab ? 'border-paidhu-maroon text-paidhu-maroon bg-white' : 'border-transparent text-gray-400 hover:text-paidhu-slate'}`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            <form className="p-10 space-y-10" onSubmit={handleProductSubmit}>
                                {productFormMessage.text && (
                                    <div className={`p-4 rounded-xl text-base font-bold text-center border-2 ${productFormMessage.type === 'error' ? 'bg-red-50 text-paidhu-maroon border-red-100' : productFormMessage.type === 'success' ? 'bg-paidhu-mint text-paidhu-maroon border-paidhu-maroon/30' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                        {productFormMessage.text}
                                    </div>
                                )}

                                {formTab === 'general' && (
                                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="col-span-full border-b-2 border-paidhu-peach pb-4">
                                                <h3 className="font-brand font-bold text-paidhu-maroon text-lg uppercase tracking-widest flex items-center gap-2">
                                                    <Leaf className="w-5 h-5"/> Basic Information
                                                </h3>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Product Name *</label>
                                                <input type="text" required value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-paidhu-maroon rounded-xl text-base font-bold transition-all" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Category</label>
                                                <select value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-paidhu-maroon rounded-xl text-base font-bold transition-all">
                                                    {['Saffron', 'Combo', 'Bloom powder', 'Gift box', 'Petal jam', 'Brew flora', 'Bloom cookies', 'Medley teas'].map(c => <option key={c}>{c}</option>)}
                                                </select>
                                            </div>
                                            <div className="col-span-full">
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Short Description</label>
                                                <textarea rows={2} value={productForm.short_description} onChange={e => setProductForm({...productForm, short_description: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-paidhu-maroon rounded-xl text-base font-bold transition-all" />
                                            </div>
                                            <div className="col-span-full">
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Full Description</label>
                                                <textarea rows={4} value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-paidhu-maroon rounded-xl text-base font-bold transition-all" />
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="col-span-full border-b-2 border-paidhu-peach pb-4">
                                                <h3 className="font-brand font-bold text-paidhu-maroon text-lg uppercase tracking-widest flex items-center gap-2">
                                                    <Camera className="w-5 h-5"/> Product Media
                                                </h3>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Main Image URL</label>
                                                <div className="flex gap-2">
                                                    <input type="text" value={productForm.image_url} onChange={e => setProductForm({...productForm, image_url: e.target.value})} className="flex-1 px-4 py-3 bg-gray-50 rounded-xl font-bold" />
                                                    <label className="bg-paidhu-maroon text-white p-3 rounded-xl cursor-pointer">
                                                        <Upload className="w-5 h-5" />
                                                        <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'image_url')} />
                                                    </label>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Gallery (Comma Separated)</label>
                                                <textarea rows={1} value={productForm.gallery_images} onChange={e => setProductForm({...productForm, gallery_images: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl font-bold" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {formTab === 'pricing' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="col-span-full border-b-2 border-paidhu-peach pb-4">
                                            <h3 className="font-brand font-bold text-paidhu-maroon text-lg uppercase tracking-widest flex items-center gap-2">
                                                <IndianRupee className="w-5 h-5"/> Pricing & Offers
                                            </h3>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Regular Price (₹)</label>
                                            <input type="number" value={productForm.original_price} onChange={e => setProductForm({...productForm, original_price: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl font-bold" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Sale Price (₹)</label>
                                            <input type="number" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl font-bold" />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <input type="checkbox" checked={productForm.on_sale} onChange={e => setProductForm({...productForm, on_sale: e.target.checked})} className="w-5 h-5 accent-paidhu-maroon" />
                                            <span className="text-sm font-bold text-paidhu-slate uppercase tracking-widest">Enable Sale Badge</span>
                                        </div>
                                    </div>
                                )}

                                {formTab === 'inventory' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="col-span-full border-b-2 border-paidhu-peach pb-4">
                                            <h3 className="font-brand font-bold text-paidhu-maroon text-lg uppercase tracking-widest flex items-center gap-2">
                                                <Package className="w-5 h-5"/> Stock Management
                                            </h3>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">SKU Code</label>
                                            <input type="text" value={productForm.sku} onChange={e => setProductForm({...productForm, sku: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl font-bold" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Stock Quantity</label>
                                            <input type="number" value={productForm.stock_count} onChange={e => setProductForm({...productForm, stock_count: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl font-bold" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Stock Status</label>
                                            <select value={productForm.stock_status} onChange={e => setProductForm({...productForm, stock_status: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl font-bold">
                                                <option>In stock</option>
                                                <option>Out of stock</option>
                                                <option>On backorder</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {formTab === 'wellness' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="col-span-full border-b-2 border-paidhu-peach pb-4">
                                            <h3 className="font-brand font-bold text-paidhu-maroon text-lg uppercase tracking-widest flex items-center gap-2">
                                                <Sparkles className="w-5 h-5"/> Paidhu Wellness Profile
                                            </h3>
                                        </div>
                                        <div className="col-span-full">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Ingredients</label>
                                            <textarea rows={2} value={productForm.ingredients} onChange={e => setProductForm({...productForm, ingredients: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl font-bold" />
                                        </div>
                                        <div className="col-span-full">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Brewing Guide</label>
                                            <textarea rows={2} value={productForm.brewing_guide} onChange={e => setProductForm({...productForm, brewing_guide: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl font-bold" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Caffeine Level</label>
                                            <select value={productForm.caffeine_level} onChange={e => setProductForm({...productForm, caffeine_level: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl font-bold">
                                                <option>None</option>
                                                <option>Low</option>
                                                <option>Medium</option>
                                                <option>High</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-4">
                                            <label className="flex items-center gap-3">
                                                <input type="checkbox" checked={productForm.is_organic} onChange={e => setProductForm({...productForm, is_organic: e.target.checked})} className="accent-paidhu-maroon" />
                                                <span className="text-xs font-bold uppercase tracking-widest">Organic Badge</span>
                                            </label>
                                            <label className="flex items-center gap-3">
                                                <input type="checkbox" checked={productForm.is_handcrafted} onChange={e => setProductForm({...productForm, is_handcrafted: e.target.checked})} className="accent-paidhu-maroon" />
                                                <span className="text-xs font-bold uppercase tracking-widest">Handcrafted Badge</span>
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {formTab === 'variants' && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="col-span-full border-b-2 border-paidhu-peach pb-4">
                                            <h3 className="font-brand font-bold text-paidhu-maroon text-lg uppercase tracking-widest flex items-center gap-2">
                                                <LayoutList className="w-5 h-5"/> Size & Pack Variants
                                            </h3>
                                        </div>
                                        
                                        {!editingProductId ? (
                                            <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-100 text-yellow-700 font-bold text-sm">
                                                Please save the product first to enable variant management.
                                            </div>
                                        ) : (
                                            <>
                                                <div className="grid grid-cols-4 gap-4 bg-gray-50 p-6 rounded-3xl">
                                                    <input placeholder="Name (e.g. 50g)" value={newVariant.variant_name} onChange={e => setNewVariant({...newVariant, variant_name: e.target.value})} className="px-4 py-2 rounded-xl text-sm font-bold" />
                                                    <input placeholder="Price" type="number" value={newVariant.price} onChange={e => setNewVariant({...newVariant, price: e.target.value})} className="px-4 py-2 rounded-xl text-sm font-bold" />
                                                    <input placeholder="Stock" type="number" value={newVariant.stock_count} onChange={e => setNewVariant({...newVariant, stock_count: e.target.value})} className="px-4 py-2 rounded-xl text-sm font-bold" />
                                                    <button onClick={handleAddVariant} type="button" className="bg-paidhu-maroon text-white rounded-xl font-brand font-bold text-sm">Add Variant</button>
                                                </div>

                                                <div className="space-y-3">
                                                    {variants.map(v => (
                                                        <div key={v.id} className="flex justify-between items-center bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                                                            <span className="font-bold text-paidhu-slate">{v.variant_name}</span>
                                                            <span className="font-brand font-black text-paidhu-maroon">₹{v.price}</span>
                                                            <span className="text-gray-400 font-bold text-xs">{v.stock_count} in stock</span>
                                                            <button onClick={() => handleDeleteVariant(v.id)} type="button" className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><X className="w-4 h-4"/></button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}

                                {formTab === 'seo' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="col-span-full border-b-2 border-paidhu-peach pb-4">
                                            <h3 className="font-brand font-bold text-paidhu-maroon text-lg uppercase tracking-widest flex items-center gap-2">
                                                <TrendingUp className="w-5 h-5"/> SEO Optimization
                                            </h3>
                                        </div>
                                        <div className="col-span-full">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Meta Title</label>
                                            <input type="text" value={productForm.seo_title} onChange={e => setProductForm({...productForm, seo_title: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl font-bold" />
                                        </div>
                                        <div className="col-span-full">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Meta Description</label>
                                            <textarea rows={3} value={productForm.seo_description} onChange={e => setProductForm({...productForm, seo_description: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl font-bold" />
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-4 pt-6">
                                    <button 
                                        type="submit"
                                        className="flex-1 bg-paidhu-maroon text-white py-5 rounded-2xl text-xl font-brand font-bold shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    >
                                        {editingProductId ? 'Update Product' : 'Create Product'}
                                    </button>
                                    {editingProductId && (
                                        <button 
                                            type="button"
                                            onClick={() => handleDuplicateProduct(editingProductId)}
                                            className="bg-paidhu-peach text-paidhu-maroon px-8 py-5 rounded-2xl text-lg font-brand font-bold shadow-md hover:bg-paidhu-peach/80 transition-all flex items-center gap-2"
                                        >
                                            <Copy className="w-5 h-5" /> Duplicate
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
);
}
