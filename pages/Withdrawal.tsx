import React, { useState, useContext, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { UserContext } from '../App';
import { WithdrawalMethod, WithdrawalRequest, WithdrawalStatus } from '../types';
import { Store } from '../services/store';
import { useNotification } from '../components/NotificationSystem';
import { Wallet, Send, Building2, Smartphone, Gift, ShoppingBag, MessageCircle, Mail } from 'lucide-react';

const Withdrawal: React.FC = () => {
  const { user, refreshUser } = useContext(UserContext);
  const { notify } = useNotification();
  const [activeTab, setActiveTab] = useState<'request' | 'history'>('request');
  const [history, setHistory] = useState<WithdrawalRequest[]>([]);
  const [minWithdrawal, setMinWithdrawal] = useState(50);

  // Form State
  const [amount, setAmount] = useState<string>('');
  const [method, setMethod] = useState<WithdrawalMethod>(WithdrawalMethod.UPI);
  
  // Dynamic Inputs
  const [name, setName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [bankDetails, setBankDetails] = useState({ acct: '', ifsc: '' });

  useEffect(() => {
    Store.getSettings().then(s => setMinWithdrawal(s.minWithdrawal));
    if (activeTab === 'history' && user) {
      Store.getWithdrawals(user.uid).then(data => setHistory(data));
    }
  }, [activeTab, user]);

  const handleSubmit = async () => {
    if(!user) return;
    const numAmount = Number(amount);

    // Basic Validation
    if(!numAmount || numAmount <= 0) {
      notify("Please enter a valid amount", 'error');
      return;
    }
    if(numAmount > user.balance) {
      notify("Insufficient Balance", 'error');
      return;
    }
    if(numAmount < minWithdrawal) {
      notify(`Minimum withdrawal is ₹${minWithdrawal}`, 'error');
      return;
    }
    if (!name) {
        notify("Please enter your name", 'error');
        return;
    }

    // Method Specific Validation & Detail Construction
    let detailsStr = '';
    
    if (method === WithdrawalMethod.UPI) {
        if (!upiId) { notify("Please enter UPI ID", 'error'); return; }
        detailsStr = `UPI ID: ${upiId} | Name: ${name}`;
    } 
    else if (method === WithdrawalMethod.BANK) {
        if (!bankDetails.acct || !bankDetails.ifsc) { notify("Enter Bank Account & IFSC", 'error'); return; }
        detailsStr = `Bank: ${bankDetails.acct} | IFSC: ${bankDetails.ifsc} | Name: ${name}`;
    }
    else if (method === WithdrawalMethod.WHATSAPP_PAY) {
        if (!whatsapp) { notify("Enter WhatsApp Number", 'error'); return; }
        detailsStr = `WhatsApp: ${whatsapp} | Name: ${name}`;
    }
    else {
        // Gift Cards (Amazon, Flipkart, PlayStore)
        if (!email) { notify("Enter Email to receive code", 'error'); return; }
        detailsStr = `Email: ${email} | Name: ${name} | Type: ${method}`;
    }

    if (!window.confirm(`Confirm withdrawal of ₹${numAmount}?`)) return;

    try {
      await Store.requestWithdrawal({
        uid: user.uid,
        amount: numAmount,
        method: method,
        details: detailsStr
      });
      notify("Request Submitted Successfully!", 'success');
      refreshUser();
      setAmount('');
      setUpiId('');
      setWhatsapp('');
      setName('');
      setEmail('');
      setBankDetails({ acct: '', ifsc: '' });
      setActiveTab('history');
    } catch (e: any) {
      notify(e.message || "Withdrawal failed", 'error');
    }
  };

  const methods = [
    { id: WithdrawalMethod.UPI, label: 'UPI', icon: <Smartphone size={18}/> },
    { id: WithdrawalMethod.BANK, label: 'Bank', icon: <Building2 size={18}/> },
    { id: WithdrawalMethod.AMAZON, label: 'Amazon', icon: <ShoppingBag size={18}/> },
    { id: WithdrawalMethod.FLIPKART, label: 'Flipkart', icon: <Gift size={18}/> },
    { id: WithdrawalMethod.PLAYSTORE, label: 'Play Store', icon: <Smartphone size={18}/> },
    { id: WithdrawalMethod.WHATSAPP_PAY, label: 'WhatsApp', icon: <MessageCircle size={18}/> },
  ];

  const renderInputs = () => {
      switch(method) {
          case WithdrawalMethod.UPI:
              return (
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase ml-1 mb-1">UPI ID</label>
                    <input className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-100" placeholder="example@upi" value={upiId} onChange={e => setUpiId(e.target.value)} />
                </div>
              );
          case WithdrawalMethod.BANK:
              return (
                <div className="space-y-4">
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase ml-1 mb-1">Account Number</label>
                        <input className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-100" placeholder="Account No" value={bankDetails.acct} onChange={e => setBankDetails({...bankDetails, acct: e.target.value})} />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase ml-1 mb-1">IFSC Code</label>
                        <input className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-100" placeholder="IFSC" value={bankDetails.ifsc} onChange={e => setBankDetails({...bankDetails, ifsc: e.target.value})} />
                     </div>
                </div>
              );
          case WithdrawalMethod.WHATSAPP_PAY:
               return (
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase ml-1 mb-1">WhatsApp Number</label>
                    <input type="tel" className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-100" placeholder="9876543210" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
                </div>
              );
          default: // Gift Cards
               return (
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase ml-1 mb-1">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                        <input type="email" className="w-full border p-3 pl-10 rounded-xl outline-none focus:ring-2 focus:ring-blue-100" placeholder="To receive code" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                </div>
              );
      }
  };

  return (
    <Layout title="Withdrawal" showBack>
      {/* Balance Header */}
      <div className="bg-gray-900 text-white p-6 rounded-2xl mb-6 flex justify-between items-center shadow-lg">
        <div>
            <p className="text-gray-400 text-xs font-bold uppercase">Available Balance</p>
            <h2 className="text-3xl font-bold">₹ {user?.balance}</h2>
        </div>
        <div className="bg-gray-800 p-3 rounded-full">
            <Wallet size={24} className="text-blue-400"/>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
        <button onClick={() => setActiveTab('request')} className={`flex-1 py-3 rounded-lg font-bold text-sm ${activeTab === 'request' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>Request</button>
        <button onClick={() => setActiveTab('history')} className={`flex-1 py-3 rounded-lg font-bold text-sm ${activeTab === 'history' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>History</button>
      </div>

      {activeTab === 'request' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5 animate-in fade-in zoom-in duration-300">
            
            {/* Method Selection */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Select Method</label>
                <div className="grid grid-cols-3 gap-2">
                    {methods.map(m => (
                        <button 
                            key={m.id}
                            onClick={() => setMethod(m.id)}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${method === m.id ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                        >
                            <div className="mb-1">{m.icon}</div>
                            <span className="text-[10px] font-bold">{m.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Dynamic Inputs */}
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase ml-1 mb-1">Full Name</label>
                    <input className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-100" placeholder="Enter Name" value={name} onChange={e => setName(e.target.value)} />
                </div>

                {renderInputs()}

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase ml-1 mb-1">Amount</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₹</span>
                        <input type="number" className="w-full border p-3 pl-8 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 font-bold" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} />
                    </div>
                </div>
            </div>

            <button onClick={handleSubmit} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center space-x-2">
                <Send size={18} />
                <span>Submit Request</span>
            </button>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-3">
             {history.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center">
                        <div>
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{item.method}</span>
                            <p className="text-xs text-gray-500 mt-1">{new Date(item.requestedAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                             <span className="block font-bold text-gray-900">₹{item.amount}</span>
                             <span className={`text-[10px] font-bold uppercase ${item.status === WithdrawalStatus.COMPLETED ? 'text-green-600' : 'text-yellow-600'}`}>{item.status.replace(/_/g, ' ')}</span>
                        </div>
                    </div>
                    {item.status === WithdrawalStatus.PAID_BY_ADMIN && (
                        <div className="mt-2 pt-2 border-t flex space-x-2">
                            <button onClick={async () => { await Store.userConfirmWithdrawal(item.id, true); refreshUser(); setActiveTab('request'); }} className="flex-1 bg-green-500 text-white text-xs py-2 rounded-lg font-bold">Received</button>
                            <button onClick={async () => { await Store.userConfirmWithdrawal(item.id, false); refreshUser(); setActiveTab('request'); }} className="flex-1 bg-red-100 text-red-600 text-xs py-2 rounded-lg font-bold">Not Received</button>
                        </div>
                    )}
                </div>
             ))}
        </div>
      )}
    </Layout>
  );
};

export default Withdrawal;