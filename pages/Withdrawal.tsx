import React, { useState, useContext, useEffect } from "react";
import { Layout } from "../components/Layout";
import { UserContext } from "../App";
import { WithdrawalMethod, WithdrawalRequest, WithdrawalStatus } from "../types";
import { Store } from "../services/store";
import { useNotification } from "../components/NotificationSystem";
import {
  Wallet,
  Send,
  Building2,
  Smartphone,
  Gift,
  ShoppingBag,
  Mail,
  ArrowLeft,
  AlertTriangle,
  Calendar
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Withdrawal: React.FC = () => {
  const { user, refreshUser } = useContext(UserContext);
  const { notify } = useNotification();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"request" | "history">("request");
  const [history, setHistory] = useState<WithdrawalRequest[]>([]);
  const [minWithdrawal, setMinWithdrawal] = useState(50);

  const [amount, setAmount] = useState<string>("");
  const [method, setMethod] = useState<WithdrawalMethod>(WithdrawalMethod.UPI);

  const [name, setName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [email, setEmail] = useState("");
  const [bankDetails, setBankDetails] = useState({ acct: "", ifsc: "" });

  // 🔥 Weekend Check
  const today = new Date().getDay(); // 0=Sun, 6=Sat
  const isWeekend = today === 0 || today === 6;

  useEffect(() => {
    if (!isWeekend) return;

    Store.getSettings().then((s) => setMinWithdrawal(s.minWithdrawal));
    if (activeTab === "history" && user) {
      Store.getWithdrawals(user.uid).then((data) => setHistory(data));
    }
  }, [activeTab, user, isWeekend]);

  const handleSubmit = async () => {
    if (!user) return;

    const numAmount = Number(amount);

    if (!numAmount || numAmount <= 0) {
      notify("Please enter a valid amount", "error");
      return;
    }
    if (numAmount > user.balance) {
      notify("Insufficient Balance", "error");
      return;
    }
    if (numAmount < minWithdrawal) {
      notify(`Minimum withdrawal is ₹${minWithdrawal}`, "error");
      return;
    }
    if (!name) {
      notify("Please enter your name", "error");
      return;
    }

    let detailsStr = "";

    if (method === WithdrawalMethod.UPI) {
      if (!upiId) {
        notify("Please enter UPI ID", "error");
        return;
      }
      detailsStr = `UPI ID: ${upiId} | Name: ${name}`;
    } else if (method === WithdrawalMethod.BANK) {
      if (!bankDetails.acct || !bankDetails.ifsc) {
        notify("Enter Bank Account & IFSC", "error");
        return;
      }
      detailsStr = `Bank: ${bankDetails.acct} | IFSC: ${bankDetails.ifsc} | Name: ${name}`;
    } else {
      if (!email) {
        notify("Enter Email to receive code", "error");
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
        details: detailsStr,
      });

      notify("Request Submitted Successfully!", "success");
      await refreshUser();

      setAmount("");
      setUpiId("");
      setName("");
      setEmail("");
      setBankDetails({ acct: "", ifsc: "" });

      setActiveTab("history");
    } catch (e: any) {
      notify(e.message || "Withdrawal failed", "error");
    }
  };

  const methods = [
    { id: WithdrawalMethod.UPI, label: "UPI", icon: <Smartphone size={18} /> },
    { id: WithdrawalMethod.BANK, label: "Bank", icon: <Building2 size={18} /> },
    { id: WithdrawalMethod.AMAZON, label: "Amazon", icon: <ShoppingBag size={18} /> },
    { id: WithdrawalMethod.FLIPKART, label: "Flipkart", icon: <Gift size={18} /> },
    { id: WithdrawalMethod.PLAYSTORE, label: "Play Store", icon: <Smartphone size={18} /> },
  ];

  const renderInputs = () => {
    switch (method) {
      case WithdrawalMethod.UPI:
        return (
          <input
            className="w-full border p-3 rounded-xl"
            placeholder="example@upi"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
          />
        );
      case WithdrawalMethod.BANK:
        return (
          <div className="space-y-2">
            <input
              className="w-full border p-3 rounded-xl"
              placeholder="Account No"
              value={bankDetails.acct}
              onChange={(e) =>
                setBankDetails({ ...bankDetails, acct: e.target.value })
              }
            />
            <input
              className="w-full border p-3 rounded-xl"
              placeholder="IFSC"
              value={bankDetails.ifsc}
              onChange={(e) =>
                setBankDetails({ ...bankDetails, ifsc: e.target.value })
              }
            />
          </div>
        );
      default:
        return (
          <input
            type="email"
            className="w-full border p-3 rounded-xl"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        );
    }
  };

  // 🚫 WEEKDAY → SHOW GLASS LOCK SCREEN
  if (!isWeekend) {
    return (
      <Layout title="Withdrawal" showBack>
        <div className="min-h-[70vh] flex items-center justify-center px-4">
          <div className="w-full max-w-md backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-6 text-center">

            <div className="flex justify-center mb-4">
              <div className="bg-white/20 p-4 rounded-full">
                <AlertTriangle className="text-yellow-300" size={32} />
              </div>
            </div>

            <h2 className="text-xl font-bold text-white mb-2">
              Withdrawals Closed
            </h2>

            <p className="text-sm text-gray-200 mb-4">
              Withdrawals are available only on weekends.
            </p>

            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-4 mb-4">
              <Calendar className="mx-auto mb-2 text-blue-300" />
              <p className="text-gray-200 text-sm font-semibold">
                Opens on Saturday & Sunday
              </p>
            </div>

            <button
              onClick={() => navigate(-1)}
              className="w-full py-2 rounded-xl bg-white/20 text-white"
            >
              Go Back
            </button>
          </div>
        </div>

        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-black via-gray-900 to-black opacity-95"></div>
      </Layout>
    );
  }

  // ✅ WEEKEND → ORIGINAL UI
  return (
    <Layout>
      <div className="flex items-center mb-4">
        <button onClick={() => navigate("/login")} className="p-2">
          <ArrowLeft size={20} />
        </button>
        <h1 className="ml-2 font-bold text-lg">Withdrawal</h1>
      </div>

      <div className="bg-gray-900 text-white p-6 rounded-2xl mb-6 flex justify-between">
        <div>
          <p className="text-gray-400 text-xs">Available Balance</p>
          <h2 className="text-3xl font-bold">
            ₹ {(user?.balance ?? 0).toFixed(4)}
          </h2>
        </div>
        <Wallet />
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold"
      >
        Submit Request
      </button>
    </Layout>
  );
};

export default Withdrawal;
