import React, { useState } from 'react';
import { ShoppingBag, ChevronRight, MapPin, Phone, Mail, User, CreditCard, Truck, Tag, CheckCircle } from 'lucide-react';

interface CheckoutViewProps {
    cart: any[];
    user: any;
    totalAmount: number;
    onPlaceOrder: (shippingData: any) => void;
    onBack: () => void;
    API_URL: string;
    token: string;
}

export default function CheckoutView({ cart, user, totalAmount, onPlaceOrder, onBack, API_URL, token }: CheckoutViewProps) {
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState('');

    const [formData, setFormData] = useState({
        fullName: user?.name || '',
        email: user?.email || '',
        phone: '',
        address: '',
        pincode: '',
        city: '',
        state: '',
        paymentMethod: 'COD' as 'COD' | 'UPI' | 'Razorpay' | 'Card'
    });

    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setCouponLoading(true);
        setCouponError('');
        try {
            const res = await fetch(`${API_URL}/api/coupons/validate/${couponCode}?totalAmount=${totalAmount}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            const coupon = data.coupon;
            let discount = 0;

            if (coupon.discount_type === 'Percentage') {
                discount = (totalAmount * parseFloat(coupon.discount_value)) / 100;
                if (coupon.max_discount_amount && discount > parseFloat(coupon.max_discount_amount)) {
                    discount = parseFloat(coupon.max_discount_amount);
                }
            } else if (coupon.discount_type === 'Fixed') {
                discount = parseFloat(coupon.discount_value);
            }

            setDiscountAmount(discount);
            setAppliedCoupon(coupon);
        } catch (err: any) {
            setCouponError(err.message);
            setAppliedCoupon(null);
            setDiscountAmount(0);
        } finally {
            setCouponLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.phone || !formData.address || !formData.pincode || !formData.city || !formData.state) {
            setError('Please fill in all delivery details.');
            return;
        }
        onPlaceOrder({
            ...formData,
            couponCode: appliedCoupon?.coupon_code,
            discountAmount
        });
    };

    return (
        <div className="bg-[#f7f3f0] min-h-screen pb-20 pt-10">
            <div className="max-w-7xl mx-auto px-6">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-paidhu-maroon font-bold mb-8 transition-colors">
                    <ChevronRight className="w-5 h-5 rotate-180" /> Back to Cart
                </button>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* LEFT: SHIPPING FORM */}
                    <div className="flex-[1.5] space-y-8">
                        <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-gray-100">
                            <h2 className="text-3xl font-brand font-black text-paidhu-slate mb-8 flex items-center gap-3">
                                <MapPin className="w-8 h-8 text-paidhu-maroon" /> Delivery Address
                            </h2>

                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 col-span-2 md:col-span-1">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input 
                                            name="fullName" value={formData.fullName} onChange={handleChange}
                                            className="w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-paidhu-maroon transition-all font-bold" 
                                            placeholder="Enter your full name" required 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 col-span-2 md:col-span-1">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Mobile Number</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input 
                                            name="phone" value={formData.phone} onChange={handleChange}
                                            className="w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-paidhu-maroon transition-all font-bold" 
                                            placeholder="10-digit number" required 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 col-span-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input 
                                            name="email" value={formData.email} onChange={handleChange}
                                            className="w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-paidhu-maroon transition-all font-bold" 
                                            placeholder="yourname@email.com" required 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 col-span-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Detailed Address</label>
                                    <textarea 
                                        name="address" value={formData.address} onChange={handleChange}
                                        rows={3}
                                        className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-paidhu-maroon transition-all font-bold resize-none" 
                                        placeholder="Flat / House No, Street, Landmark..." required 
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Pincode</label>
                                    <input 
                                        name="pincode" value={formData.pincode} onChange={handleChange}
                                        className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-paidhu-maroon transition-all font-bold" 
                                        placeholder="6-digit code" required 
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">City</label>
                                    <input 
                                        name="city" value={formData.city} onChange={handleChange}
                                        className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-paidhu-maroon transition-all font-bold" 
                                        placeholder="City Name" required 
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">State</label>
                                    <input 
                                        name="state" value={formData.state} onChange={handleChange}
                                        className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-paidhu-maroon transition-all font-bold" 
                                        placeholder="State Name" required 
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Payment Method</label>
                                    <div className="relative group">
                                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <select 
                                            name="paymentMethod" value={formData.paymentMethod} onChange={handleChange}
                                            className="w-full pl-11 pr-10 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-paidhu-maroon transition-all font-bold appearance-none cursor-pointer"
                                        >
                                            <option value="COD">Cash on Delivery (COD)</option>
                                            <option value="UPI">UPI Payment</option>
                                            <option value="Razorpay">Razorpay Secured</option>
                                            <option value="Card">Credit / Debit Card</option>
                                        </select>
                                    </div>
                                </div>

                                {formData.paymentMethod === 'UPI' && (
                                    <div className="space-y-2 col-span-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">UPI ID</label>
                                        <input 
                                            name="upiId" value={(formData as any).upiId || ''} onChange={handleChange}
                                            className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-paidhu-maroon transition-all font-bold" 
                                            placeholder="e.g. name@okaxis" required 
                                        />
                                    </div>
                                )}

                                {formData.paymentMethod === 'Card' && (
                                    <>
                                        <div className="space-y-2 col-span-2">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Card Number</label>
                                            <input 
                                                name="cardNumber" value={(formData as any).cardNumber || ''} onChange={handleChange}
                                                className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-paidhu-maroon transition-all font-bold" 
                                                placeholder="0000 0000 0000 0000" required 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Expiry Date</label>
                                            <input 
                                                name="cardExpiry" value={(formData as any).cardExpiry || ''} onChange={handleChange}
                                                className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-paidhu-maroon transition-all font-bold" 
                                                placeholder="MM/YY" required 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">CVV</label>
                                            <input 
                                                name="cardCvv" type="password" value={(formData as any).cardCvv || ''} onChange={handleChange}
                                                className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-paidhu-maroon transition-all font-bold" 
                                                placeholder="***" required 
                                            />
                                        </div>
                                    </>
                                )}
                            </form>
                        </div>
                    </div>

                    {/* RIGHT: ORDER SUMMARY */}
                    <div className="flex-1">
                        <div className="bg-white rounded-[32px] p-8 shadow-xl border-4 border-white sticky top-10">
                            <h3 className="text-2xl font-brand font-black text-paidhu-slate mb-6 flex items-center gap-2">
                                <ShoppingBag className="w-6 h-6 text-paidhu-maroon" /> Order Summary
                            </h3>

                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar mb-8">
                                {cart.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 items-center p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                                        <div className="w-16 h-16 bg-paidhu-cream rounded-xl p-2 flex-shrink-0">
                                            <img src={item.image_url} className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-paidhu-slate truncate">{item.name}</p>
                                            <p className="text-xs text-gray-400 font-bold">Qty: {item.quantity} {item.size ? `| Size: ${item.size}` : ''}</p>
                                        </div>
                                        <p className="text-sm font-black text-paidhu-maroon">₹{parseFloat(item.price).toFixed(0)}</p>
                                    </div>
                                ))}
                            </div>

                            {/* COUPON SECTION */}
                            <div className="mb-8 p-6 bg-paidhu-cream/50 rounded-2xl border-2 border-dashed border-paidhu-peach">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Have a Promo Code?</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="Enter Code" 
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        className="flex-1 px-4 py-3 rounded-xl border-2 border-white focus:border-paidhu-maroon transition-all font-bold uppercase text-sm"
                                    />
                                    <button 
                                        onClick={handleApplyCoupon}
                                        disabled={couponLoading}
                                        className="bg-paidhu-maroon text-white px-6 py-3 rounded-xl font-brand font-bold text-sm shadow-md hover:bg-paidhu-maroon/90 disabled:opacity-50 transition-all"
                                    >
                                        {couponLoading ? '...' : 'Apply'}
                                    </button>
                                </div>
                                {couponError && <p className="text-[10px] text-red-500 font-bold mt-2 flex items-center gap-1"><Tag className="w-3 h-3" /> {couponError}</p>}
                                {appliedCoupon && (
                                    <p className="text-[10px] text-green-600 font-bold mt-2 flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" /> Code <strong>{appliedCoupon.coupon_code}</strong> Applied!
                                    </p>
                                )}
                            </div>

                            <div className="space-y-3 pt-6 border-t-2 border-gray-100">
                                <div className="flex justify-between text-gray-500 font-bold">
                                    <span>Subtotal</span>
                                    <span>₹{totalAmount.toFixed(0)}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-green-600 font-bold animate-in fade-in slide-in-from-right-2 duration-300">
                                        <span className="flex items-center gap-1">Discount ({appliedCoupon?.coupon_code})</span>
                                        <span>-₹{discountAmount.toFixed(0)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-gray-500 font-bold">
                                    <span>Delivery Charges</span>
                                    <span className={appliedCoupon?.free_shipping || totalAmount >= 500 ? "text-green-500" : ""}>
                                        {appliedCoupon?.free_shipping || totalAmount >= 500 ? "FREE" : "₹50"}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xl font-brand font-black text-paidhu-slate pt-4">
                                    <span>Total Payable</span>
                                    <span className="text-paidhu-maroon">₹{(totalAmount - discountAmount + (appliedCoupon?.free_shipping || totalAmount >= 500 ? 0 : 50)).toFixed(0)}</span>
                                </div>
                            </div>

                            {error && <p className="mt-4 text-sm font-bold text-red-500 text-center">{error}</p>}

                            <button 
                                onClick={handleSubmit}
                                className="w-full bg-paidhu-maroon text-white py-5 rounded-2xl text-xl font-brand font-bold shadow-xl hover:bg-paidhu-maroon/90 transition-all mt-8 flex items-center justify-center gap-3 border-b-4 border-paidhu-maroon/50"
                            >
                                <Truck className="w-6 h-6" /> Place Order Now
                            </button>
                            
                            <p className="mt-4 text-[10px] text-gray-400 text-center font-bold uppercase tracking-widest">Secure encrypted checkout</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
