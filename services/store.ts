
import { db } from './firebase';
import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc, deleteDoc,
  query, where, orderBy, limit, increment, writeBatch 
} from 'firebase/firestore';
import { User, Task, WithdrawalRequest, AdminSettings, TaskStatus, WithdrawalStatus, WinnerEntry, UserTask } from '../types';

// Default settings
const DEFAULT_SETTINGS: AdminSettings = {
  tapCount: 5,
  adminPassword: "admin",
  dailyClaimLimit: 10,
  minWithdrawal: 50,
  randomWinnerEntryFee: 20
};

// Seed Tasks to populate the DB if empty
const SEED_TASKS: Task[] = [
    {
        id: 'std_1',
        title: 'Install Cred App',
        description: 'Download and register on Cred to earn rewards.',
        reward: 150,
        diamondReward: 5,
        link: 'https://google.com',
        isSpecial: false,
        password: 'cred'
    },
    {
        id: 'std_2',
        title: 'Play Ludo Supreme',
        description: 'Play at least one game to unlock bonus.',
        reward: 50,
        diamondReward: 0,
        link: 'https://google.com',
        isSpecial: false,
        password: 'ludo'
    },
    {
        id: 'spc_1',
        title: 'Download Dream11 APK',
        description: 'Install the APK manually and login.',
        reward: 500,
        diamondReward: 50,
        link: 'https://google.com',
        isSpecial: true,
        packageName: 'com.dream11.fantasy.cricket'
    },
    {
        id: 'spc_2',
        title: 'TaskBucks Pro',
        description: 'Complete 3 offers in the app.',
        reward: 300,
        diamondReward: 20,
        link: 'https://google.com',
        isSpecial: true,
        packageName: 'com.taskbucks.pro'
    }
];

