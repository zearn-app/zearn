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

  // 🔥 Force UI refresh (important fix)
  const [, forceUpdate] = useState({});

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
    if (!user) return;
    const numAmount = Number(amount);

    if (!numAmount || numAmount <= 0) {
      notify("Please enter a valid amount", 'error');
      return;
    }
    if (numAmount > user.balance) {
      notify("Insufficient Balance", 'error');
      return;
    }
    if (numAmount < minWithdrawal) {
      notify(`Minimum withdrawal is ₹${minWithdrawal}`, 'error');
      return;
    }
    if (!name) {
      notify("Please enter your name", 'error');
      return;
    }

    let detailsStr = '';

    if (method === WithdrawalMethod.UPI) {
      if (!upiId) { notify("Please enter UPI ID", 'error'); return; }
      detailsStr = `UPI ID: ${upiId} | Name: ${name}`;
    }
    else if (method === WithdrawalMethod.BANK) {
      if (!bankDetails.acct || !bankDetails.ifsc) {
        notify("Enter Bank Account & IFSC", 'error');
        return;
      }
      detailsStr = `Bank: ${bankDetails.acct} | IFSC: ${bankDetails.ifsc} | Name: ${name}`;
    }
    else if (method === WithdrawalMethod.WHATSAPP_PAY) {
      if (!whatsapp) {
        notify("Enter WhatsApp Number", 'error');
        return;
      }
      detailsStr = `WhatsApp: ${whatsapp} | Name: ${name}`;
    }
    else {
      if (!email) {
        notify("Enter Email to receive code", 'error');
        return;
      }
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

      // 🔥 IMPORTANT FIX
      await refreshUser();     // get latest data
      forceUpdate({});         // force UI update

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
    switch (method) {
      case WithdrawalMethod.UPI:
        return (
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase ml-1 mb-1">UPI ID</label>
            <input className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="example@upi"
              value={upiId}
              onChange={e => setUpiId(e.target.value)} />
          </div>
        );

      case WithdrawalMethod.BANK:
        return (
          <div className="space-y-4">
            <input className="w-full border p-3 rounded-xl" placeholder="Account No"
              value={bankDetails.acct}
              onChange={e => setBankDetails({ ...bankDetails, acct: e.target.value })} />
            <input className="w-full border p-3 rounded-xl" placeholder="IFSC"
              value={bankDetails.ifsc}
              onChange={e => setBankDetails({ ...bankDetails, ifsc: e.target.value })} />
          </div>
        );

      case WithdrawalMethod.WHATSAPP_PAY:
        return (
          <input className="w-full border p-3 rounded-xl"
            placeholder="WhatsApp Number"
            value={whatsapp}
            onChange={e => setWhatsapp(e.target.value)} />
        );

      default:
        return (
          <input className="w-full border p-3 rounded-xl"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)} />
        );
    }
  };

  return (
    <Layout title="Withdrawal" showBack>

      <div className="bg-gray-900 text-white p-6 rounded-2xl mb-6 flex justify-between">
        <div>
          <p className="text-gray-400 text-xs">Available Balance</p>
          <h2 className="text-3xl font-bold">₹ {user?.balance}</h2>
        </div>
        <Wallet />
      </div>

      {/* Tabs */}
      <button onClick={() => setActiveTab('request')}>Request</button>
      <button onClick={() => setActiveTab('history')}>History</button>

      {activeTab === 'request' && (
        <div>
          {renderInputs()}

          <input value={amount} onChange={e => setAmount(e.target.value)} />

          <button onClick={handleSubmit}>
            <Send /> Submit
          </button>
        </div>
      )}

      {activeTab === 'history' && (
        <div>
          {history.map(item => (
            <div key={item.id}>
              ₹{item.amount} - {item.status}
            </div>
          ))}
        </div>
      )}

    </Layout>
  );
};

export default Withdrawal;
