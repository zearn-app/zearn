import React, { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { Store } from "../services/store";
import { AdminSettings } from "../types";

const AdminSettingsPage: React.FC = () => {

const [settings,setSettings] = useState<AdminSettings | null>(null)

////////////////////////////////////////////////////
//////////////// LOAD SETTINGS /////////////////////
////////////////////////////////////////////////////

const loadSettings = async()=>{

try{

const s = await Store.getSettings()

setSettings(s)

}catch(err){

console.error(err)

}

}

useEffect(()=>{

loadSettings()

},[])

////////////////////////////////////////////////////
//////////////// UPDATE FORM ///////////////////////
////////////////////////////////////////////////////

const updateField = (key:string,value:any)=>{

if(!settings) return

setSettings({
...settings,
[key]:value
})

}

////////////////////////////////////////////////////
//////////////// SAVE //////////////////////////////
////////////////////////////////////////////////////

const saveSettings = async()=>{

try{

await Store.updateSettings(settings)

alert("Settings updated")

}catch(err){

console.error(err)

}

}

////////////////////////////////////////////////////
//////////////// UI ////////////////////////////////
////////////////////////////////////////////////////

if(!settings) return <Layout><div className="p-4">Loading settings...</div></Layout>

return(

<Layout>

<div className="p-4 space-y-4">

<h1 className="text-xl font-bold">Admin Settings</h1>

<input
type="number"
placeholder="Minimum Withdrawal"
value={settings.minWithdraw}
onChange={e=>updateField("minWithdraw",Number(e.target.value))}
className="border p-2 rounded w-full"
/>

<input
type="number"
placeholder="Jackpot Amount"
value={settings.jackpotAmount}
onChange={e=>updateField("jackpotAmount",Number(e.target.value))}
className="border p-2 rounded w-full"
/>

<label className="flex gap-2 items-center">

<input
type="checkbox"
checked={settings.withdrawEnabled}
onChange={e=>updateField("withdrawEnabled",e.target.checked)}
/>

Withdraw Enabled

</label>

<label className="flex gap-2 items-center">

<input
type="checkbox"
checked={settings.tasksEnabled}
onChange={e=>updateField("tasksEnabled",e.target.checked)}
/>

Tasks Enabled

</label>

<button
onClick={saveSettings}
className="bg-blue-600 text-white px-4 py-2 rounded w-full"
>
Save Settings
</button>

</div>

</Layout>

)

}

export default AdminSettingsPage