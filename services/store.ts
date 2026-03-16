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

startTask: async (uid: string, taskId: string): Promise<string | null> => {

const taskRef = doc(db, "tasks", taskId);
const taskSnap = await getDoc(taskRef);

if (!taskSnap.exists()) return null;

const task = taskSnap.data() as Task;

// Prevent duplicate start
const q = query(
  collection(db, "user_tasks"),
  where("uid", "==", uid),
  where("taskId", "==", taskId)
);

const existing = await getDocs(q);

if (!existing.empty) {
  return task.link || null;
}

// 1️⃣ Save task for the user
await addDoc(collection(db, "user_tasks"), {
  uid: uid,
  taskId: taskId,
  status: "IN_PROCESS",
  createdAt: Date.now()
});

// 2️⃣ Move original task to hidden_tasks
await setDoc(doc(db, "hidden_tasks", taskId), {
  ...task,
  hiddenAt: Date.now(),
  hiddenBy: uid
});

// 3️⃣ Delete task from tasks collection
await deleteDoc(doc(db, "tasks", taskId));

// 4️⃣ Create duplicate task with random id
const newTaskId =
  "task_" +
  Math.random().toString(36).substring(2, 8) +
  Date.now().toString(36);

await setDoc(doc(db, "tasks", newTaskId), {
  ...task,
  createdAt: Date.now()
});

return task.link || null;

},


getHiddenTask: async (taskId: string): Promise<Task | null> => {

  const snap = await getDoc(doc(db, "hidden_tasks", taskId));

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...(snap.data() as Task)
  };

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


async verifyTaskComplete(uid: string, task: any) {

try {

const userRef = db.collection("users").doc(uid)

const userTaskRef = db
.collection("users")
.doc(uid)
.collection("user_tasks")
.doc(task.id)

const historyRef = db
.collection("users")
.doc(uid)
.collection("history")
.doc()

await db.runTransaction(async (tx) => {

const userDoc = await tx.get(userRef)
const taskDoc = await tx.get(userTaskRef)

if (!userDoc.exists) throw new Error("User not found")
if (!taskDoc.exists) throw new Error("User task missing")

const userData = userDoc.data()
const taskData = taskDoc.data()

/* prevent double verification */

if (taskData.status === "COMPLETED") {
 throw new Error("Task already completed")
}

/* reward calculation */

const reward = task.reward || 0
const diamondReward = task.diamondReward || 0

const updateUser: any = {

balance: (userData.balance || 0) + reward,

lifetimeEarnings:
(userData.lifetimeEarnings || 0) + reward,

noOfTodayTask:
(userData.noOfTodayTask || 0) + 1

}

/* special task */

if (task.isSpecial) {

updateUser.diamond =
(userData.diamond || 0) + diamondReward

updateUser.lifetimeDiamond =
(userData.lifetimeDiamond || 0) + diamondReward

}

/* standard task */

else {

updateUser.gold =
(userData.gold || 0) + 1

updateUser.lifetimeGold =
(userData.lifetimeGold || 0) + 1

}

/* update user */

tx.update(userRef, updateUser)

/* update task status */

tx.update(userTaskRef, {
status: "COMPLETED",
completed_at: Date.now()
})

/* history */

tx.set(historyRef, {

type: "task_success",

taskId: task.id,

amount: reward,

diamond: diamondReward,

date: new Date().toISOString(),

timestamp: Date.now()

})

})

/* rename task */

const newName = generateRandomTaskName()

await db.collection("tasks").doc(task.id).update({
title: newName
})

return { success: true }

} catch (err: any) {

return {
success: false,
message: err.message
}

}

}, 
async verifyTaskFail(uid: string, taskId: string) {

try {

const userTaskRef = db
.collection("users")
.doc(uid)
.collection("user_tasks")
.doc(taskId)

const historyRef = db
.collection("users")
.doc(uid)
.collection("history")
.doc()

await db.runTransaction(async (tx) => {

const taskDoc = await tx.get(userTaskRef)

if (!taskDoc.exists) throw new Error("Task not found")

const taskData = taskDoc.data()

/* prevent duplicate fail logs */

if (taskData.status === "FAILED") return

tx.update(userTaskRef, {

status: "FAILED",

failed_at: Date.now()

})

tx.set(historyRef, {

type: "task_failed",

taskId: taskId,

amount: 0,

date: new Date().toISOString(),

timestamp: Date.now()

})

})

return { success: true }

} catch (err: any) {

return {
success: false,
message: err.message
}

}

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

//////////////////////////// manually ////////////////////////////


async startTask(uid:string,task:Task){

const startedAt = Date.now()

await db.collection("users")
.doc(uid)
.collection("user_tasks")
.doc(task.id)
.set({
taskId:task.id,
status:"IN_PROCESS",
started:true,
started_by:uid,
started_at:startedAt
})

await db.collection("hidden_tasks")
.doc(task.id)
.set({
...task,
started_by:uid,
started_at:startedAt
})

return task.link
},



async getUserTasks(uid:string){

const snap = await db
.collection("users")
.doc(uid)
.collection("user_tasks")
.get()

return snap.docs.map(d=>({
 id:d.id,
 ...d.data()
}))

},

async getTasks(isSpecial:boolean){

const snap = await db
.collection("tasks")
.where("isSpecial","==",isSpecial)
.get()

return snap.docs.map(d=>({
 id:d.id,
 ...d.data()
}))

  },



async getHiddenTask(taskId:string){

const doc = await db.collection("hidden_tasks")
.doc(taskId)
.get()

if(!doc.exists) return null

return doc.data()

},




async generateRandomTaskName(): string {

  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"

  let id = "zts"

  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)]
  }

  return id
},

