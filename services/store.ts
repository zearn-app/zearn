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
writeBatch
} from "firebase/firestore";

import {
User,
Task,
WithdrawalRequest,
AdminSettings,
TaskStatus,
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

toggleUserBan: async(uid:string,current:boolean)=>{
await updateDoc(doc(db,"users",uid),{
isBanned:!current
})
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
    ...snap.docs[0].data()
  };

},

loginUser: async (user:any) => {

  localStorage.setItem("zearn_user", JSON.stringify(user));

  return user;

},

registerUser: async (data:any) => {

  const ref = doc(collection(db,"users"))

  const user = {
    uid: ref.id,
    email: data.email,
    name: data.name,
    mobile: data.mobile,
    dob: data.dob,
    district: data.district,
    password: data.password,
    country: data.country,
    balance: 0,
    isBanned:false,
    isAdmin:false,
    createdAt:new Date().toISOString()
  }

  await setDoc(ref,user)

  return user

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

//////////////////////////// TASKS ////////////////////////////

getAllTasks: async (): Promise<Task[]> => {

const snap = await getDocs(collection(db,"tasks"))

return snap.docs.map(d=>d.data() as Task)
},

createTask: async(input:Partial<Task>): Promise<Task>=>{

if(!input.title) throw new Error("Title required")

const newTask:Task={

id: input.id || "task_"+Date.now(),

title: input.title,
description: input.description || "",

reward: Number(input.reward)||0,

isSpecial: !!input.isSpecial,

password: input.password || "",

expectedZipName: input.expectedZipName || "",
expectedInnerFileName: input.expectedInnerFileName || "",

link: input.link || "",

status: "active"

}

await setDoc(doc(db,"tasks",newTask.id),newTask)

return newTask
},

updateTask: async(taskId:string,input:Partial<Task>)=>{
await updateDoc(doc(db,"tasks",taskId),input)
},

deleteTask: async(taskId:string)=>{
await deleteDoc(doc(db,"tasks",taskId))
},

//////////////////////////// USER TASK ////////////////////////////

getUserTasks: async(uid:string): Promise<UserTask[]>=>{

const q=query(collection(db,"user_tasks"),where("uid","==",uid))

const snap=await getDocs(q)

return snap.docs.map(d=>d.data() as UserTask)

},

//////////////////////////// WITHDRAW ////////////////////////////

getWithdrawals: async(uid?:string):Promise<WithdrawalRequest[]>=>{

let q

if(uid){

q=query(collection(db,"withdrawals"),where("uid","==",uid))

}else{

q=collection(db,"withdrawals")

}

const snap=await getDocs(q)

return snap.docs.map(d=>d.data() as WithdrawalRequest)

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

const snap=await getDocs(collection(db,"winners"))

return snap.docs.map(d=>d.data() as WinnerEntry)

},

enterRandomWinner: async(uid:string,fee:number)=>{

const userRef=doc(db,"users",uid)

const snap=await getDoc(userRef)

if(!snap.exists()) throw new Error("User not found")

if(snap.data().balance < fee) throw new Error("Low balance")

const batch=writeBatch(db)

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

const ref=doc(collection(db,"winners"))

batch.set(ref,entry)

await batch.commit()

},

//////////////////////////// INIT ////////////////////////////

initializeAdmin: async()=>{

await Store.getSettings()

await Store.getAllTasks()

console.log("Admin system ready")

}

}