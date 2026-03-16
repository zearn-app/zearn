import React from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";

const AdminDashboard: React.FC = () => {

const navigate = useNavigate()

return (

<Layout>

<div className="p-4 space-y-4">

<h1 className="text-xl font-bold">Admin Dashboard</h1>

<div className="grid grid-cols-2 gap-4">

{/* TASKS */}

<button
onClick={()=>navigate("/admin-tasks")}
className="bg-blue-600 text-white p-6 rounded text-lg font-bold"
>
Tasks
</button>

{/* WITHDRAWALS */}

<button
onClick={()=>navigate("/admin-withdrawals")}
className="bg-green-600 text-white p-6 rounded text-lg font-bold"
>
Withdrawals
</button>

{/* USERS */}

<button
onClick={()=>navigate("/admin-users")}
className="bg-yellow-500 text-white p-6 rounded text-lg font-bold"
>
Users
</button>

{/* SETTINGS */}

<button
onClick={()=>navigate("/admin-settings")}
className="bg-purple-600 text-white p-6 rounded text-lg font-bold"
>
Settings
</button>

</div>

</div>

</Layout>

)

}

export default AdminDashboard