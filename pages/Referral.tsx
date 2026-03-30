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
      <h1 className="text-xl font-bold mb-4 text-blue-700">Referral</h1>

      {/* My Code */}
      <div className="bg-blue-50 p-4 rounded-xl shadow mb-4 border border-blue-100">
        <p className="text-blue-500 text-sm">My Referral Code</p>
        <h2 className="text-lg font-bold text-blue-800">{myCode}</h2>

        <div className="flex gap-2 mt-3">
          <button
            onClick={copyCode}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
          >
            Copy
          </button>
        </div>
      </div>

      {/* Referral Status Message */}
      {user?.referredBy && (
        <div className="bg-green-50 p-4 rounded-xl shadow mb-4 border border-green-200">
          <p className="text-green-700 text-sm font-medium">
            You have been referred by{" "}
            <span className="font-bold">{user.referredBy}</span>.
          </p>
          <p className="text-green-600 text-sm mt-1">
            You can't use another referral code to get extra RP.
          </p>
          <p className="text-green-600 text-sm mt-1">
            Invite your friends using your code to earn more RP 🎉
          </p>
        </div>
      )}

      {/* Enter Code (ONLY if NOT referred) */}
      {!user?.referredBy && (
        <div className="bg-blue-50 p-4 rounded-xl shadow border border-blue-100">
          <p className="text-blue-500 text-sm">Enter Referral Code</p>

          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter code"
            className="w-full border border-blue-200 p-2 rounded mt-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            onClick={applyCode}
            disabled={loading}
            className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition disabled:bg-blue-200 disabled:cursor-not-allowed"
          >
            Apply Code
          </button>
        </div>
      )}
    </Layout>
  );
};

export default Referral;
