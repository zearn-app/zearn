import { db } from "./firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore"
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import {
collection,
doc,
getDoc,
getDocs,
setDoc,
updateDoc,
deleteDoc,
query,
where,
orderBy,
limit,
increment,
writeBatch,
addDoc
} from "firebase/firestore";

import {
User,
Task,
WithdrawalRequest,
AdminSettings,
WithdrawalStatus,
WinnerEntry,
UserTask
} from "../types";
export interface Task {
  task_id: string;
  task_name: string;
  reward_spe?: number;
  diamond?: number;
  link: string;
  is_special: boolean;
  expectedzipfilename: string;
  expectedinnerfilename: string;

  is_started: boolean;
  started_by?: string;
  started_at?: any;
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
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  let id = "ztask"
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)]
  }
  return id
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

const snap = await getDocs(collection(db,"users"))

return snap.docs.map(d=>({
uid:d.id,
...d.data()
})) as User[]

},

updateUser: async (uid: string, data: Partial<User>) => {

  const ref = doc(db, "users", uid);

  await updateDoc(ref, {
    ...data,
    updatedAt: new Date().toISOString()
  });

},
toggleUserBan: async(uid:string,current:boolean)=>{

await updateDoc(doc(db,"users",uid),{
isBanned:!current
})

},

checkUserExists: async (email: string) => {

const q = query(
collection(db,"users"),
where("email","==",email)
)

const snap = await getDocs(q)

if(snap.empty) return null

return {
uid:snap.docs[0].id,
...snap.docs[0].data()
} as User

},

loginUser: async (user:User)=>{

localStorage.setItem("zearn_user",JSON.stringify(user))

return user

},

logoutUser: ()=>{

localStorage.removeItem("zearn_user")

},

getCurrentUser: ():User | null =>{

const raw = localStorage.getItem("zearn_user")

if(!raw) return null

return JSON.parse(raw)

},

registerUser: async (data:any)=>{

const ref = doc(collection(db,"users"))

const user:User = {

uid:ref.id,

email:data.email,
name:data.name,

mobile:data.mobile,
dob:data.dob,
district:data.district,

password:data.password,

country:data.country,

balance:0,

isBanned:false,
isAdmin:false,

createdAt:new Date().toISOString()

}

await setDoc(ref,user)

return user

},

adminAddCoins: async(uid:string,amount:number)=>{

await updateDoc(doc(db,"users",uid),{
balance:increment(amount)
})

},

//////////////////////////// SETTINGS ////////////////////////////

getSettings: async (): Promise<AdminSettings> => {

const ref = doc(db,"settings","config")

const snap = await getDoc(ref)

if(snap.exists()) return snap.data() as AdminSettings

await setDoc(ref,DEFAULT_SETTINGS)

return DEFAULT_SETTINGS

},

updateSettings: async(settings:AdminSettings)=>{

await setDoc(doc(db,"settings","config"),settings)

},
//////////////////////////// task admin ////////////////////////////

//////////////////////////// task ////////////////////////////
generateTaskName() {
    return "ztask_" + Math.random().toString(36).substring(2, 10);
  },

  // 🔹 Get Tasks
  async getTasks(isSpecial: boolean) {
    const q = query(
      collection(db, "tasks"),
      where("is_special", "==", isSpecial)
    );

    const snap = await getDocs(q);
    return snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
  },

  // 🔹 Start Task
  async startTask(taskId: string, uid: string) {
    const ref = doc(db, "tasks", taskId);

    await updateDoc(ref, {
      is_started: true,
      started_by: uid,
      started_at: new Date()
    });
  },

  // 🔹 Get Single Task
  async getTask(taskId: string) {
    const ref = doc(db, "tasks", taskId);
    const snap = await getDoc(ref);
    return { id: snap.id, ...snap.data() };
  },

  // 🔹 Complete Task (MAIN LOGIC)
  async completeTask(task: any, uid: string, zipFile: File) {

    const zip = await JSZip.loadAsync(zipFile);

    // ✅ Check zip filename
    if (zipFile.name !== task.expectedzipfilename) {
      throw new Error("Zip filename mismatch");
    }

    // ✅ Check inner file
    const innerFile = Object.keys(zip.files).find(
      f => f === task.expectedinnerfilename
    );

    if (!innerFile) {
      throw new Error("Inner file mismatch");
    }

    // 🔹 Get settings
    const settingsSnap = await getDoc(doc(db, "settings", "rewards"));
    const settings = settingsSnap.data();

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

    // 🔥 STANDARD TASK
    if (!task.is_special) {
      const amount = settings.standard_amount;

      updateData.balance = increment(amount);
      updateData.lifetime_earnings = increment(amount);
      updateData.gold = increment(1);
      updateData.lifetime_gold = increment(1);

      history.amount = amount;
    }

    // 💎 SPECIAL TASK
    else {
      const reward = settings.special_reward;

      updateData.balance = increment(reward);
      updateData.lifetime_earnings = increment(reward);
      updateData.diamond = increment(1);
      updateData.lifetime_diamond = increment(1);

      history.amount = reward;
    }

    // 🔹 Update User
    await updateDoc(userRef, updateData);

    // 🔹 Add History
    await addDoc(collection(db, "users", uid, "history"), history);

    // 🔹 Reset Task
    await updateDoc(doc(db, "tasks", task.id), {
      task_name: this.generateTaskName(),
      is_started: false,
      started_by: "",
      started_at: ""
    });

    return true;
  },
