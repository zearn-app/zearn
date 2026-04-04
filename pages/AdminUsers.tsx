import React, { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { Store } from "../services/store";
import { User } from "../types";
import { X } from "lucide-react";

const AdminUsers: React.FC = () => {

const [users,setUsers] = useState<User[]>([])
const [loading,setLoading] = useState(true)

const [search,setSearch] = useState("")

const [modal,setModal] = useState(false)
const [editingUser,setEditingUser] = useState<User | null>(null)

// ✅ NEW: view modal
const [viewUser,setViewUser] = useState<User | null>(null)

const [form,setForm] = useState({
name:"",
email:"",
balance:0,
rank:"",
isBanned:false
})

////////////////////////////////////////////////////
//////////////// LOAD USERS ////////////////////////
////////////////////////////////////////////////////

const [taskStats,setTaskStats] = useState<{success:number,failed:number}>({
  success:0,
  failed:0
})

const loadUsers = async ()=>{

setLoading(true)

try{
const u = await Store.getAllUsers()
setUsers(u)
}catch(err){
console.error(err)
}

setLoading(false)
}

useEffect(()=>{
loadUsers()
},[])

////////////////////////////////////////////////////
//////////////// EDIT USER /////////////////////////
////////////////////////////////////////////////////

const openEdit = (user:User)=>{

setEditingUser(user)

setForm({
name:user.name || "",
email:user.email || "",
balance:user.balance || 0,
rank:user.rank || "",
isBanned:user.isBanned || false
})

setModal(true)
}

////////////////////////////////////////////////////
//////////////// SAVE USER /////////////////////////
////////////////////////////////////////////////////

const saveUser = async (e:React.FormEvent)=>{

e.preventDefault()

if(!editingUser) return

try{

await Store.updateUser(editingUser.uid,{
name:form.name,
balance:Number(form.balance),
rank:form.rank,
isBanned:form.isBanned
})

setModal(false)
await loadUsers()

}catch(err){
console.error(err)
alert("Update failed")
}
}

////////////////////////////////////////////////////
//////////////// BAN USER //////////////////////////
////////////////////////////////////////////////////

const toggleBan = async(user:User)=>{
try{
await Store.updateUser(user.uid,{
isBanned:!user.isBanned
})
await loadUsers()
}catch(err){
console.error(err)
}
}

////////////////////////////////////////////////////
//////////////// FILTER USERS //////////////////////
////////////////////////////////////////////////////

const filteredUsers = users.filter(u=>{
const text = search.toLowerCase()
return (
(u.name || "").toLowerCase().includes(text) ||
(u.email || "").toLowerCase().includes(text)
)
})

////////////////////////////////////////////////////
//////////////// TOTALS ////////////////////////////
////////////////////////////////////////////////////

const totalUsers = users.length;

const totalBalance = users.reduce((sum, u) => {
return sum + (Number(u.balance) || 0);
}, 0);

////////////////////////////////////////////////////
//////////////// UI ////////////////////////////////
////////////////////////////////////////////////////

return(

<Layout>

<div className="p-4 space-y-4">

<div className="bg-white p-3 rounded border space-y-1">
<div className="font-semibold">
Total Users: {totalUsers}
</div>
<div className="font-semibold">
Total Balance: {totalBalance} Coins
</div>
</div>

<h1 className="text-xl font-bold">Admin Users</h1>

<input
placeholder="Search users..."
value={search}
onChange={e=>setSearch(e.target.value)}
className="border p-2 rounded w-full"
/>

{loading && <div>Loading users...</div>}

{!loading && filteredUsers.map(u=>(

<div
key={u.uid}
onClick={()=>setViewUser(u)} // ✅ CLICK TO VIEW
className="border bg-white p-3 rounded flex justify-between items-center cursor-pointer"
>

<div>

<div className="font-bold">{u.name}</div>
<div className="text-xs text-gray-500">{u.email}</div>

<div className="text-xs">
Coins: {u.balance}
</div>

<div className="text-xs">
Rank: {u.rank || "none"}
</div>

<div className={`text-xs ${u.isBanned ? "text-red-600":"text-green-600"}`}>
{u.isBanned ? "Banned":"Active"}
</div>

</div>

<div className="flex gap-2">

<button
onClick={(e)=>{
e.stopPropagation()
openEdit(u)
}}
className="bg-yellow-400 px-3 py-1 rounded"
>
Edit
</button>

<button
onClick={(e)=>{
e.stopPropagation()
toggleBan(u)
}}
className={`px-3 py-1 rounded text-white ${
u.isBanned ? "bg-green-600":"bg-red-600"
}`}
>
{u.isBanned ? "Unban":"Ban"}
</button>

</div>

</div>

))}

</div>

{/* VIEW USER MODAL */}

{viewUser && (

<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

<div className="bg-white p-5 rounded w-[95%] max-w-md space-y-3">

<div className="flex justify-between">
<h3 className="font-bold">User Details</h3>
<button onClick={()=>setViewUser(null)}>
<X/>
</button>
</div>

<div className="text-sm space-y-1">

<div><b>Name:</b> {viewUser.name}</div>
<div><b>Email:</b> {viewUser.email}</div>
<div><b>Mobile:</b> {viewUser.mobile}</div>
<div><b>Country:</b> {viewUser.country}</div>
<div><b>District:</b> {viewUser.district}</div>
<div><b>DOB:</b> {viewUser.dob}</div>

<div><b>Coins:</b> {viewUser.balance}</div>
<div><b>Gold:</b> {viewUser.gold}</div>

<div><b>Lifetime Earnings:</b> {viewUser.lifetime_earnings}</div>
<div><b>Lifetime Gold:</b> {viewUser.lifetime_gold}</div>

<div><b>Today Tasks:</b> {viewUser.noOfTodayTask}</div>

<div><b>Referral Code:</b> {viewUser.referralCode}</div>
<div><b>Total Referrals:</b> {viewUser.totalReferrals}</div>

<div><b>UID:</b> {viewUser.uid}</div>

<div className={viewUser.isBanned ? "text-red-600":"text-green-600"}>
<b>Status:</b> {viewUser.isBanned ? "Banned":"Active"}
</div>

</div>

</div>

</div>

)}

{/* EDIT USER MODAL */}
{modal &&(

<div className="fixed inset-0 bg-black/40 flex items-center justify-center">

<form
onSubmit={saveUser}
className="bg-white p-5 rounded w-[95%] max-w-md space-y-3"
>

<div className="flex justify-between">

<h3 className="font-bold">Edit User</h3>

<button
type="button"
onClick={()=>setModal(false)}
>
<X/>
</button>

</div>

<input
placeholder="Name"
value={form.name}
onChange={e=>setForm({...form,name:e.target.value})}
className="border p-2 rounded w-full"
/>

<input
placeholder="Email"
value={form.email}
disabled
className="border p-2 rounded w-full bg-gray-100"
/>

<input
type="number"
placeholder="Coins"
value={form.balance}
onChange={e=>setForm({...form,balance:Number(e.target.value)})}
className="border p-2 rounded w-full"
/>

<input
placeholder="Rank"
value={form.rank}
onChange={e=>setForm({...form,rank:e.target.value})}
className="border p-2 rounded w-full"
/>

<label className="flex gap-2 items-center">

<input
type="checkbox"
checked={form.isBanned}
onChange={e=>setForm({...form,isBanned:e.target.checked})}
/>

Ban User

</label>

<button
type="submit"
className="bg-blue-600 text-white px-4 py-2 rounded w-full"
>
Save Changes
</button>

</form>

</div>

)}

</Layout>
)
}

export default AdminUsers;