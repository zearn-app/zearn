import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Store } from '../services/store';
import { UserContext } from '../App';
import { useNotification } from '../components/NotificationSystem';
import { Mail, User, Lock, X, Loader2, Eye, EyeOff } from 'lucide-react';
import logo from '../components/logo.png';
const Login: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser } = useContext(UserContext);
  const { notify } = useNotification();

  const [viewState, setViewState] =
    useState<'landing' | 'manual_email' | 'register'>('landing');

  const [loading, setLoading] = useState(false);

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const STATE_DISTRICT_MAP: Record<string, string[]> = {
  "Andhra Pradesh": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", "Prakasam", "Srikakulam", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa"],
  
  "Arunachal Pradesh": ["Tawang", "West Kameng", "East Kameng", "Papum Pare", "Kurung Kumey", "Kra Daadi", "Lower Subansiri", "Upper Subansiri", "West Siang", "East Siang", "Siang", "Upper Siang", "Lower Siang", "Lower Dibang Valley", "Dibang Valley", "Anjaw", "Lohit", "Namsai", "Changlang", "Tirap", "Longding"],

  "Assam": ["Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo", "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao", "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup", "Kamrup Metropolitan", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon", "Nagaon", "Nalbari", "Sivasagar", "Sonitpur", "South Salmara", "Tinsukia", "Udalguri", "West Karbi Anglong"],

  "Bihar": ["Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"],

  "Tamil Nadu": [
    "Chennai", "Coimbatore", "Madurai", "Salem", "Tiruchirappalli",
    "Erode", "Tirunelveli", "Vellore", "Thanjavur", "Dindigul",
    "Kanchipuram", "Cuddalore", "Thoothukudi", "Namakkal",
    "Karur", "Nagapattinam", "Krishnagiri", "Dharmapuri",
    "Virudhunagar", "Sivaganga", "Ramanathapuram", "Nilgiris",
    "Perambalur", "Ariyalur", "Tenkasi", "Ranipet",
    "Tirupattur", "Chengalpattu", "Kallakurichi", "Mayiladuthurai"
  ],

  "Karnataka": [
    "Bangalore Urban", "Bangalore Rural", "Mysore", "Mangalore (Dakshina Kannada)",
    "Udupi", "Belgaum", "Hubli-Dharwad", "Gulbarga", "Bidar",
    "Raichur", "Bellary", "Tumkur", "Shimoga", "Chitradurga",
    "Davangere", "Hassan", "Kodagu", "Mandya", "Chamarajanagar",
    "Koppal", "Yadgir", "Bagalkot", "Gadag", "Haveri", "Vijayapura"
  ],

  "Kerala": [
    "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha",
    "Kottayam", "Idukki", "Ernakulam", "Thrissur",
    "Palakkad", "Malappuram", "Kozhikode", "Wayanad",
    "Kannur", "Kasaragod"
  ],

  "Maharashtra": [
    "Mumbai", "Mumbai Suburban", "Pune", "Nagpur", "Nashik",
    "Thane", "Aurangabad", "Solapur", "Kolhapur", "Satara",
    "Sangli", "Amravati", "Akola", "Yavatmal", "Buldhana",
    "Jalgaon", "Ahmednagar", "Beed", "Latur", "Osmanabad",
    "Nanded", "Parbhani", "Hingoli", "Wardha", "Chandrapur",
    "Gadchiroli", "Ratnagiri", "Sindhudurg", "Palghar",
    "Raigad", "Dhule", "Nandurbar"
  ],
"Gujarat": [
    "Ahmedabad","Amreli","Anand","Aravalli","Banaskantha","Bharuch",
    "Bhavnagar","Botad","Chhota Udaipur","Dahod","Dang","Devbhoomi Dwarka",
    "Gandhinagar","Gir Somnath","Jamnagar","Junagadh","Kheda",
    "Kutch","Mahisagar","Mehsana","Morbi","Narmada","Navsari",
    "Panchmahal","Patan","Porbandar","Rajkot","Sabarkantha",
    "Surat","Surendranagar","Tapi","Vadodara","Valsad"
  ],

  "Rajasthan": [
    "Ajmer","Alwar","Banswara","Baran","Barmer","Bharatpur","Bhilwara",
    "Bikaner","Bundi","Chittorgarh","Churu","Dausa","Dholpur","Dungarpur",
    "Hanumangarh","Jaipur","Jaisalmer","Jalore","Jhalawar","Jhunjhunu",
    "Jodhpur","Karauli","Kota","Nagaur","Pali","Pratapgarh",
    "Rajsamand","Sawai Madhopur","Sikar","Sirohi","Sri Ganganagar",
    "Tonk","Udaipur"
  ],

  "Uttar Pradesh": [
    "Agra","Aligarh","Allahabad","Ambedkar Nagar","Amethi","Amroha",
    "Auraiya","Azamgarh","Baghpat","Bahraich","Ballia","Balrampur",
    "Banda","Barabanki","Bareilly","Basti","Bhadohi","Bijnor",
    "Budaun","Bulandshahr","Chandauli","Chitrakoot","Deoria","Etah",
    "Etawah","Faizabad","Farrukhabad","Fatehpur","Firozabad",
    "Gautam Buddha Nagar","Ghaziabad","Ghazipur","Gonda","Gorakhpur",
    "Hamirpur","Hapur","Hardoi","Hathras","Jalaun","Jaunpur",
    "Jhansi","Kannauj","Kanpur Dehat","Kanpur Nagar","Kasganj",
    "Kaushambi","Kheri","Kushinagar","Lalitpur","Lucknow",
    "Maharajganj","Mahoba","Mainpuri","Mathura","Mau","Meerut",
    "Mirzapur","Moradabad","Muzaffarnagar","Pilibhit","Pratapgarh",
    "Raebareli","Rampur","Saharanpur","Sambhal","Sant Kabir Nagar",
    "Shahjahanpur","Shamli","Shravasti","Siddharthnagar","Sitapur",
    "Sonbhadra","Sultanpur","Unnao","Varanasi"
  ],

  "Madhya Pradesh": [
    "Agar Malwa","Alirajpur","Anuppur","Ashoknagar","Balaghat",
    "Barwani","Betul","Bhind","Bhopal","Burhanpur","Chhatarpur",
    "Chhindwara","Damoh","Datia","Dewas","Dhar","Dindori",
    "Guna","Gwalior","Harda","Hoshangabad","Indore","Jabalpur",
    "Jhabua","Katni","Khandwa","Khargone","Mandla","Mandsaur",
    "Morena","Narsinghpur","Neemuch","Panna","Raisen","Rajgarh",
    "Ratlam","Rewa","Sagar","Satna","Sehore","Seoni","Shahdol",
    "Shajapur","Sheopur","Shivpuri","Sidhi","Singrauli",
    "Tikamgarh","Ujjain","Umaria","Vidisha"
  ],

  "West Bengal": [
    "Alipurduar","Bankura","Birbhum","Cooch Behar","Dakshin Dinajpur",
    "Darjeeling","Hooghly","Howrah","Jalpaiguri","Jhargram",
    "Kalimpong","Kolkata","Malda","Murshidabad","Nadia",
    "North 24 Parganas","Paschim Bardhaman","Paschim Medinipur",
    "Purba Bardhaman","Purba Medinipur","Purulia",
    "South 24 Parganas","Uttar Dinajpur"
  ],

  "Punjab": [
    "Amritsar","Barnala","Bathinda","Faridkot","Fatehgarh Sahib",
    "Fazilka","Firozpur","Gurdaspur","Hoshiarpur","Jalandhar",
    "Kapurthala","Ludhiana","Mansa","Moga","Muktsar",
    "Nawanshahr","Pathankot","Patiala","Rupnagar","Sangrur",
    "Tarn Taran"
  ],

  "Haryana": [
    "Ambala","Bhiwani","Charkhi Dadri","Faridabad","Fatehabad",
    "Gurgaon","Hisar","Jhajjar","Jind","Kaithal","Karnal",
    "Kurukshetra","Mahendragarh","Nuh","Palwal","Panchkula",
    "Panipat","Rewari","Rohtak","Sirsa","Sonipat","Yamunanagar"
  ],

  "Odisha": [
    "Angul","Balangir","Balasore","Bargarh","Bhadrak","Boudh",
    "Cuttack","Deogarh","Dhenkanal","Gajapati","Ganjam",
    "Jagatsinghpur","Jajpur","Jharsuguda","Kalahandi",
    "Kandhamal","Kendrapara","Kendujhar","Khordha","Koraput",
    "Malkangiri","Mayurbhanj","Nabarangpur","Nayagarh",
    "Nuapada","Puri","Rayagada","Sambalpur","Subarnapur",
    "Sundargarh"
  ],

  "Jharkhand": [
    "Bokaro","Chatra","Deoghar","Dhanbad","Dumka","East Singhbhum",
    "Garhwa","Giridih","Godda","Gumla","Hazaribagh",
    "Jamtara","Khunti","Koderma","Latehar","Lohardaga",
    "Pakur","Palamu","Ramgarh","Ranchi","Sahebganj",
    "Seraikela Kharsawan","Simdega","West Singhbhum"
  ],

  "Chhattisgarh": [
    "Balod","Baloda Bazar","Balrampur","Bastar","Bemetara",
    "Bijapur","Bilaspur","Dantewada","Dhamtari","Durg",
    "Gariaband","Janjgir Champa","Jashpur","Kabirdham",
    "Kanker","Kondagaon","Korba","Korea","Mahasamund",
    "Mungeli","Narayanpur","Raigarh","Raipur","Rajnandgaon",
    "Sukma","Surajpur","Surguja"
  ],

  "Uttarakhand": [
    "Almora","Bageshwar","Chamoli","Champawat","Dehradun",
    "Haridwar","Nainital","Pauri Garhwal","Pithoragarh",
    "Rudraprayag","Tehri Garhwal","Udham Singh Nagar","Uttarkashi"
  ],

  "Himachal Pradesh": [
    "Bilaspur","Chamba","Hamirpur","Kangra","Kinnaur",
    "Kullu","Lahaul and Spiti","Mandi","Shimla","Sirmaur",
    "Solan","Una"
  ],

  "Goa": [
    "North Goa","South Goa"
  ],

  "Sikkim": [
    "East Sikkim","North Sikkim","South Sikkim","West Sikkim"
  ],

  "Telangana": [
    "Adilabad","Bhadradri Kothagudem","Hyderabad","Jagtial",
    "Jangaon","Jayashankar Bhupalpally","Jogulamba Gadwal",
    "Kamareddy","Karimnagar","Khammam","Komaram Bheem",
    "Mahabubabad","Mahabubnagar","Mancherial","Medak",
    "Medchal","Nagarkurnool","Nalgonda","Nirmal","Nizamabad",
    "Peddapalli","Rajanna Sircilla","Rangareddy","Sangareddy",
    "Siddipet","Suryapet","Vikarabad","Wanaparthy",
    "Warangal Rural","Warangal Urban","Yadadri Bhuvanagiri"
  ]
  // 👉 Continue for all states...
};
  const [formData, setFormData] = useState({
  name: '',
  mobile: '',
  dob: '',
  state: '',
  district: '',
  password: '',
  country: 'India'
});
  /* ================= ADMIN MULTI TAP LOGIC ================= */

  const [tapCount, setTapCount] = useState(0);
  const [tapTarget, setTapTarget] = useState(5);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [adminPass, setAdminPass] = useState('');

  useEffect(() => {
    Store.getSettings().then((s) => {
      if (s.tapCount) setTapTarget(s.tapCount);
    });
  }, []);

  const handleLogoTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);

    if (newCount >= tapTarget) {
      setShowAdminDialog(true);
      setTapCount(0);
    }
  };

 const handleAdminLogin = async () => {
  if (!adminPass) {
    notify("Enter Admin Password", "error");
    return;
  }

  setLoading(true);

  try {
    const res = await Store.adminLogin(adminPass); // 🔥 call backend

    if (!res?.success) {
      notify("Invalid Admin Password", "error");
      return;
    }

    notify("Welcome Admin 🚀", "success");
    setShowAdminDialog(false);
    setAdminPass("");

    navigate("/admin", { replace: true });

  } catch (e) {
    notify("Admin Login Failed", "error");
  } finally {
    setLoading(false);
  }
};
  /* ================= EMAIL LOGIN ================= */

  const processEmailLogin = async () => {
    if (!email) {
      notify("Please enter valid email", "error");
      return;
    }

    setLoading(true);

    try {
      const existingUser = await Store.checkUserExists(email);

      if (existingUser) {
        if (existingUser.password !== password) {
          notify("Incorrect Password", "error");
          setLoading(false);
          return;
        }

        await Store.loginUser(existingUser);
        await refreshUser();
        notify(`Welcome back, ${existingUser.name}!`, "success");

        if (existingUser.isAdmin === true) {
          navigate("/admin", { replace: true });
        } else {
          navigate("/home", { replace: true });
        }

      } else {
        setViewState('register');
        notify("New account! Complete profile.", "info");
      }
    } catch (e) {
      notify("Connection error", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ================= REGISTER ================= */

  const handleRegister = async () => {
    const { name, mobile, dob, district, password } = formData;
    const errors: string[] = [];

    if (!email) errors.push('Valid email');
    if (!name) errors.push('Full name');
    if (!/^\d{10}$/.test(mobile)) errors.push('10-digit mobile');

    if (!password) {
      errors.push('Password');
    } else {
      if (!/[A-Za-z]/.test(password)) errors.push('Password must contain letter');
      if (!/[0-9]/.test(password)) errors.push('Password must contain number');
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
        errors.push('Password must contain special character');
    }

    if (!dob) errors.push('Date of birth');
    if (!formData.state) errors.push('State');
    if (!district) errors.push('District');
    if (errors.length > 0) {
      notify(`Please provide: ${errors.join(', ')}`, 'error');
      return;
    }

    setLoading(true);

    try {
      const registeredUser = await Store.registerUser({
        email,
        ...formData
      });

      await Store.loginUser(registeredUser);
      await refreshUser();
      notify("Registration Successful!", "success");
      navigate("/home", { replace: true });
    } catch (e) {
      notify("Registration Failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout noPadding>
      <div className="min-h-screen bg-white flex flex-col relative overflow-hidden dark:bg-gray-900 transition-colors">
        {showAdminDialog && (
  <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-80 shadow-2xl relative">

      <button
        onClick={() => setShowAdminDialog(false)}
        className="absolute top-3 right-3"
      >
        <X size={20} />
      </button>

      <h2 className="text-lg font-bold mb-4 text-center dark:text-white">
        Admin Login
      </h2>

      <input
        type="password"
        placeholder="Enter Admin Password"
        className="w-full p-3 border rounded-xl mb-4"
        value={adminPass}
        onChange={(e) => setAdminPass(e.target.value)}
      />

      <button
        onClick={handleAdminLogin}
        disabled={loading}
        className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl"
      >
        {loading ? <Loader2 className="animate-spin mx-auto" /> : "Login"}
      </button>
    </div>
  </div>
)}
        {/* ================= REGISTER PAGE UI ================= */}
        {viewState === 'register' && (
          <div className="flex-1 flex flex-col justify-center items-center p-8">
            <div className="w-full max-w-sm space-y-4">

              <h2 className="text-2xl font-bold text-center dark:text-white">
                Complete Your Profile
              </h2>

              <input
                type="text"
                placeholder="Full Name"
                className="w-full p-4 border rounded-xl"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />

              <input
                type="text"
                placeholder="Mobile (10 digits)"
                className="w-full p-4 border rounded-xl"
                value={formData.mobile}
                onChange={(e) =>
                  setFormData({ ...formData, mobile: e.target.value })
                }
              />

              <input
                type="date"
                className="w-full p-4 border rounded-xl"
                value={formData.dob}
                onChange={(e) =>
                  setFormData({ ...formData, dob: e.target.value })
                }
              />

              {/* STATE SELECT */}
<select
  className="w-full p-4 border rounded-xl"
  value={formData.state}
  onChange={(e) =>
    setFormData({
      ...formData,
      state: e.target.value,
      district: "" // reset district
    })
  }
>
  <option value="">Select State</option>
  {Object.keys(STATE_DISTRICT_MAP).map((state) => (
    <option key={state} value={state}>
      {state}
    </option>
  ))}
</select>

{/* DISTRICT SELECT */}
<select
  className="w-full p-4 border rounded-xl"
  value={formData.district}
  disabled={!formData.state}
  onChange={(e) =>
    setFormData({ ...formData, district: e.target.value })
  }
>
  <option value="">
    {formData.state ? "Select District" : "Select State First"}
  </option>

  {formData.state &&
    STATE_DISTRICT_MAP[formData.state].map((district) => (
      <option key={district} value={district}>
        {district}
      </option>
    ))}
</select>
              <div className="relative">
                <input
                  type={showRegisterPassword ? "text" : "password"}
                  placeholder="Create Password"
                  className="w-full p-4 border rounded-xl pr-12"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowRegisterPassword(!showRegisterPassword)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  {showRegisterPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <button
                onClick={handleRegister}
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" /> : "Register"}
              </button>

              <button
                onClick={() => setViewState('landing')}
                className="w-full text-sm text-gray-500 underline"
              >
                Back to Login
              </button>

            </div>
          </div>
        )}
        {/* ================= END REGISTER UI ================= */}

        {viewState === 'landing' && (
  <div className="flex-1 flex flex-col items-center justify-center p-8">

    <div className="flex-1 flex flex-col items-center justify-center w-full select-none">
      <div
  onClick={handleLogoTap}
  className="w-28 h-28 rounded-3xl overflow-hidden shadow-2xl mb-8 cursor-pointer active:scale-95 transition-transform"
>
  <img
    src={logo}
    alt="Zearning Logo"
    className="w-full h-full object-contain"
  />
</div>

      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Zearn App
      </h1>
      <p className="text-gray-500 dark:text-gray-400 text-center max-w-xs">
        Complete tasks, earn coins, and withdraw real rewards instantly.
      </p>
    </div>

    <div className="w-full max-w-sm mb-12 space-y-4">

      <input
        type="email"
        placeholder="Email"
        className="w-full p-4 border rounded-xl"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <div className="relative">
        <input
          type={showLoginPassword ? "text" : "password"}
          placeholder="Password"
          className="w-full p-4 border rounded-xl pr-12"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setShowLoginPassword(!showLoginPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2"
        >
          {showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      <button
        onClick={processEmailLogin}
        disabled={loading}
        className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl"
      >
        {loading ? <Loader2 className="animate-spin mx-auto" /> : "Login"}
      </button>
    </div>
  </div>
)}

      </div>
    </Layout>
  );
};

export default Login;
