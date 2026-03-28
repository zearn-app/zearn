import React, { useContext, useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { UserContext } from "../App";
import { Store } from "../services/store";
import { useNotification } from "../components/NotificationSystem";

const getMonthYear = () => {
  const date = new Date();
  return date.toLocaleString("en-US", {
    month: "short",
    year: "numeric",
  }).replace(" ", "-"); // Mar-2026
};

const getRemainingDays = () => {
  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return lastDay.getDate() - today.getDate();
};

const RandomWinner: React.FC = () => {
  const { user, refreshUser } = useContext(UserContext);
  const { notify } = useNotification();

  const [loading, setLoading] = useState(true);
  const [monthData, setMonthData] = useState<any>(null);
  const [entryAmount, setEntryAmount] = useState(0);

  const currentMonth = getMonthYear();
  const remainingDays = getRemainingDays();

  useEffect(() => {
    init();
  }, []);

const init = async () => {
  try {
    console.log("Loading Random System...");

    const config = await Store.getRandomConfig();
    console.log("Config:", config);

    const data = await Store.getOrCreateMonth(currentMonth);
    console.log("Month Data:", data);

    setEntryAmount(config?.entryAmount || 0);
    setMonthData(data);

  } catch (e: any) {
    console.error("FULL ERROR:", e);
    notify(e.message || "Failed to load data", "error");
  } finally {
    setLoading(false);
  }
};

  
  const handleEnter = async () => {
    if (!user) return;

    if (monthData.userList.includes(user.uid)) {
      return notify("Already joined", "error");
    }

    if (monthData.status !== "process") {
      return notify("Entries closed", "error");
    }

    if (user.balance < entryAmount) {
      return notify("Insufficient balance", "error");
    }

    if (!window.confirm(`Enter for ₹${entryAmount}?`)) return;

    try {
      await Store.enterMonthlyRandom(user.uid, currentMonth, entryAmount);

      notify("Entered Successfully 🎉", "success");
      refreshUser();
      init();
    } catch (e: any) {
      notify(e.message, "error");
    }
  };

  const hasEntered = user && monthData?.userList.includes(user.uid);

  return (
    <Layout title="Lucky Winner" showBack>
      {/* TOP CARD */}
      <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl p-8 text-white text-center mb-8 shadow-lg">
        <h2 className="text-3xl font-black mb-2">Monthly Jackpot</h2>

        <p className="opacity-90 mb-1">{currentMonth}</p>
        <p className="text-sm opacity-80 mb-3">
          {remainingDays > 0
            ? `${remainingDays} days remaining`
            : "Last Day"}
        </p>

        <p className="font-medium mb-4">Entry Fee: ₹{entryAmount}</p>

        {monthData?.status === "completed" ? (
          <div className="bg-white/20 px-6 py-2 rounded-full">
            Winner Declared 🎉
          </div>
        ) : hasEntered ? (
          <div className="bg-white/20 px-6 py-2 rounded-full">
            You Joined 🎟️
          </div>
        ) : (
          <button
            onClick={handleEnter}
            className="bg-white text-pink-600 font-bold py-3 px-8 rounded-xl"
          >
            Enter Now
          </button>
        )}
      </div>

      {/* STATS */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <h3 className="font-bold mb-4">Stats</h3>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-gray-500 text-xs">Users</p>
            <p className="font-bold">{monthData?.totalUsers}</p>
          </div>

          <div>
            <p className="text-gray-500 text-xs">Prize Pool</p>
            <p className="font-bold">₹{monthData?.totalAmount}</p>
          </div>
        </div>
      </div>

      {/* WINNER */}
      {monthData?.status === "completed" && (
        <div className="bg-green-100 p-6 rounded-2xl text-center">
          <h3 className="font-bold mb-2">Winner 🎉</h3>
          <p>{monthData.winnerName || "User"}</p>
          <p className="font-bold">₹{monthData.winningAmount}</p>
        </div>
      )}
    </Layout>
  );
};

export default RandomWinner;
