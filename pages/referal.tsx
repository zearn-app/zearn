import React, { useState, useContext } from "react";
import { Layout } from "../components/Layout";
import { UserContext } from "../App";
import { Store } from "../services/store";
import { useNotification } from "../components/NotificationSystem";

const Referral: React.FC = () => {
  const { user, refreshUser } = useContext(UserContext);
  const { notify } = useNotification();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const myCode = user?.referralCode || "";

  // Copy Code
  const copyCode = () => {
    navigator.clipboard.writeText(myCode);
    notify("Code copied!", "success");
  };

  // Apply Referral Code
  const applyCode = async () => {
    if (!code) return notify("Enter referral code", "error");

    setLoading(true);
    try {
      await Store.applyReferralCode(user.uid, code);
      notify("Referral applied! +1 RP", "success");
      refreshUser();
    } catch (e: any) {
      notify(e.message, "error");
    }
    setLoading(false);
  };

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-4">Referral</h1>

      {/* My Code */}
      <div className="bg-white p-4 rounded-xl shadow mb-4">
        <p className="text-gray-500 text-sm">My Referral Code</p>
        <h2 className="text-lg font-bold">{myCode}</h2>

        <div className="flex gap-2 mt-3">
          <button onClick={copyCode} className="btn">Copy</button>
        </div>
      </div>

      {/* Enter Code */}
      <div className="bg-white p-4 rounded-xl shadow">
        <p className="text-gray-500 text-sm">Enter Referral Code</p>

        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter code"
          className="w-full border p-2 rounded mt-2"
          disabled={user?.referredBy}
        />

        <button
          onClick={applyCode}
          disabled={loading || user?.referredBy}
          className="btn mt-3 w-full"
        >
          {user?.referredBy ? "Already Used" : "Apply Code"}
        </button>
      </div>
    </Layout>
  );
};

export default Referral;