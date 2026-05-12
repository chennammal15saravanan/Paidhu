import React from 'react';
import { CheckCircle, ArrowRight, ShoppingBag, Truck } from 'lucide-react';

interface OrderSuccessProps {
    orderId: string;
    onViewOrders: () => void;
    onContinueShopping: () => void;
}

export default function OrderSuccess({ orderId, onViewOrders, onContinueShopping }: OrderSuccessProps) {
    return (
        <div className="bg-[#f7f3f0] min-h-screen flex items-center justify-center p-6">
            <div className="max-w-xl w-full bg-white rounded-[40px] p-10 md:p-16 text-center shadow-2xl border-8 border-white relative overflow-hidden">
                {/* Background Sparkles */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                    <div className="absolute top-10 left-10 w-24 h-24 bg-paidhu-maroon rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-10 right-10 w-32 h-32 bg-paidhu-peach rounded-full blur-3xl animate-pulse"></div>
                </div>

                <div className="relative z-10 space-y-8 animate-in zoom-in-95 duration-700">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-green-50">
                        <CheckCircle className="w-14 h-14 text-green-500" />
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-4xl md:text-5xl font-brand font-black text-paidhu-slate">Awesome!</h2>
                        <h3 className="text-xl md:text-2xl font-brand font-bold text-paidhu-maroon">Your order has been placed successfully</h3>
                    </div>

                    <div className="bg-paidhu-cream/50 p-6 rounded-3xl border-2 border-dashed border-paidhu-peach">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Order ID</p>
                        <p className="text-2xl font-brand font-black text-paidhu-slate tracking-wider">{orderId}</p>
                    </div>

                    <p className="text-gray-500 font-bold leading-relaxed max-w-sm mx-auto">
                        We've received your order and we're getting it ready for shipment. You'll receive updates as it travels to you!
                    </p>

                    <div className="flex flex-col gap-4 pt-6">
                        <button 
                            onClick={onViewOrders}
                            className="w-full bg-paidhu-maroon text-white py-5 rounded-2xl text-xl font-brand font-bold shadow-xl hover:bg-paidhu-maroon/90 transition-all flex items-center justify-center gap-3 border-b-4 border-paidhu-maroon/50"
                        >
                            <ShoppingBag className="w-6 h-6" /> Track My Order
                        </button>
                        <button 
                            onClick={onContinueShopping}
                            className="w-full bg-white text-paidhu-slate py-5 rounded-2xl text-xl font-brand font-bold shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2 border-2 border-gray-100"
                        >
                            Continue Shopping
                            <ArrowRight className="w-5 h-5 text-paidhu-maroon" />
                        </button>
                    </div>

                    <div className="flex items-center justify-center gap-8 pt-8 border-t border-gray-100">
                        <div className="text-center">
                            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Truck className="w-5 h-5 text-paidhu-maroon" />
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase">Fast Delivery</p>
                        </div>
                        <div className="text-center">
                            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2">
                                <CheckCircle className="w-5 h-5 text-paidhu-maroon" />
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase">100% Natural</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
