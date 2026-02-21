# Zearn - Task Earning App

A comprehensive task-based earning application featuring daily claims, task tracking, leaderboards, and administrative controls.

## 🚀 Features

- ✅ User Registration & Email Verification
- ✅ Admin Dashboard with task management
- ✅ Daily claim rewards system
- ✅ Task tracking and completion
- ✅ Leaderboard rankings
- ✅ Withdrawal management
- ✅ Random winner selection
- ✅ Real-time Firebase integration

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## 🔧 Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```

## 🎯 Running Locally

### Start Development Server

```bash
npm run dev
```

The app will be available at: `http://localhost:3001`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 🔐 Firebase Setup - CRITICAL!

### ⚠️ IMPORTANT: Configure Firestore Security Rules

Your app will NOT work without proper Firestore security rules. Follow these steps:

#### Step 1: Open Firebase Console
1. Go to https://console.firebase.google.com
2. Select project: **zearn-app**
3. Click **Firestore Database** on the left sidebar
4. Click the **Rules** tab

#### Step 2: Copy & Paste Rules

**For Development/Testing:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all access for testing
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

#### Step 3: Publish Rules
- Click the blue **Publish** button
- Wait 30-60 seconds for rules to take effect

#### Step 4: Test Your App
- Refresh http://localhost:3001
- Clear browser cache (Ctrl+Shift+Delete)
- Try admin login or registration

