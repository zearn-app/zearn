import React, { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { Store } from "../services/store";
import { WithdrawalRequest, WithdrawalStatus } from "../types";

const AdminWithdrawals: React.FC = () => {

const [withdrawals,setWithdrawals] = useState<WithdrawalRequest[]>([])
const [loading,setLoading] = useState(true)

////////////////////////////////////////////////////
//////////////// LOAD WITHDRAWALS //////////////////
////////////////////////////////////////////////////

const loadWithdrawals = async()=>{

setLoading(true)

try{

const w = await Store.getWithdrawals()

setWithdrawals(w)

}catch(err){

console.error(err)

}

setLoading(false)

}

useEffect(()=>{

loadWithdrawals()

},[])

////////////////////////////////////////////////////
//////////////// APPROVE ///////////////////////////
////////////////////////////////////////////////////

const approve = async(id:string)=>{

await Store.adminUpdateWithdrawal(id,WithdrawalStatus.COMPLETED)

await loadWithdrawals()

}

////////////////////////////////////////////////////
//////////////// REJECT ////////////////////////////
////////////////////////////////////////////////////

const reject = async(id:string)=>{

await Store.adminUpdateWithdrawal(id,WithdrawalStatus.REJECTED)

await loadWithdrawals()

}

////////////////////////////////////////////////////
//////////////// UI ////////////////////////////////
////////////////////////////////////////////////////

return(

<Layout>

<div className="p-4 space-y-4">

<h1 className="text-xl font-bold">Admin Withdrawals</h1>

{loading && <div>Loading withdrawals...</div>}

{!loading && withdrawals.map(w=>(

<div
key={w.id}
className="border bg-white p-3 rounded flex justify-between items-center"
>

<div>

<div className="font-bold">
₹{w.amount}
</div>

<div className="text-xs text-gray-500">
User: {w.uid}
</div>

<div className="text-xs">
Type: {w.type}
</div>

<div className={`text-xs ${
w.status === "PENDING" ? "text-yellow-600":
w.status === "COMPLETED" ? "text-green-600":
"text-red-600"
}`}>
Status: {w.status}
</div>

</div>

{w.status === "PENDING" &&(

<div className="flex gap-2">

<button
onClick={()=>approve(w.id)}
className="bg-green-600 text-white px-3 py-1 rounded"
>
Approve
</button>

<button
onClick={()=>reject(w.id)}
className="bg-red-600 text-white px-3 py-1 rounded"
>
Reject
</button>

</div>

)}

</div>

))}

</div>

</Layout>

)

}

export default AdminWithdrawals