export const Store = {
  
  // --- AUTH ---
  checkUserExists: async (email: string): Promise<User | null> => {
    try {
        const q = query(collection(db, "users"), where("email", "==", email));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        const data = docSnap.data() as User;
        // ensure uid is populated (some records may not have uid as a field)
        if (!data.uid) data.uid = docSnap.id;
        console.log("User found:", data);
        return data;
        }

        // Auto-create Admin if logging in with admin email and doesn't exist
        if (email === 'admin@zearn.app') {
            console.log("Creating default admin user...");
            const defaultAdmin: User = {
                uid: 'admin_default_01',
                email: 'admin@zearn.app',
                name: 'Super Admin',
                mobile: '0000000000',
                gender: 'Male',
                dob: '2000-01-01',
                district: 'HQ',
                state: 'Cloud',
                country: 'India',
                balance: 50000, 
                diamonds: 1000,
                level: 10,
                isAdmin: true,
                isBanned: false,
                createdAt: new Date().toISOString(),
                lastDailyClaim: null,
                referralCode: 'ADMIN01',
                lifetimeEarnings: 0,
                lifetimeDiamondEarnings: 0,
                totalTasks: 0,
                monthlyTasks: 0,
                totalSpecialTasks: 0,
                monthlySpecialTasks: 0
            };
            await setDoc(doc(db, "users", defaultAdmin.uid), defaultAdmin);
            console.log("Admin user created successfully");
            return defaultAdmin;
        }
        
        console.log("User not found:", email);
        return null;
    } catch (e) {
        console.error("Auth Check Error", e);
        throw e;
    }
  },

  registerUser: async (details: any): Promise<User> => {
     try {
       console.log("Starting registration for email:", details.email);
       // Check if user exists first to avoid overwrites
       const q = query(collection(db, "users"), where("email", "==", details.email));
       const snap = await getDocs(q);
       if (!snap.empty) {
           console.log("User already exists, returning existing user");
           return snap.docs[0].data() as User;
       }

       const uid = Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
       console.log("Creating new user with UID:", uid);
       
       const newUser: User = {
          ...details,
          uid,
          balance: 0,
          diamonds: 0,
          level: 1,
          isAdmin: details.email === 'admin@zearn.app',
          isBanned: false,
          createdAt: new Date().toISOString(),
          lastDailyClaim: null,
          lifetimeEarnings: 0,
          lifetimeDiamondEarnings: 0,
          totalTasks: 0,
          monthlyTasks: 0,
          totalSpecialTasks: 0,
          monthlySpecialTasks: 0,
          referralCode: 'Z' + Math.floor(1000 + Math.random() * 9000)
       };
       
       console.log("Saving user to Firestore:", newUser);
       await setDoc(doc(db, "users", uid), newUser);
       localStorage.setItem('currentUserUid', uid);
       console.log("User registration successful");
       return newUser;
     } catch (e) {
       console.error("User Registration Error", e);
       throw new Error(`Registration failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
     }
  },

  loginUser: async (user: User) => {
    try {
      console.log("Logging in user:", user.email);
      // Resolve server-side user record to get authoritative UID and ban status
      const serverUser = await Store.checkUserExists(user.email);
      const effectiveUser = serverUser || user;
      if (effectiveUser.isBanned) {
          throw new Error("Account Banned by Admin");
      }

      // Ensure we have a uid to persist
      if (!effectiveUser.uid) {
        // try to read by email to find doc id
        const q = query(collection(db, "users"), where("email", "==", user.email));
        const snap = await getDocs(q);
        if (!snap.empty) {
          effectiveUser.uid = snap.docs[0].id;
        }
      }

      if (effectiveUser.uid) {
        localStorage.setItem('currentUserUid', effectiveUser.uid);
      }
      console.log("User logged in successfully", effectiveUser.uid);
      return effectiveUser;
    } catch (e) {
      console.error("Login Error", e);
      throw e;
    }
  },

  logout: async () => {
    localStorage.removeItem('currentUserUid');
  },

  getCurrentUser: async (): Promise<User | null> => {
    const uid = localStorage.getItem('currentUserUid');
    console.log("Getting current user with UID:", uid);
    if (!uid) {
      console.log("No UID in localStorage");
      return null;
    }
    
    try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
            console.log("Current user found:", userDoc.data());
            return userDoc.data() as User;
        } else {
          console.log("User document does not exist");
        }
    } catch (e) {
        console.error("Get Current User Error", e);
    }
    return null;
  },

  updateUser: async (uid: string, updates: Partial<User>): Promise<void> => {
    try {
      await updateDoc(doc(db, "users", uid), updates as any);
      console.log("User updated:", uid, updates);
    } catch (e) {
      console.error("Update user failed", e);
      throw e;
    }
  },

  getAllUsers: async (): Promise<User[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        return querySnapshot.docs.map(doc => doc.data() as User);
    } catch (e) {
        console.error("getAllUsers failed", e);
        return [];
    }
  },

  toggleUserBan: async (uid: string, currentStatus: boolean) => {
      await updateDoc(doc(db, "users", uid), { isBanned: !currentStatus });
  },

  // --- SETTINGS ---
  getSettings: async (): Promise<AdminSettings> => {
    try {
        console.log("Fetching admin settings...");
        const docRef = doc(db, "settings", "config");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            console.log("Settings found:", docSnap.data());
            return docSnap.data() as AdminSettings;
        } else {
            // Initialize Default Settings if not found
            console.log("Settings not found, creating default settings...");
            await setDoc(docRef, DEFAULT_SETTINGS);
            console.log("Default settings created");
            return DEFAULT_SETTINGS;
        }
    } catch (e) {
        console.warn("Using default settings due to error", e);
        return DEFAULT_SETTINGS;
    }
  },
  
  updateSettings: async (newSettings: AdminSettings): Promise<void> => {
    await setDoc(doc(db, "settings", "config"), newSettings);
  },
  
  // --- TASKS ---
  getAllTasks: async (forceRefresh = false): Promise<Task[]> => {
    const tasksRef = collection(db, "tasks");
    const querySnapshot = await getDocs(tasksRef);
    
    if (querySnapshot.empty) {
        // Seed initial tasks
        const batch = writeBatch(db);
        SEED_TASKS.forEach(task => {
            const ref = doc(db, "tasks", task.id);
            batch.set(ref, task);
        });
        await batch.commit();
        return SEED_TASKS;
    }
    
    return querySnapshot.docs.map(doc => doc.data() as Task);
  },

  getTasks: async (isSpecial: boolean): Promise<Task[]> => {
    const all = await Store.getAllTasks();
    return all.filter(t => t.isSpecial === isSpecial);
  },

  createTask: async (input: Partial<Task>): Promise<Task> => {
    // Validation
    if (!input.title) throw new Error("Title is required");
    if (!input.link) throw new Error("Link is required");

    const newTask: Task = {
        id: Math.random().toString(36).substr(2, 9),
        title: input.title!,
        description: input.description || '',
        reward: Number(input.reward) || 0,
        diamondReward: Number(input.diamondReward) || 0,
        link: input.link!,
        isSpecial: !!input.isSpecial,
        password: input.password || '', 
        packageName: input.packageName || '',
        hideUntil: undefined
    };

    await setDoc(doc(db, "tasks", newTask.id), newTask);
    return newTask;
  },

  updateTask: async (taskId: string, input: Partial<Task>): Promise<void> => {
     await updateDoc(doc(db, "tasks", taskId), input);
  },
  
  deleteTask: async (taskId: string) => {
    await deleteDoc(doc(db, "tasks", taskId));
  },

  getTaskStats: async (): Promise<Record<string, { completed: number, failed: number }>> => {
      try {
          const snapshot = await getDocs(collection(db, "user_tasks"));
          const stats: Record<string, { completed: number, failed: number }> = {};
          
          snapshot.docs.forEach(d => {
              const data = d.data() as UserTask;
              if (!stats[data.taskId]) stats[data.taskId] = { completed: 0, failed: 0 };
              
              if (data.status === TaskStatus.COMPLETED) stats[data.taskId].completed++;
              if (data.status === TaskStatus.FAILED) stats[data.taskId].failed++;
          });
          return stats;
      } catch {
          return {};
      }
  },

  // --- USER TASKS & VERIFICATION ---
  getUserTasks: async (userId: string): Promise<UserTask[]> => {
    try {
        const q = query(collection(db, "user_tasks"), where("uid", "==", userId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data() as UserTask);
    } catch { return []; }
  },

  startTask: async (userId: string, taskId: string): Promise<string | null> => {
    // Get Task Link
    const taskRef = doc(db, "tasks", taskId);
    const taskSnap = await getDoc(taskRef);
    if (!taskSnap.exists()) return null;
    const task = taskSnap.data() as Task;

    // Check if already started
    const docId = `${userId}_${taskId}`;
    const userTaskRef = doc(db, "user_tasks", docId);
    const userTaskSnap = await getDoc(userTaskRef);

    if (!userTaskSnap.exists()) {
        const newTaskEntry: UserTask & { uid: string } = {
            taskId,
            status: TaskStatus.IN_PROCESS,
            startedAt: new Date().toISOString(),
            obfuscatedName: task.title,
            uid: userId // Field for querying
        };
        await setDoc(userTaskRef, newTaskEntry);
    }

    return task.link;
  },

  verifyTask: async (userId: string, taskId: string, inputData: any, isSpecial: boolean): Promise<{ success: boolean, message: string }> => {
    // Get Task
    const taskRef = doc(db, "tasks", taskId);
    const taskSnap = await getDoc(taskRef);
    if (!taskSnap.exists()) return { success: false, message: "Task invalid" };
    const task = taskSnap.data() as Task;

    // Verification Logic
    let success = false;
    
    if (inputData === 'wrong_data') {
        success = false;
    } else if (inputData === 'demo_bypass') {
        success = true;
    } else {
        success = isSpecial ? (inputData === task.packageName) : (inputData === task.password);
    }
    // Auto-success for empty password/package fields in standard tasks
    if (!isSpecial && !task.password && inputData !== 'wrong_data') {
        success = false;
    }

    const docId = `${userId}_${taskId}`;
    const userTaskRef = doc(db, "user_tasks", docId);
    const userTaskSnap = await getDoc(userTaskRef);
    const now = new Date().toISOString();

    if (success) {
        // Prevent double claiming
        if (userTaskSnap.exists() && userTaskSnap.data().status === TaskStatus.COMPLETED) {
            return { success: true, message: "Task already completed." };
        }

        // Run as batch to ensure atomicity
        const batch = writeBatch(db);

        // Update User Balance
        const userRef = doc(db, "users", userId);
        batch.update(userRef, {
            balance: increment(task.reward),
            diamonds: increment(task.diamondReward || 0),
            lifetimeEarnings: increment(task.reward),
            totalTasks: increment(1)
        });

        // Update Task Status
        const completedTaskData = {
            taskId, 
            status: TaskStatus.COMPLETED, 
            startedAt: userTaskSnap.exists() ? userTaskSnap.data().startedAt : now,
            completedAt: now,
            uid: userId
        };
        batch.set(userTaskRef, completedTaskData); 

        await batch.commit();
        
        return { success: true, message: "Task Completed! Rewards Added." };
    } else {
        // Mark failed
        if (userTaskSnap.exists()) {
             await updateDoc(userTaskRef, { status: TaskStatus.FAILED });
        } else {
            await setDoc(userTaskRef, {
                taskId,
                status: TaskStatus.FAILED,
                startedAt: now,
                uid: userId
            });
        }
        return { success: false, message: "Verification Failed. Try again." };
    }
  },

  // --- DAILY CLAIM ---
  checkDailyClaimStatus: async (userId: string): Promise<boolean> => {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) return false;
    const user = userDoc.data() as User;
    
    const today = new Date().toISOString().split('T')[0];
    return !!(user.lastDailyClaim && user.lastDailyClaim.startsWith(today));
  },

  claimDaily: async (userId: string): Promise<{ success: boolean, message: string }> => {
    const settings = await Store.getSettings();
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) return { success: false, message: "User not found" };
    const user = userSnap.data() as User;
    
    const today = new Date().toISOString().split('T')[0];
    if (user.lastDailyClaim && user.lastDailyClaim.startsWith(today)) {
        return { success: false, message: 'Already claimed today' };
    }

    await updateDoc(userRef, {
        balance: increment(settings.dailyClaimLimit),
        lastDailyClaim: new Date().toISOString()
    });
    
    return { success: true, message: `Claimed ${settings.dailyClaimLimit} Coins!` };
  },

  // --- WITHDRAWALS ---
  requestWithdrawal: async (req: Omit<WithdrawalRequest, 'id' | 'status' | 'requestedAt'>) => {
     const userRef = doc(db, "users", req.uid);
     const userSnap = await getDoc(userRef);
     if (!userSnap.exists()) throw new Error("User not found");
     const user = userSnap.data() as User;

     if (user.balance < req.amount) throw new Error("Insufficient balance");
     
     // Deduct Balance & Create Request Atomically
     const batch = writeBatch(db);
     batch.update(userRef, { balance: increment(-req.amount) });
     
     const newReqRef = doc(collection(db, "withdrawals"));
     const newReq: WithdrawalRequest = {
       ...req,
       id: newReqRef.id,
       status: WithdrawalStatus.PENDING,
       requestedAt: new Date().toISOString()
     };
     batch.set(newReqRef, newReq);

     await batch.commit();
     return newReq;
  },

  getWithdrawals: async (userId?: string): Promise<WithdrawalRequest[]> => {
     let q;
     try {
        if (userId) {
            q = query(collection(db, "withdrawals"), where("uid", "==", userId));
        } else {
            q = query(collection(db, "withdrawals")); // Admin sees all
        }
        
        const snap = await getDocs(q);
        const list = snap.docs.map(d => d.data() as WithdrawalRequest);
        return list.sort((a,b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
     } catch (e) {
         console.error("Withdrawal Fetch Failed", e);
         return [];
     }
  },

  adminUpdateWithdrawal: async (reqId: string, status: WithdrawalStatus) => {
    const reqRef = doc(db, "withdrawals", reqId);
    const reqSnap = await getDoc(reqRef);
    if(!reqSnap.exists()) return;

    const reqData = reqSnap.data() as WithdrawalRequest;
    
    // Refund logic if rejected
    if (status === WithdrawalStatus.REJECTED && reqData.status !== WithdrawalStatus.REJECTED) {
         const batch = writeBatch(db);
         batch.update(reqRef, { status });
         const userRef = doc(db, "users", reqData.uid);
         batch.update(userRef, { balance: increment(reqData.amount) });
         await batch.commit();
    } else {
         await updateDoc(reqRef, { status });
    }
  },

  userConfirmWithdrawal: async (reqId: string, received: boolean) => {
      const status = received ? WithdrawalStatus.COMPLETED : WithdrawalStatus.PENDING;
      await updateDoc(doc(db, "withdrawals", reqId), { status });
  },

  // --- EXTRAS ---
  getLeaderboard: async (): Promise<{name: string, balance: number}[]> => {
      try {
          const q = query(collection(db, "users"), orderBy("balance", "desc"), limit(50));
          const snap = await getDocs(q);
          return snap.docs.map(d => ({ name: d.data().name, balance: d.data().balance }));
      } catch (e) {
          console.error("Leaderboard error", e);
          return [];
      }
  },
  
  getWinnerEntries: async (): Promise<WinnerEntry[]> => {
      const snap = await getDocs(collection(db, "winners"));
      return snap.docs.map(d => d.data() as WinnerEntry);
  },

  enterRandomWinner: async (userId: string, fee: number) => {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      if(!userSnap.exists()) throw new Error("User Error");
      
      if (userSnap.data()?.balance < fee) throw new Error("Insufficient balance");
      
      const batch = writeBatch(db);
      batch.update(userRef, { balance: increment(-fee) });
      
      const entry: WinnerEntry = {
          uid: userId, 
          name: userSnap.data()?.name, 
          avatarChar: userSnap.data()?.name.charAt(0), 
          amountSpent: fee, 
          month: new Date().toISOString(), 
          timestamp: new Date().toISOString()
      };
      const winRef = doc(collection(db, "winners"));
      batch.set(winRef, entry);
      
      await batch.commit();
  },

  // Initialize admin system
  initializeAdmin: async (): Promise<void> => {
    try {
      // Initialize settings (auto-creates if not exist)
      await Store.getSettings();
      
      // Initialize seed tasks (auto-creates if not exist)
      await Store.getAllTasks(true);
      
      console.log("Admin system initialized successfully");
    } catch (e) {
      console.error("Failed to initialize admin system", e);
      throw e;
    }
  }
};