//////////////////////////// WITHDRAW ////////////////////////////

createWithdrawal: async(input:WithdrawalRequest)=>{

const ref = doc(collection(db,"withdrawals"))

await setDoc(ref,{
...input,
id:ref.id,
status:"PENDING",
createdAt:new Date().toISOString()
})

},

getWithdrawals: async(uid?:string):Promise<WithdrawalRequest[]>=>{

let q:any

if(uid){

q = query(
collection(db,"withdrawals"),
where("uid","==",uid)
)

}else{

q = collection(db,"withdrawals")

}

const snap = await getDocs(q)

return snap.docs.map(d=>({
id:d.id,
...d.data()
})) as WithdrawalRequest[]

},

adminUpdateWithdrawal: async(id:string,status:WithdrawalStatus)=>{

await updateDoc(doc(db,"withdrawals",id),{
status
})

},

//////////////////////////// LEADERBOARD ////////////////////////////

getLeaderboard: async()=>{

const q=query(
collection(db,"users"),
orderBy("balance","desc"),
limit(50)
)

const snap=await getDocs(q)

return snap.docs.map(d=>({

name:d.data().name,
balance:d.data().balance

}))

},

//////////////////////////// RANDOM WINNER ////////////////////////////

getWinnerEntries: async():Promise<WinnerEntry[]>=>{

const snap = await getDocs(collection(db,"winners"))

return snap.docs.map(d=>({
id:d.id,
...d.data()
})) as WinnerEntry[]

},

enterRandomWinner: async(uid:string,fee:number)=>{

const userRef = doc(db,"users",uid)

const snap = await getDoc(userRef)

if(!snap.exists()) throw new Error("User not found")

if(snap.data().balance < fee) throw new Error("Low balance")

const batch = writeBatch(db)

batch.update(userRef,{
balance:increment(-fee)
})

const entry:WinnerEntry={

uid,

name:snap.data().name,
avatarChar:snap.data().name.charAt(0),

amountSpent:fee,

month:new Date().toISOString(),

timestamp:new Date().toISOString()

}

const ref = doc(collection(db,"winners"))

batch.set(ref,entry)

await batch.commit()

},




//////////////////////////// DAILY CLAIM ////////////////////////////

checkDailyClaimStatus: async (uid: string): Promise<boolean> => {

  const today = new Date().toISOString().slice(0,10);

  const q = query(
    collection(db,"daily_claims"),
    where("uid","==",uid),
    where("date","==",today)
  );

  const snap = await getDocs(q);

  return !snap.empty;

},

claimDaily: async (uid:string)=>{

  const today = new Date().toISOString().slice(0,10);

  const q = query(
    collection(db,"daily_claims"),
    where("uid","==",uid),
    where("date","==",today)
  );

  const snap = await getDocs(q);

  if(!snap.empty){

    return {
      success:false,
      message:"Already claimed today"
    }

  }

  const userRef = doc(db,"users",uid)

  const batch = writeBatch(db)

  batch.update(userRef,{
    balance:increment(10)
  })

  const ref = doc(collection(db,"daily_claims"))

  batch.set(ref,{
    uid,
    date:today,
    reward:10,
    timestamp:new Date().toISOString()
  })

  await batch.commit()

  return {
    success:true,
    message:"Daily bonus claimed! +10 coins"
  }

},


//////////////////////////// INIT ////////////////////////////

initializeAdmin: async()=>{

await Store.getSettings()
await Store.getAllTasks()

console.log("Admin system ready")

}

}
