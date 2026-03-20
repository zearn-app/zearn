import { db } from "./firebase";
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


  /* CREATE */
async createTask(data:any) {
  const ref = doc(collection(db,"tasks"))

  await setDoc(ref,{
    ...data,
    task_id: ref.id
  })
},

/* UPDATE */
async updateTask(id:string, data:any) {
  await updateDoc(doc(db,"tasks",id), data)
},

/* DELETE */
async deleteTask(id:string) {
  await deleteDoc(doc(db,"tasks",id))
},
//////////////////////////// task ////////////////////////////
async getTasks() {
    const snap = await getDocs(collection(db, "tasks"))
    return snap.docs.map(d => ({ id: d.id, ...d.data() })) as Task[]
  },

  /* ---------- START TASK ---------- */

  async startTask(task: Task, uid: string) {

    const ref = doc(db, "tasks", task.id)

    await updateDoc(ref, {
      is_started: true,
      started_by: uid,
      started_at: serverTimestamp()
    })

    return true
  },

  /* ---------- VERIFY TASK ---------- */

  async verifyTask(
    file: File,
    task: Task,
    uid: string
  ): Promise<TaskStatus> {

    try {

      /* ---- ZIP CHECK ---- */
      if (!task.is_special) {

        if (file.name !== task.expectedzipfilename) {
          return TaskStatus.FAILED
        }

        const zip = await JSZip.loadAsync(file)
        const files = Object.keys(zip.files)

        if (!files.includes(task.expectedinnerfilename)) {
          return TaskStatus.FAILED
        }
      }

      /* ---- REWARDS ---- */

      const settingsRef = doc(db, "settings", "config")
      const settingsSnap = await getDoc(settingsRef)
      const settings = settingsSnap.data()

      const userRef = doc(db, "users", uid)

      let amount = settings.standard_amount
      let diamond = 0
      let gold = 1

      if (task.is_special) {
        amount = settings.special_reward
        diamond = 1
        gold = 0
      }

      await updateDoc(userRef, {
        balance: increment(amount),
        lifetime_earnings: increment(amount),
        gold: increment(gold),
        lifetime_gold: increment(gold),
        diamond: increment(diamond),
        lifetime_diamond: increment(diamond),
        no_of_tasks_today: increment(1)
      })

      /* ---- HISTORY ---- */

      const historyRef = doc(collection(db, "users", uid, "history"))

      await setDoc(historyRef, {
        task_id: task.task_id,
        task_name: task.task_name,
        amount,
        profit: true,
        type: task.is_special ? "SPECIAL" : "STANDARD",
        date: new Date()
      })

      /* ---- RESET TASK ---- */

      const taskRef = doc(db, "tasks", task.id)

      await updateDoc(taskRef, {
        task_name: generateRandomTaskName(),
        is_started: false,
        started_by: "",
        started_at: null
      })

      return TaskStatus.COMPLETED

    } catch (e) {
      console.error(e)
      return TaskStatus.FAILED
    }
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