async verifyTaskComplete(uid: string, task: any) {

try {

const userRef = db.collection("users").doc(uid)

const userTaskRef = db
.collection("users")
.doc(uid)
.collection("user_tasks")
.doc(task.id)

const historyRef = db
.collection("users")
.doc(uid)
.collection("history")
.doc()

await db.runTransaction(async (tx) => {

const userDoc = await tx.get(userRef)
const taskDoc = await tx.get(userTaskRef)

if (!userDoc.exists) throw new Error("User not found")
if (!taskDoc.exists) throw new Error("User task missing")

const userData = userDoc.data()
const taskData = taskDoc.data()

/* prevent double verification */

if (taskData.status === "COMPLETED") {
 throw new Error("Task already completed")
}

/* reward calculation */

const reward = task.reward || 0
const diamondReward = task.diamondReward || 0

const updateUser: any = {

balance: (userData.balance || 0) + reward,

lifetimeEarnings:
(userData.lifetimeEarnings || 0) + reward,

noOfTodayTask:
(userData.noOfTodayTask || 0) + 1

}

/* special task */

if (task.isSpecial) {

updateUser.diamond =
(userData.diamond || 0) + diamondReward

updateUser.lifetimeDiamond =
(userData.lifetimeDiamond || 0) + diamondReward

}

/* standard task */

else {

updateUser.gold =
(userData.gold || 0) + 1

updateUser.lifetimeGold =
(userData.lifetimeGold || 0) + 1

}

/* update user */

tx.update(userRef, updateUser)

/* update task status */

tx.update(userTaskRef, {
status: "COMPLETED",
completed_at: Date.now()
})

/* history */

tx.set(historyRef, {

type: "task_success",

taskId: task.id,

amount: reward,

diamond: diamondReward,

date: new Date().toISOString(),

timestamp: Date.now()

})

})

/* rename task */

const newName = generateRandomTaskName()

await db.collection("tasks").doc(task.id).update({
title: newName
})

return { success: true }

} catch (err: any) {

return {
success: false,
message: err.message
}

}

},

async verifyTaskFail(uid: string, taskId: string) {

try {

const userTaskRef = db
.collection("users")
.doc(uid)
.collection("user_tasks")
.doc(taskId)

const historyRef = db
.collection("users")
.doc(uid)
.collection("history")
.doc()

await db.runTransaction(async (tx) => {

const taskDoc = await tx.get(userTaskRef)

if (!taskDoc.exists) throw new Error("Task not found")

const taskData = taskDoc.data()

/* prevent duplicate fail logs */

if (taskData.status === "FAILED") return

tx.update(userTaskRef, {

status: "FAILED",

failed_at: Date.now()

})

tx.set(historyRef, {

type: "task_failed",

taskId: taskId,

amount: 0,

date: new Date().toISOString(),

timestamp: Date.now()

})

})

return { success: true }

} catch (err: any) {

return {
success: false,
message: err.message
}

}

},



//////////////////////////// INIT ////////////////////////////

initializeAdmin: async()=>{

await Store.getSettings()
await Store.getAllTasks()

console.log("Admin system ready")

}

}