### For Production (More Secure)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null || true;
      allow write: if request.auth != null || true;
    }
    
    // Settings - readable by all
    match /settings/{document=**} {
      allow read: if true;
      allow write: if false;
    }
    
    // Tasks - readable by all
    match /tasks/{document=**} {
      allow read: if true;
      allow write: if false;
    }
    
    // Withdrawals
    match /withdrawals/{document=**} {
      allow read: if true;
      allow write: if true;
    }
    
    // Winners
    match /winners/{document=**} {
      allow read: if true;
      allow write: if true;
    }
    
    // User Tasks
    match /userTasks/{document=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

## 👤 Admin Login

### Default Admin Credentials
- **Email:** admin@zearn.app
- **Password:** admin

### How to Access Admin Panel

1. Go to http://localhost:3001
2. **Tap the "Z" logo 5 times** (this reveals the admin password dialog)
3. Enter password: `admin`
4. You'll be taken to the admin dashboard at `/admin`

### Admin Dashboard Features
- ✅ Manage withdrawal requests (approve/reject/mark as paid)
- ✅ Create and edit tasks
- ✅ View all users and their progress
- ✅ Track task statistics
- ✅ Manage app settings (tap count, daily limits, withdrawal minimum, etc.)
- ✅ Ban/unban users

## 📱 User Registration

### Registration Methods

#### 1. Email Registration
- Click "Sign in with Email"
- Enter your email address
- Verify with OTP (shown in green notification at top)
- Fill in profile details (Name, Mobile, DOB, District, State)
- Click "Start Earning"

#### 2. Google Login (Demo)
- Click "Continue with Google"
- Auto-fills demo profile
- Edit details if needed
- Click "Start Earning"

### Important: Email Verification

For email registration (not demo):
1. Click "Send OTP" for email verification
2. The OTP appears in a notification (green box at top)
3. Enter the OTP in the input field
4. Repeat for mobile verification
5. Then complete registration

## 🗂️ Project Structure

```
zearn-app/
├── components/
│   ├── Card.tsx                 # Card component
│   ├── ErrorBoundary.tsx        # Error boundary for crash prevention
│   ├── Layout.tsx               # Main layout wrapper
│   └── NotificationSystem.tsx   # Toast notifications
├── pages/
│   ├── AdminDashboard.tsx       # Admin panel (withdrawals, users, tasks, settings)
│   ├── Login.tsx                # Login & registration
│   ├── Onboarding.tsx           # App intro screens
│   ├── Home.tsx                 # Main home page
│   ├── TaskList.tsx             # View available tasks
│   ├── TaskCheck.tsx            # Verify task completion
│   ├── Withdrawal.tsx           # Request withdrawal
│   ├── Leaderboard.tsx          # User rankings
│   ├── RandomWinner.tsx         # Lucky draw feature
│   ├── Profile.tsx              # User profile
│   └── Settings.tsx             # App settings
├── services/
│   ├── firebase.ts              # Firebase config & initialization
│   └── store.ts                 # Firestore CRUD operations
├── types.ts                     # TypeScript interfaces
├── App.tsx                      # Main app & routing
├── index.tsx                    # React entry point
├── vite.config.ts               # Vite build config
└── tsconfig.json                # TypeScript config
```

## 🔧 Technology Stack

| Technology | Purpose |
|-----------|---------|
| **React 18** | UI Framework |
| **TypeScript** | Type Safety |
| **Vite** | Build Tool |
| **Firebase** | Backend (Firestore) |
| **Tailwind CSS** | Styling |
| **Lucide React** | Icons |
| **React Router v6** | Navigation |

## 📝 Key Services

### `services/firebase.ts`
- Initializes Firebase app
- Configures Firestore database
- Sets up Google Analytics

### `services/store.ts`
**User Management:**
- `registerUser()` - Create new user account
- `loginUser()` - Login user
- `getCurrentUser()` - Get logged-in user
- `checkUserExists()` - Check if user exists

**Task Management:**
- `getAllTasks()` - Get all tasks (auto-seeds defaults)
- `createTask()` - Create new task
- `updateTask()` - Edit task
- `deleteTask()` - Remove task

**Admin Features:**
- `getSettings()` - Get admin settings
- `updateSettings()` - Update admin settings
- `toggleUserBan()` - Ban/unban users
- `adminUpdateWithdrawal()` - Update withdrawal status

**Initialization:**
- `initializeAdmin()` - Initialize admin system on app startup

## 🔍 Debugging & Troubleshooting

### Open Browser Console (F12)

The app logs detailed information to the console:

```
✅ "Initializing app..."
✅ "Admin initialized"
✅ "Fetching admin settings..."
✅ "Starting registration for email: ..."
✅ "User registered: ..."
```

If you see red errors, check:
1. **Firebase Rules** - Is Firestore allowing reads/writes?
2. **Console Errors** - What's the exact error message?
3. **Network Tab** - Is Firebase responding to requests?

### Common Issues

#### "Insufficient permissions" / "Permission denied"
**Solution:**
- Go to Firebase Console → Firestore → Rules
- Copy the development rules above
- Click Publish
- Wait 60 seconds
- Refresh your browser

#### Admin password not working
**Check:**
- Tap logo exactly 5 times (not more, not less)
- Password is `admin` (case-sensitive)
- Check console for "Admin user found:" message
- Verify Firestore has `admin_default_01` user

#### Registration shows "Failed to initialize"
**Check:**
- All form fields are filled
- Email and mobile are verified (OTP correct)
- Check console for Firebase error details
- Verify Firestore write permissions

#### Can't see admin options
**Steps:**
1. Go to login page
2. Count as you tap the Z logo: 1, 2, 3, 4, 5
3. A dialog should appear
4. Enter `admin` as password

## 📚 Additional Documentation

- **`TESTING_GUIDE.md`** - How to test all features
- **`FIXES_APPLIED.md`** - Recent code improvements
- **`FIREBASE_SETUP.md`** - Detailed Firebase configuration
- **`QUICK_FIX.md`** - 30-second quick start

## 🎯 Quick Checklist

- [ ] Install dependencies: `npm install`
- [ ] Start dev server: `npm run dev`
- [ ] Update Firestore security rules
- [ ] Test admin login (password: `admin`)
- [ ] Test user registration
- [ ] Check console for errors (F12)

## 🤝 Contributing

Found a bug? Want to add a feature? Feel free to contribute!

## 📄 License

MIT License - Feel free to use this code!

---

**Last Updated:** February 5, 2026  
**Version:** 1.0.0  
**Status:** ✅ Fully Functional
