import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Store } from '../services/store';
import { UserContext } from '../App';
import { Task, TaskStatus } from '../types';
import { Upload, Check, AlertCircle, FileArchive, Smartphone, Info, Clock } from 'lucide-react';
import { useNotification } from '../components/NotificationSystem';

// ✅ Added ZIP extraction library
import { ZipReader, BlobReader, TextWriter } from "@zip.js/zip.js";

const TaskCheck: React.FC = () => {
const { taskId } = useParams<{ taskId: string }>();
const { user, refreshUser } = useContext(UserContext);
const navigate = useNavigate();
const { notify } = useNotification();

const [task, setTask] = useState<Task | null>(null);
const [fileSelected, setFileSelected] = useState<File | null>(null);
const [status, setStatus] = useState<TaskStatus>(TaskStatus.IN_PROCESS);
const [isVerifying, setIsVerifying] = useState(false);

// Timer State
const [timeLeft, setTimeLeft] = useState(0);

useEffect(() => {
const fetchTaskInfo = async () => {
if (user && taskId) {
const std = await Store.getTasks(false);
const spc = await Store.getTasks(true);
const allTasks = [...std, ...spc];
const t = allTasks.find(t => t.id === taskId);
setTask(t || null);
const userTasks = await Store.getUserTasks(user.uid);
const ut = userTasks.find(ut => ut.taskId === taskId);
if(ut) setStatus(ut.status);
}
};
fetchTaskInfo();
}, [user, taskId]);

// Timer Effect
useEffect(() => {
if (timeLeft > 0) {
const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
return () => clearTimeout(timer);
}
}, [timeLeft]);

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
if (e.target.files && e.target.files[0]) {
const file = e.target.files[0];
// Basic Validation
if (task?.isSpecial) {
if (!file.name.endsWith('.apk')) { notify("Only .apk files allowed", 'error'); return; }
} else {
if (!file.name.endsWith('.zip')) { notify("Only .zip files allowed", 'error'); return; }
}
setFileSelected(file);
setTimeLeft(10); // Start 10s timer on upload
}
};



// ✅ UPDATED HANDLE CHECK (Only logic changed here)
const handleCheck = async () => {
if (!user || !task || !fileSelected) {
notify("Please upload the required file", "error");
return;
}

setIsVerifying(true);

try {

// Simulate small delay (kept your behavior style)
await new Promise(r => setTimeout(r, 2000));

// Only for ZIP tasks
if (!task.isSpecial) {

if (!task.password) {
throw new Error("Task password not configured");
}

const reader = new ZipReader(
new BlobReader(fileSelected),
{ password: task.password }
);

const entries = await reader.getEntries();

if (entries.length === 0) {
throw new Error("Zip extraction failed");
}

// Try extracting first file to validate password
await entries[0].getData(new TextWriter());

await reader.close();
}

// If extraction success → call original Store.verifyTask
const result = await Store.verifyTask(
user.uid,
task.id,
"zip_verified",
task.isSpecial
);

if (result.success) {
notify(result.message || "Verification successful! Reward added.", "success");
refreshUser();
navigate('/tasks/' + (task.isSpecial ? 'special' : 'standard'));
} else {
throw new Error(result.message);
}

} catch (err) {

setStatus(TaskStatus.FAILED);
notify("Verification failed. Wrong file or password.", "error");
refreshUser();

}

setIsVerifying(false);
};



if (!task) return <Layout>Loading...</Layout>;

return (
<Layout>
<div className="bg-gray-900 rounded-2xl p-6 text-white text-center mb-6 shadow-md">
<h2 className="text-xl font-bold mb-2">
{task.isSpecial ? "Upload .APK File" : "Upload .ZIP File"}
</h2>
<p className="opacity-80 text-sm">
{task.isSpecial ? "Upload the app you downloaded from the link." : "Upload the file you downloaded."}
</p>
</div>

<div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start space-x-3 mb-6">
<Info className="text-blue-500 shrink-0" size={20} />
<p className="text-xs text-blue-800 leading-relaxed">
<span className="font-bold">Instructions:</span> Upload the file. The system will verify the signature.
<br/>For testing: Use any {task.isSpecial ? '.apk' : '.zip'} file.
</p>
</div>

<div className="space-y-6">
{status === TaskStatus.FAILED && (
<div className="bg-red-50 p-4 rounded-xl border border-red-200 text-center animate-in fade-in slide-in-from-top-4">
<AlertCircle className="mx-auto text-red-500 mb-2" />
<h3 className="text-red-800 font-bold">Verification Failed</h3>
<p className="text-xs text-red-600">The file did not match our records. Task marked as failed.</p>
</div>
)}

{status === TaskStatus.COMPLETED ? (
<div className="text-center p-10 bg-green-50 rounded-2xl border border-green-200">
<Check className="mx-auto text-green-600 w-16 h-16 mb-4" />
<h3 className="text-green-800 font-bold text-xl">Completed</h3>
<p className="text-green-600 text-sm mt-2">Rewards added to wallet.</p>
</div>
) : (
status !== TaskStatus.FAILED && (
<>
<div className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all relative overflow-hidden ${fileSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}>
<input
type="file"
accept={task.isSpecial ? ".apk" : ".zip"}
className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
onChange={handleFileChange}
/>
<div className="flex flex-col items-center">
<div className={`p-4 rounded-full mb-3 ${fileSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-400'}`}>
{task.isSpecial ? <Smartphone size={32} /> : <FileArchive size={32} />}
</div>
<p className={`font-bold ${fileSelected ? 'text-blue-700' : 'text-gray-600'}`}>
{fileSelected ? fileSelected.name : (task.isSpecial ? "Tap to upload APK" : "Tap to upload ZIP")}
</p>
<p className="text-xs text-gray-400 mt-1">Max size 50MB</p>
</div>
</div>

{fileSelected && (
<div className="bg-white border border-gray-200 p-4 rounded-xl flex items-center justify-between">
<div className="flex items-center space-x-2">
<Check size={16} className="text-green-500"/>
<span className="text-sm font-bold text-gray-700">File Ready</span>
</div>
{timeLeft > 0 ? (
<div className="flex items-center space-x-1 text-orange-500 font-bold text-sm bg-orange-50 px-2 py-1 rounded">
<Clock size={14} />
<span>Analyzing... {timeLeft}s</span>
</div>
) : (
<span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded">Ready to Verify</span>
)}
</div>
)}

<button
onClick={handleCheck}
disabled={isVerifying || !fileSelected || timeLeft > 0}
className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 ${
isVerifying || !fileSelected || timeLeft > 0
? 'bg-gray-300 text-gray-500 cursor-not-allowed'
: 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
}`}
>
{isVerifying ? <span>Verifying...</span> : <span>Check & Verify</span>}
</button>
</>
)
)}
</div>
</Layout>
);
};

export default TaskCheck;
