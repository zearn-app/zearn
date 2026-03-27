import { db } from "./firebase";
import JSZip from "jszip";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  writeBatch,
  addDoc,
  serverTimestamp
} from "firebase/firestore";

import {
  User,
  WithdrawalRequest,
  AdminSettings,
  WithdrawalStatus,
  WinnerEntry
} from "../types";

//////////////////////////// TYPES ////////////////////////////

interface RewardSettings {
  standard_amount: number;
  special_reward: number;
}

//////////////////////////// SETTINGS ////////////////////////////

const DEFAULT_SETTINGS: AdminSettings = {
  tapCount: 5,
  adminPassword: "admin",
  dailyClaimLimit: 10,
  minWithdrawal: 50,
  randomWinnerEntryFee: 20
};

//////////////////////////// utils ////////////////////////////

export function generateRandomTaskName() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "ztask";
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export enum TaskStatus {
  NONE = "NONE",
  PROCESS = "PROCESS",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED"
}

//////////////////////////// STORE ////////////////////////////

export const Store = {

//////////////////////////// USERS ////////////////////////////

getAllUsers: async (): Promise<User[]> => {
  const snap = await getDocs(collection(db, "users"));

  return snap.docs.map(d => ({
    uid: d.id,
    ...(d.data() as any)
  })) as User[];
},

updateUser: async (uid: string, data: Partial<User>) => {
  const ref = doc(db, "users", uid);

  await updateDoc(ref, {
    ...data,
    updatedAt: new Date().toISOString()
  });
},

toggleUserBan: async (uid: string, current: boolean) => {
  await updateDoc(doc(db, "users", uid), {
    isBanned: !current
  });
},

checkUserExists: async (email: string) => {
  const q = query(
    collection(db, "users"),
    where("email", "==", email)
  );

  const snap = await getDocs(q);

  if (snap.empty) return null;

  return {
    uid: snap.docs[0].id,
    ...(snap.docs[0].data() as any)
  } as User;
},

loginUser: async (user: User) => {
  localStorage.setItem("zearn_user", JSON.stringify(user));
  return user;
},

logoutUser: () => {
  localStorage.removeItem("zearn_user");
},

getCurrentUser: (): User | null => {
  const raw = localStorage.getItem("zearn_user");
  if (!raw) return null;
  return JSON.parse(raw);
},

registerUser: async (data: any) => {
  const ref = doc(collection(db, "users"));

  // 🔥 Generate referral code (simple & unique)
  const referralCode = data.name.slice(0, 3).toUpperCase() + Math.floor(1000 + Math.random() * 9000);

  const user: User = {
    uid: ref.id,
    email: data.email,
    name: data.name,
    mobile: data.mobile,
    dob: data.dob,
    district: data.district,
    password: data.password,
    country: data.country,

    balance: 0,
    isBanned: false,
    isAdmin: false,
    createdAt: new Date().toISOString(),

    // ✅ NEW FIELDS
    referralCode: referralCode,        // user's own code
    totalReferrals: 0                  // count of referrals
  };

  await setDoc(ref, user);

  return user;
},
  
adminAddCoins: async (uid: string, amount: number) => {
  await updateDoc(doc(db, "users", uid), {
    balance: increment(amount)
  });
},

//////////////////////////// SETTINGS ////////////////////////////

getSettings: async (): Promise<AdminSettings> => {
  const ref = doc(db, "settings", "config");
  const snap = await getDoc(ref);

  if (snap.exists()) return snap.data() as AdminSettings;

  await setDoc(ref, DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
},

updateSettings: async (settings: AdminSettings) => {
  await setDoc(doc(db, "settings", "config"), settings);
},
//////////////////////////// admin task ////////////////////////////
 getadminTasks: async () => {
    try {
      const q = query(
        collection(db, "tasks"),
        orderBy("task_name", "asc") // optional sorting
      )

      const snapshot = await getDocs(q)

      const tasks: any[] = []

      snapshot.forEach((doc) => {
        tasks.push({
          id: doc.id,
          ...doc.data()
        })
      })

      return tasks

    } catch (error) {
      console.error("Error fetching admin tasks:", error)
      return []
    }
  },
  
  /* ---------------- CREATE TASK ---------------- */
  async createTask(data: any) {
    try {

      const payload = {
        ...data,
        task_id: crypto.randomUUID(), // unique id
        created_at: serverTimestamp()
      }

      await addDoc(collection(db, "tasks"), payload)

    } catch (err) {
      console.error("createTask error:", err)
      throw err
    }
  },

  /* ---------------- UPDATE TASK ---------------- */
  async updateTask(id: string, data: any) {
    try {

      const ref = doc(db, "tasks", id)

      await updateDoc(ref, {
        ...data,
        updated_at: serverTimestamp()
      })

    } catch (err) {
      console.error("updateTask error:", err)
      throw err
    }
  },

  /* ---------------- DELETE TASK ---------------- */
  async deleteTask(id: string) {
    try {

      const ref = doc(db, "tasks", id)
      await deleteDoc(ref)

    } catch (err) {
      console.error("deleteTask error:", err)
      throw err
    }
  },
//////////////////////////// TASK ////////////////////////////

generateTaskName() {
  return "ztask_" + Math.random().toString(36).substring(2, 10);
},

async getTasks(isSpecial: boolean) {
  const q = query(
    collection(db, "tasks"),
    where("is_special", "==", isSpecial)
  );

  const snap = await getDocs(q);

  return snap.docs.map(d => ({
    id: d.id,
    ...(d.data() as any)
  }));
},

async startTask(taskId: string, uid: string) {
  const ref = doc(db, "tasks", taskId);

  await updateDoc(ref, {
    is_started: true,
    started_by: uid,
    started_at: serverTimestamp()
  });
},

async getTask(taskId: string) {
  const ref = doc(db, "tasks", taskId);
  const snap = await getDoc(ref);

  if (!snap.exists()) throw new Error("Task not found");

  return { id: snap.id, ...(snap.data() as any) };
},

//////////////////////////// ZIP LOGIC ////////////////////////////

async completeTask(task: any, uid: string, zipFile: File) {

  const zip = await JSZip.loadAsync(zipFile);

  // filename check
  if (zipFile.name.toLowerCase() !== task.expectedzipfilename.toLowerCase()) {
    throw new Error("Zip filename mismatch");
  }

  // inner file check (handles folders)
  const innerFile = Object.keys(zip.files).find(f =>
    f.endsWith(task.expectedinnerfilename)
  );

  if (!innerFile) {
    throw new Error("Inner file mismatch");
  }

  const settings = await Store.getSettings();
  
  const userRef = doc(db, "users", uid);

  let updateData: any = {
    noOfTodayTask: increment(1)
  };

  let history: any = {
    task_name: task.task_name,
    task_id: task.id,
    date: new Date(),
    type: task.is_special ? "special" : "standard",
    profit: true
  };

  // ✅ FIX: get reward from settings.rewards
  const rewardValue = Number(settings.rewards || 0);

  if (!task.is_special) {
    const amount = rewardValue;

    updateData.balance = increment(amount);
    updateData.lifetime_earnings = increment(amount);
    updateData.gold = increment(1);
    updateData.lifetime_gold = increment(1);

    history.amount = amount;
  } else {
    const reward = rewardValue;

    updateData.balance = increment(reward);
    updateData.lifetime_earnings = increment(reward);
    updateData.diamond = increment(1);
    updateData.lifetime_diamond = increment(1);

    history.amount = reward;
  }

  await updateDoc(userRef, updateData);

  await addDoc(collection(db, "users", uid, "history"), history);

  await updateDoc(doc(db, "tasks", task.id), {
    task_name: this.generateTaskName(),
    is_started: false,
    started_by: "",
    started_at: null
  });

  return true;
},
//////////////////////////// WITHDRAW ////////////////////////////
requestWithdrawal: async (input: WithdrawalRequest) => {
  const userRef = doc(db, "users", input.uid);
  const withdrawRef = doc(collection(db, "withdrawals"));

  await runTransaction(db, async (transaction) => {
    const userSnap = await transaction.get(userRef);

    if (!userSnap.exists()) {
      throw new Error("User not found");
    }

    const userData = userSnap.data();

    // ✅ Check balance again (important for security)
    if (userData.balance < input.amount) {
      throw new Error("Insufficient balance");
    }

    // ✅ Deduct balance
    const newBalance = userData.balance - input.amount;

    transaction.update(userRef, {
      balance: newBalance
    });

    // ✅ Create withdrawal record
    transaction.set(withdrawRef, {
      ...input,
      id: withdrawRef.id,
      status: "PENDING",
      requestedAt: new Date().toISOString()
    });
  });
},
getWithdrawals: async (uid?: string): Promise<WithdrawalRequest[]> => {

  let q: any;

  if (uid) {
    q = query(
      collection(db, "withdrawals"),
      where("uid", "==", uid)
    );
  } else {
    q = collection(db, "withdrawals");
  }

  const snap = await getDocs(q);

  return snap.docs.map(d => ({
    id: d.id,
    ...(d.data() as any)
  })) as WithdrawalRequest[];
},

adminUpdateWithdrawal: async (id: string, status: WithdrawalStatus) => {
  await updateDoc(doc(db, "withdrawals", id), {
    status
  });
},

//////////////////////////// LEADERBOARD ////////////////////////////

getLeaderboard: async () => {

  const q = query(
    collection(db, "users"),
    orderBy("balance", "desc"),
    limit(50)
  );

  const snap = await getDocs(q);

  return snap.docs.map(d => {
    const data = d.data() as any;
    return {
      name: data.name,
      balance: data.balance
    };
  });
},

//////////////////////////// RANDOM WINNER ////////////////////////////

getWinnerEntries: async (): Promise<WinnerEntry[]> => {
  const snap = await getDocs(collection(db, "winners"));

  return snap.docs.map(d => ({
    id: d.id,
    ...(d.data() as any)
  })) as WinnerEntry[];
},

enterRandomWinner: async (uid: string, fee: number) => {

  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) throw new Error("User not found");

  const data = snap.data();
  if (!data) throw new Error("User data missing");

  if (data.balance < fee) throw new Error("Low balance");

  const batch = writeBatch(db);

  batch.update(userRef, {
    balance: increment(-fee)
  });

  const entry: WinnerEntry = {
    uid,
    name: data.name,
    avatarChar: data.name.charAt(0),
    amountSpent: fee,
    month: new Date().toISOString(),
    timestamp: new Date().toISOString()
  };

  const ref = doc(collection(db, "winners"));

  batch.set(ref, entry);

  await batch.commit();
},

//////////////////////////// DAILY CLAIM ////////////////////////////

checkDailyClaimStatus: async (uid: string): Promise<boolean> => {

  const today = new Date().toISOString().slice(0, 10);

  const q = query(
    collection(db, "daily_claims"),
    where("uid", "==", uid),
    where("date", "==", today)
  );

  const snap = await getDocs(q);

  return !snap.empty;
},

claimDaily: async (uid: string) => {

  const today = new Date().toISOString().slice(0, 10);

  const q = query(
    collection(db, "daily_claims"),
    where("uid", "==", uid),
    where("date", "==", today)
  );

  const snap = await getDocs(q);

  if (!snap.empty) {
    return {
      success: false,
      message: "Already claimed today"
    };
  }

  const userRef = doc(db, "users", uid);

  const batch = writeBatch(db);

  batch.update(userRef, {
    balance: increment(10)
  });

  const ref = doc(collection(db, "daily_claims"));

  batch.set(ref, {
    uid,
    date: today,
    reward: 10,
    timestamp: new Date().toISOString()
  });

  await batch.commit();

  return {
    success: true,
    message: "Daily bonus claimed! +10 coins"
  };
}

};
