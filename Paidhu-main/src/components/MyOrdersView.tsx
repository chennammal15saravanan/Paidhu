import React, { useState, useEffect } from 'react';
import { ShoppingBag, Package, Truck, CheckCircle, XCircle, ChevronRight, Clock, Download, X } from 'lucide-react';

interface Order {
    id: number;
    order_id: string;
    total_amount: string;
    order_status: string;
    payment_status: string;
    payment_method: string;
    created_at: string;
    items: any[];
    tracking_id?: string;
    cancellation_reason?: string;
}

interface MyOrdersViewProps {
    API_URL: string;
    token: string;
    onBack: () => void;
}

export default function MyOrdersView({ API_URL, token, onBack }: MyOrdersViewProps) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cancellingId, setCancellingId] = useState<number | null>(null);
    const [cancelReason, setCancelReason] = useState('');

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${API_URL}/api/orders/my`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setOrders(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleCancelOrder = async (id: number) => {
        if (!cancelReason) {
            alert('Please provide a reason for cancellation.');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/orders/${id}/cancel`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason: cancelReason })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            
            setOrders(orders.map(o => o.id === id ? { ...o, order_status: 'Cancelled', cancellation_reason: cancelReason } : o));
            setCancellingId(null);
            setCancelReason('');
            alert('Order cancelled successfully.');
        } catch (err: any) {
            alert(err.message);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Pending': return <Clock className="w-5 h-5 text-yellow-500" />;
            case 'Confirmed': return <CheckCircle className="w-5 h-5 text-blue-500" />;
            case 'Processing': return <Package className="w-5 h-5 text-indigo-500" />;
            case 'Packed': return <ShoppingBag className="w-5 h-5 text-purple-500" />;
            case 'Shipped': return <Truck className="w-5 h-5 text-orange-500" />;
            case 'Delivered': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'Cancelled': return <XCircle className="w-5 h-5 text-red-500" />;
            default: return <Clock className="w-5 h-5 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Delivered': return 'bg-green-100 text-green-700';
            case 'Cancelled': return 'bg-red-100 text-red-700';
            case 'Shipped': return 'bg-orange-100 text-orange-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#f7f3f0]">
            <div className="animate-spin w-12 h-12 border-4 border-paidhu-maroon border-t-transparent rounded-full"></div>
        </div>
    );

    return (
        <div className="bg-[#f7f3f0] min-h-screen pb-20 pt-10">
            <div className="max-w-5xl mx-auto px-6">
                <div className="flex items-center justify-between mb-10">
                    <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-paidhu-maroon font-bold transition-colors">
                        <ChevronRight className="w-5 h-5 rotate-180" /> Back to Home
                    </button>
                    <h1 className="text-4xl font-brand font-black text-paidhu-slate">My <span className="text-paidhu-maroon">Orders</span></h1>
                </div>

                {(!Array.isArray(orders) || orders.length === 0) ? (
                    <div className="bg-white rounded-[40px] p-20 text-center shadow-sm border-4 border-white">
                        <div className="w-20 h-20 bg-paidhu-cream rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag className="w-10 h-10 text-paidhu-maroon opacity-50" />
                        </div>
                        <h3 className="text-2xl font-brand font-bold text-paidhu-slate mb-2">No orders yet</h3>
                        <p className="text-gray-500 font-bold mb-8">Looks like you haven't placed any orders with us yet.</p>
                        <button onClick={onBack} className="bg-paidhu-maroon text-white px-10 py-4 rounded-2xl font-brand font-bold shadow-lg hover:bg-paidhu-maroon/90 transition-all">
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                {/* Order Header */}
                                <div className="p-6 md:p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between gap-6 bg-gray-50/50">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order ID</p>
                                        <p className="text-lg font-brand font-black text-paidhu-slate">{order.order_id}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Placed On</p>
                                        <p className="text-sm font-bold text-paidhu-slate">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</p>
                                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${getStatusColor(order.order_status)}`}>
                                            {getStatusIcon(order.order_status)}
                                            {order.order_status}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Amount</p>
                                        <p className="text-xl font-brand font-black text-paidhu-maroon">₹{parseFloat(order.total_amount).toFixed(0)}</p>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="p-6 md:p-8 space-y-6">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex gap-6 items-center">
                                            <div className="w-20 h-20 bg-paidhu-cream rounded-2xl p-3 flex-shrink-0 border border-gray-50">
                                                <img src={item.image_url || 'https://paidhu.com/wp-content/uploads/2025/07/saffron-1.jpg'} className="w-full h-full object-contain" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-lg font-brand font-bold text-paidhu-slate truncate">{item.product_name}</h4>
                                                <p className="text-sm text-gray-400 font-bold">Quantity: {item.quantity} {item.size ? `| Size: ${item.size}` : ''}</p>
                                            </div>
                                            <p className="text-lg font-brand font-black text-paidhu-slate">₹{parseFloat(item.price).toFixed(0)}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Order Footer */}
                                <div className="p-6 md:p-8 bg-gray-50/30 border-t border-gray-50 flex flex-wrap gap-4 items-center justify-between">
                                    <div className="flex gap-4">
                                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-black text-gray-600 hover:bg-gray-50 transition-all uppercase tracking-widest shadow-sm">
                                            <Download className="w-4 h-4" /> Invoice
                                        </button>
                                        {['Confirmed', 'Processing', 'Packed'].includes(order.order_status) && (
                                            <button 
                                                onClick={() => setCancellingId(order.id)}
                                                className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-100 rounded-xl text-xs font-black text-red-600 hover:bg-red-100 transition-all uppercase tracking-widest shadow-sm"
                                            >
                                                <XCircle className="w-4 h-4" /> Cancel Order
                                            </button>
                                        )}
                                    </div>
                                    
                                    {order.tracking_id && (
                                        <div className="flex items-center gap-2 text-sm font-bold text-paidhu-slate bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
                                            <Truck className="w-4 h-4 text-indigo-500" />
                                            Tracking ID: <span className="font-black text-indigo-600">{order.tracking_id}</span>
                                        </div>
                                    )}

                                    {order.order_status === 'Cancelled' && order.payment_status === 'Refunded' && (
                                        <div className="flex items-center gap-2 text-sm font-bold text-green-700 bg-green-50 px-4 py-2 rounded-xl border border-green-100">
                                            <CheckCircle className="w-4 h-4" />
                                            Refund Status: <span className="font-black uppercase">Completed</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Cancellation Modal */}
            {cancellingId !== null && (
                <div className="fixed inset-0 bg-paidhu-slate/60 backdrop-blur-md z-[200] flex items-center justify-center p-6">
                    <div className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <button onClick={() => setCancellingId(null)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full">
                            <X className="w-6 h-6 text-gray-400" />
                        </button>
                        
                        <h3 className="text-2xl font-brand font-black text-paidhu-slate mb-2">Cancel Order?</h3>
                        <p className="text-gray-500 font-bold mb-6">Please tell us why you want to cancel this order.</p>
                        
                        <div className="space-y-4">
                            {['Mistake in address', 'Changed my mind', 'Found a better price', 'Ordered by mistake', 'Other'].map(r => (
                                <button 
                                    key={r}
                                    onClick={() => setCancelReason(r)}
                                    className={`w-full p-4 rounded-2xl border-2 text-left font-bold transition-all ${cancelReason === r ? 'border-paidhu-maroon bg-paidhu-maroon/5 text-paidhu-maroon' : 'border-gray-100 hover:border-paidhu-peach'}`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>

                        <button 
                            onClick={() => cancellingId && handleCancelOrder(cancellingId)}
                            className="w-full bg-red-600 text-white py-4 rounded-2xl font-brand font-bold text-lg shadow-xl hover:bg-red-700 transition-all mt-8 border-b-4 border-red-800/50"
                        >
                            Confirm Cancellation
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
