import { useState, useEffect } from 'react';
import { ShoppingBag, Package, Truck, XCircle, Search, Users, DollarSign, X, CreditCard } from 'lucide-react';

interface Order {
    id: number;
    order_id: string;
    user_id: number;
    full_name: string;
    email: string;
    phone: string;
    address: string;
    pincode: string;
    city: string;
    state: string;
    total_amount: string;
    payment_method: string;
    payment_status: string;
    order_status: string;
    tracking_id?: string;
    created_at: string;
    items: any[];
}

interface AdminOrderManagementProps {
    API_URL: string;
    token: string;
}

export default function AdminOrderManagement({ API_URL, token }: AdminOrderManagementProps) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [analytics, setAnalytics] = useState<any>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setOrders(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/analytics`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setAnalytics(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchOrders();
        fetchAnalytics();
    }, []);

    const updateStatus = async (id: number, status: string, trackingId?: string) => {
        try {
            const res = await fetch(`${API_URL}/api/admin/orders/${id}/status`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status, trackingId })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            
            setOrders(orders.map(o => o.id === id ? { ...o, order_status: status, tracking_id: trackingId } : o));
            fetchAnalytics();
            alert('Order status updated!');
        } catch (err: any) {
            alert(err.message);
        }
    };

    const filteredOrders = Array.isArray(orders) ? orders.filter(o => {
        const matchesSearch = o.order_id?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              o.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              o.phone?.includes(searchTerm);
        const matchesStatus = statusFilter === 'All' || o.order_status === statusFilter;
        return matchesSearch && matchesStatus;
    }) : [];

    const stats = [
        { label: 'Total Revenue', value: `₹${analytics?.revenue || 0}`, icon: <DollarSign className="w-6 h-6 text-green-500" />, bg: 'bg-green-50' },
        { label: 'Total Orders', value: analytics?.totalOrders || 0, icon: <ShoppingBag className="w-6 h-6 text-blue-500" />, bg: 'bg-blue-50' },
        { label: 'Pending', value: analytics?.pendingOrders || 0, icon: <ClockIcon className="w-6 h-6 text-yellow-500" />, bg: 'bg-yellow-50' },
        { label: 'Cancelled', value: analytics?.cancelledOrders || 0, icon: <XCircle className="w-6 h-6 text-red-500" />, bg: 'bg-red-50' },
    ];

    return (
        <div className="space-y-10">
            {/* Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-50 flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg}`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-brand font-black text-paidhu-slate">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Orders Table Section */}
            <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
                    <h2 className="text-3xl font-brand font-black text-paidhu-slate flex items-center gap-3">
                        <Package className="w-8 h-8 text-paidhu-maroon" /> Order Management
                    </h2>
                    
                    <div className="flex gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                                placeholder="Search by ID or Name..." 
                                value={searchTerm}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-paidhu-maroon transition-all font-bold text-sm"
                            />
                        </div>
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-paidhu-maroon font-bold text-sm outline-none cursor-pointer"
                        >
                            <option value="All">All Statuses</option>
                            {['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Order Details</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Customer</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Amount</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50/30 transition-colors">
                                    <td className="px-8 py-6 cursor-pointer group/row" onClick={() => setSelectedOrder(order)}>
                                        <div className="space-y-1">
                                            <p className="font-brand font-black text-paidhu-slate group-hover/row:text-paidhu-maroon transition-colors">{order.order_id}</p>
                                            <p className="text-[10px] font-bold text-gray-400">{new Date(order.created_at).toLocaleString()}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="space-y-0.5">
                                            <p className="font-bold text-paidhu-slate">{order.full_name}</p>
                                            <p className="text-xs text-gray-400">{order.phone}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 font-brand font-black text-paidhu-maroon">₹{parseFloat(order.total_amount).toFixed(0)}</td>
                                    <td className="px-8 py-6">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyles(order.order_status)}`}>
                                            {order.order_status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <select 
                                                className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold outline-none focus:border-paidhu-maroon transition-all cursor-pointer"
                                                onChange={(e) => updateStatus(order.id, e.target.value, order.tracking_id)}
                                                value={order.order_status}
                                            >
                                                {['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                            {order.order_status === 'Shipped' && !order.tracking_id && (
                                                <button 
                                                    onClick={() => {
                                                        const tid = prompt('Enter Tracking ID:');
                                                        if (tid) updateStatus(order.id, 'Shipped', tid);
                                                    }}
                                                    className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all"
                                                    title="Add Tracking ID"
                                                >
                                                    <Truck className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredOrders.length === 0 && !loading && (
                    <div className="p-20 text-center text-gray-400 font-bold">No matching orders found.</div>
                )}
            </div>

            {/* ORDER DETAILS MODAL */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-paidhu-slate/60 backdrop-blur-md z-[200] flex items-center justify-center p-6">
                    <div className="bg-white rounded-[40px] p-0 max-w-4xl w-full shadow-2xl relative animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="bg-paidhu-maroon p-8 text-white flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-2xl font-brand font-black flex items-center gap-3">
                                    <ShoppingBag className="w-8 h-8" /> Order <span className="opacity-70">{selectedOrder.order_id}</span>
                                </h3>
                                <p className="text-white/60 font-bold text-sm mt-1">Placed on {new Date(selectedOrder.created_at).toLocaleString()}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                                <X className="w-7 h-7" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Customer Info */}
                                <div className="space-y-6">
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Users className="w-4 h-4" /> Customer Profile
                                    </h4>
                                    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-4">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Full Name</p>
                                            <p className="font-brand font-black text-paidhu-slate text-lg">{selectedOrder.full_name}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Phone</p>
                                                <p className="font-bold text-paidhu-slate">{selectedOrder.phone}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Email</p>
                                                <p className="font-bold text-paidhu-slate truncate">{selectedOrder.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Shipping Address */}
                                <div className="space-y-6">
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Truck className="w-4 h-4" /> Shipping Destination
                                    </h4>
                                    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Street Address</p>
                                        <p className="font-bold text-paidhu-slate leading-relaxed mb-4">{selectedOrder.address}</p>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="bg-white px-3 py-1 rounded-lg text-xs font-black text-paidhu-slate shadow-sm border border-gray-100">{selectedOrder.city}</span>
                                            <span className="bg-white px-3 py-1 rounded-lg text-xs font-black text-paidhu-slate shadow-sm border border-gray-100">{selectedOrder.state}</span>
                                            <span className="bg-white px-3 py-1 rounded-lg text-xs font-black text-paidhu-maroon shadow-sm border border-gray-100">{selectedOrder.pincode}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Financial Details */}
                            <div className="space-y-6">
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <DollarSign className="w-4 h-4" /> Financial Overview
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-paidhu-cream/20 p-6 rounded-3xl border border-paidhu-peach/20">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Payment Method</p>
                                        <p className="font-brand font-black text-paidhu-slate text-lg flex items-center gap-2 uppercase">
                                            <CreditCard className="w-5 h-5 text-paidhu-maroon" /> {selectedOrder.payment_method}
                                        </p>
                                    </div>
                                    <div className="bg-paidhu-cream/20 p-6 rounded-3xl border border-paidhu-peach/20">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Payment Status</p>
                                        <p className={`font-brand font-black text-lg uppercase ${selectedOrder.payment_status === 'Success' ? 'text-green-600' : 'text-yellow-600'}`}>
                                            {selectedOrder.payment_status}
                                        </p>
                                    </div>
                                    <div className="bg-paidhu-cream/20 p-6 rounded-3xl border border-paidhu-peach/20">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Transaction Details</p>
                                        <p className="font-bold text-gray-500 text-sm italic">
                                            {selectedOrder.payment_details ? (
                                                Object.entries(JSON.parse(typeof selectedOrder.payment_details === 'string' ? selectedOrder.payment_details : JSON.stringify(selectedOrder.payment_details)))
                                                    .map(([k, v]) => v ? `${k}: ${v}` : null)
                                                    .filter(Boolean)
                                                    .join(', ')
                                            ) : 'No extra details'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="space-y-6">
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Package className="w-4 h-4" /> Order Manifest
                                </h4>
                                <div className="border-2 border-gray-50 rounded-[32px] overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase text-left">Product</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase text-center">Qty</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase text-right">Price</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {Array.isArray(selectedOrder.items) && selectedOrder.items.map((item: any, idx: number) => (
                                                <tr key={idx}>
                                                    <td className="px-6 py-4">
                                                        <p className="font-bold text-paidhu-slate">{item.product_name}</p>
                                                        {item.size && <span className="text-[10px] bg-paidhu-cream text-paidhu-maroon px-2 py-0.5 rounded-full font-black uppercase">{item.size}</span>}
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-bold text-paidhu-slate">{item.quantity}</td>
                                                    <td className="px-6 py-4 text-right font-bold text-gray-500">₹{parseFloat(item.price).toFixed(0)}</td>
                                                    <td className="px-6 py-4 text-right font-brand font-black text-paidhu-maroon">₹{(item.quantity * parseFloat(item.price)).toFixed(0)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-gray-50/50">
                                            <tr>
                                                <td colSpan={3} className="px-6 py-4 text-right text-sm font-black text-gray-400 uppercase tracking-widest">Order Total</td>
                                                <td className="px-6 py-4 text-right text-2xl font-brand font-black text-paidhu-maroon">₹{parseFloat(selectedOrder.total_amount).toFixed(0)}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            {/* Actions & Status */}
                            <div className="bg-paidhu-cream/30 p-8 rounded-[32px] border-2 border-dashed border-paidhu-peach flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="space-y-4 w-full md:w-auto">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Fulfillment Status</p>
                                    <div className="flex flex-wrap gap-3">
                                        {['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
                                            <button 
                                                key={s}
                                                onClick={() => updateStatus(selectedOrder.id, s, selectedOrder.tracking_id)}
                                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                                    selectedOrder.order_status === s 
                                                    ? getStatusStyles(s) + ' scale-105 shadow-md' 
                                                    : 'bg-white text-gray-400 border-gray-100 hover:border-paidhu-maroon/30'
                                                }`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="w-full md:w-64 space-y-4">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tracking Information</p>
                                    <div className="flex gap-2">
                                        <input 
                                            placeholder="Enter Tracking ID"
                                            className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:border-paidhu-maroon outline-none"
                                            value={selectedOrder.tracking_id || ''}
                                            onChange={(e) => {
                                                const newOrder = { ...selectedOrder, tracking_id: e.target.value };
                                                setSelectedOrder(newOrder);
                                                setOrders(orders.map(o => o.id === selectedOrder.id ? newOrder : o));
                                            }}
                                        />
                                        <button 
                                            onClick={() => updateStatus(selectedOrder.id, selectedOrder.order_status, selectedOrder.tracking_id)}
                                            className="bg-paidhu-maroon text-white px-4 py-2 rounded-xl font-brand font-bold text-xs"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const ClockIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;

const getStatusStyles = (status: string) => {
    switch (status) {
        case 'Pending': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
        case 'Confirmed': return 'bg-blue-50 text-blue-600 border-blue-100';
        case 'Processing': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
        case 'Packed': return 'bg-purple-50 text-purple-600 border-purple-100';
        case 'Shipped': return 'bg-orange-50 text-orange-600 border-orange-100';
        case 'Delivered': return 'bg-green-50 text-green-600 border-green-100';
        case 'Cancelled': return 'bg-red-50 text-red-600 border-red-100';
        default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
};
