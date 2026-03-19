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

//////////////////////////// TASKS ////////////////////////////

getAllTasks: async (): Promise<Task[]> => {

const snap = await getDocs(collection(db,"tasks"))

return snap.docs.map(d=>({
id:d.id,
...d.data()
})) as Task[]

},




createTask: async (taskData: any) => {

try {

const taskId = "zts" + Math.random().toString(36).substring(2,10)

const task:any = {

id: taskId,

title: taskData.title || taskId,

link: taskData.link || "",

reward: Number(taskData.amount) || 0,

isSpecial: taskData.isSpecial || false,

created_at: Date.now(),

active: true

}

// STANDARD TASK
if(!taskData.isSpecial){

task.expectedZipName = taskData.expectedZipName || ""
task.password = taskData.password || ""
task.expectedInnerFileName = taskData.expectedInnerFileName || ""

}

// SPECIAL TASK
if(taskData.isSpecial){

task.packageName = taskData.packageName || ""
diamondReward: Number(taskData.diamondReward) || 0
}

await setDoc(doc(collection(db,"tasks"),taskId),task)

return {
success:true,
taskId:taskId
}

}catch(err:any){

console.error(err)

return {
success:false,
message:err.message
}

}

},




async editTask(taskId:string, updates:any){

try{

const taskRef = db.collection("tasks").doc(taskId)

const doc = await taskRef.get()

if(!doc.exists){
throw new Error("Task not found")
}

const updateData:any = {

updated_at: Date.now()

}

if(updates.title !== undefined)
updateData.title = updates.title

if(updates.description !== undefined)
updateData.description = updates.description

if(updates.link !== undefined)
updateData.link = updates.link

if(updates.reward !== undefined)
updateData.reward = Number(updates.reward)

if(updates.diamondReward !== undefined)
updateData.diamondReward = Number(updates.diamondReward)

if(updates.password !== undefined)
updateData.password = updates.password

if(updates.expectedZipName !== undefined)
updateData.expectedZipName = updates.expectedZipName

if(updates.expectedInnerFileName !== undefined)
updateData.expectedInnerFileName = updates.expectedInnerFileName

if(updates.isSpecial !== undefined)
updateData.isSpecial = updates.isSpecial

await taskRef.update(updateData)

return { success:true }

}catch(err:any){

return {
success:false,
message:err.message
}

}

},


async deleteTask(taskId:string){

try{

const taskRef = db.collection("tasks").doc(taskId)

const doc = await taskRef.get()

if(!doc.exists){
throw new Error("Task not found")
}

await taskRef.delete()

return { success:true }

}catch(err:any){

return {
success:false,
message:err.message
}

}

},


//////////////////////////// USER TASK ////////////////////////////

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
