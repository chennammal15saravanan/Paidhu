import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Calendar, X, Percent, IndianRupee, RefreshCw } from 'lucide-react';

interface Coupon {
    id: number;
    coupon_code: string;
    coupon_name: string;
    description: string;
    discount_type: 'Percentage' | 'Fixed' | 'FreeShipping';
    discount_value: string;
    min_order_amount: string;
    max_discount_amount: string | null;
    start_date: string | null;
    expiry_date: string | null;
    usage_limit: number | null;
    used_count: number;
    per_user_limit: number;
    status: 'Active' | 'Expired' | 'Disabled';
    first_order_only: boolean;
    free_shipping: boolean;
    created_at: string;
}

interface AdminCouponManagementProps {
    API_URL: string;
    token: string;
}

export default function AdminCouponManagement({ API_URL, token }: AdminCouponManagementProps) {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
    const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({
        discount_type: 'Percentage',
        status: 'Active',
        per_user_limit: 1,
        first_order_only: false,
        free_shipping: false,
        discount_value: '0',
        min_order_amount: '0'
    });

    const fetchCoupons = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/coupons`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setCoupons(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Fetch coupons failed", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleCreateOrUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingCoupon ? `${API_URL}/api/admin/coupons/${editingCoupon.id}` : `${API_URL}/api/admin/coupons`;
        const method = editingCoupon ? 'PUT' : 'POST';
        
        try {
            const res = await fetch(url, {
                method: method,
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newCoupon)
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            
            setIsModalOpen(false);
            setEditingCoupon(null);
            setNewCoupon({
                discount_type: 'Percentage',
                status: 'Active',
                per_user_limit: 1,
                first_order_only: false,
                free_shipping: false
            });
            fetchCoupons();
            alert(`Coupon ${editingCoupon ? 'updated' : 'created'} successfully!`);
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleEditClick = (coupon: Coupon) => {
        setEditingCoupon(coupon);
        setNewCoupon(coupon);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this coupon?')) return;
        try {
            const res = await fetch(`${API_URL}/api/admin/coupons/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchCoupons();
        } catch (err) {
            alert('Delete failed');
        }
    };

    const toggleStatus = async (id: number, currentStatus: string) => {
        const newStatus = currentStatus === 'Active' ? 'Disabled' : 'Active';
        try {
            await fetch(`${API_URL}/api/admin/coupons/${id}/status`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });
            fetchCoupons();
        } catch (err) {
            alert('Update failed');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-3xl font-brand font-black text-paidhu-slate flex items-center gap-3">
                        <Tag className="w-8 h-8 text-paidhu-maroon" /> Coupon <span className="text-paidhu-maroon">Management</span>
                    </h2>
                    <p className="text-gray-500 font-bold mt-1">Create and manage discounts for your customers</p>
                </div>
                <button 
                    onClick={() => { setEditingCoupon(null); setNewCoupon({ discount_type: 'Percentage', status: 'Active', per_user_limit: 1, first_order_only: false, free_shipping: false, discount_value: '0', min_order_amount: '0' }); setIsModalOpen(true); }}
                    className="bg-paidhu-maroon text-white px-8 py-4 rounded-2xl font-brand font-bold shadow-xl hover:bg-paidhu-maroon/90 transition-all flex items-center gap-2 border-b-4 border-paidhu-maroon/50"
                >
                    <Plus className="w-5 h-5" /> Create New Coupon
                </button>
            </div>

            {/* Coupons List */}
            <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Coupon Details</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Discount</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Usage</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Expiry</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <RefreshCw className="w-8 h-8 text-paidhu-maroon animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : coupons.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center text-gray-400 font-bold">No coupons found.</td>
                                </tr>
                            ) : coupons.map((coupon) => (
                                <tr key={coupon.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-paidhu-cream rounded-xl flex items-center justify-center border border-paidhu-peach/30">
                                                <Tag className="w-6 h-6 text-paidhu-maroon" />
                                            </div>
                                            <div>
                                                <p className="font-brand font-black text-paidhu-slate text-lg">{coupon.coupon_code}</p>
                                                <p className="text-xs text-gray-400 font-bold">{coupon.coupon_name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            {coupon.discount_type === 'Percentage' ? (
                                                <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 uppercase tracking-wider">
                                                    <Percent className="w-3 h-3" /> {coupon.discount_value}% OFF
                                                </span>
                                            ) : coupon.discount_type === 'Fixed' ? (
                                                <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 uppercase tracking-wider">
                                                    <IndianRupee className="w-3 h-3" /> {coupon.discount_value} OFF
                                                </span>
                                            ) : (
                                                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 uppercase tracking-wider">
                                                    FREE SHIPPING
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">Min Order: ₹{coupon.min_order_amount}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-full bg-gray-100 h-2 rounded-full max-w-[80px]">
                                                <div 
                                                    className="bg-paidhu-maroon h-full rounded-full" 
                                                    style={{ width: `${coupon.usage_limit ? (coupon.used_count / coupon.usage_limit) * 100 : 0}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-black text-paidhu-slate">{coupon.used_count}</span>
                                            {coupon.usage_limit && <span className="text-xs text-gray-400 font-bold">/ {coupon.usage_limit}</span>}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <button 
                                            onClick={() => toggleStatus(coupon.id, coupon.status)}
                                            className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                                                coupon.status === 'Active' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                            }`}
                                        >
                                            {coupon.status}
                                        </button>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                                            <Calendar className="w-4 h-4" />
                                            {coupon.expiry_date ? new Date(coupon.expiry_date).toLocaleDateString() : 'Never'}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => handleEditClick(coupon)}
                                                className="p-2 text-gray-400 hover:text-paidhu-maroon hover:bg-paidhu-maroon/5 rounded-lg transition-all"
                                                title="Edit Coupon"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(coupon.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                title="Delete Coupon"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Coupon Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-paidhu-slate/60 backdrop-blur-md z-[200] flex items-center justify-center p-6">
                    <div className="bg-white rounded-[40px] p-10 max-w-2xl w-full shadow-2xl relative animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <button onClick={() => { setIsModalOpen(false); setEditingCoupon(null); }} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full">
                            <X className="w-6 h-6 text-gray-400" />
                        </button>
                        
                        <h3 className="text-3xl font-brand font-black text-paidhu-slate mb-8 flex items-center gap-3">
                            <Tag className="w-8 h-8 text-paidhu-maroon" /> {editingCoupon ? 'Edit' : 'New'} <span className="text-paidhu-maroon">Coupon</span>
                        </h3>

                        <form onSubmit={handleCreateOrUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Basic Info */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Coupon Code</label>
                                <input 
                                    placeholder="e.g. FESTIVAL50"
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-paidhu-maroon transition-all font-bold uppercase"
                                    value={newCoupon.coupon_code}
                                    onChange={e => setNewCoupon({...newCoupon, coupon_code: e.target.value.toUpperCase()})}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Coupon Name</label>
                                <input 
                                    placeholder="e.g. Diwali Special"
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-paidhu-maroon transition-all font-bold"
                                    value={newCoupon.coupon_name}
                                    onChange={e => setNewCoupon({...newCoupon, coupon_name: e.target.value})}
                                    required
                                />
                            </div>

                            {/* Discount Logic */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Discount Type</label>
                                <select 
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-paidhu-maroon transition-all font-bold appearance-none"
                                    value={newCoupon.discount_type}
                                    onChange={e => setNewCoupon({...newCoupon, discount_type: e.target.value as any})}
                                >
                                    <option value="Percentage">Percentage (%)</option>
                                    <option value="Fixed">Fixed Amount (₹)</option>
                                    <option value="FreeShipping">Free Shipping</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Discount Value</label>
                                <input 
                                    type="number"
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-paidhu-maroon transition-all font-bold"
                                    value={newCoupon.discount_value}
                                    onChange={e => setNewCoupon({...newCoupon, discount_value: e.target.value})}
                                    disabled={newCoupon.discount_type === 'FreeShipping'}
                                />
                            </div>

                            {/* Limits */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Min Order Amount (₹)</label>
                                <input 
                                    type="number"
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-paidhu-maroon transition-all font-bold"
                                    value={newCoupon.min_order_amount}
                                    onChange={e => setNewCoupon({...newCoupon, min_order_amount: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Max Discount Amount (₹)</label>
                                <input 
                                    type="number"
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-paidhu-maroon transition-all font-bold"
                                    value={newCoupon.max_discount_amount || ''}
                                    onChange={e => setNewCoupon({...newCoupon, max_discount_amount: e.target.value})}
                                    placeholder="Optional"
                                />
                            </div>

                            {/* Usage Limits */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Total Usage Limit</label>
                                <input 
                                    type="number"
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-paidhu-maroon transition-all font-bold"
                                    value={newCoupon.usage_limit || ''}
                                    onChange={e => setNewCoupon({...newCoupon, usage_limit: parseInt(e.target.value)})}
                                    placeholder="No limit if empty"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Per User Limit</label>
                                <input 
                                    type="number"
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-paidhu-maroon transition-all font-bold"
                                    value={newCoupon.per_user_limit || 1}
                                    onChange={e => setNewCoupon({...newCoupon, per_user_limit: parseInt(e.target.value)})}
                                />
                            </div>

                            {/* Dates */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Expiry Date</label>
                                <input 
                                    type="date"
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-paidhu-maroon transition-all font-bold"
                                    value={newCoupon.expiry_date || ''}
                                    onChange={e => setNewCoupon({...newCoupon, expiry_date: e.target.value})}
                                />
                            </div>

                            {/* Options */}
                            <div className="flex flex-col gap-4 mt-6">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${newCoupon.first_order_only ? 'bg-paidhu-maroon border-paidhu-maroon' : 'border-gray-200 group-hover:border-paidhu-peach'}`}>
                                        <input 
                                            type="checkbox" className="hidden" 
                                            checked={newCoupon.first_order_only}
                                            onChange={e => setNewCoupon({...newCoupon, first_order_only: e.target.checked})}
                                        />
                                        {newCoupon.first_order_only && <Plus className="w-4 h-4 text-white rotate-45" />}
                                    </div>
                                    <span className="font-bold text-paidhu-slate">First Order Only</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${newCoupon.free_shipping ? 'bg-paidhu-maroon border-paidhu-maroon' : 'border-gray-200 group-hover:border-paidhu-peach'}`}>
                                        <input 
                                            type="checkbox" className="hidden" 
                                            checked={newCoupon.free_shipping}
                                            onChange={e => setNewCoupon({...newCoupon, free_shipping: e.target.checked})}
                                        />
                                        {newCoupon.free_shipping && <Plus className="w-4 h-4 text-white rotate-45" />}
                                    </div>
                                    <span className="font-bold text-paidhu-slate">Include Free Shipping</span>
                                </label>
                            </div>

                            <button 
                                className="w-full md:col-span-2 bg-paidhu-maroon text-white py-5 rounded-2xl text-xl font-brand font-bold shadow-xl hover:bg-paidhu-maroon/90 transition-all mt-6 border-b-4 border-paidhu-maroon/50"
                            >
                                {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
