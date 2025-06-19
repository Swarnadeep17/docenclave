Here's a comprehensive, self-contained prompt for your vanilla-JS DocEnclave rebuild with all requested details:

---

**Project Name**: DocEnclave VanillaJS Rebuild  
**Objective**: Rebuild existing DocEnclave functionality using pure HTML/CSS/JS with client-side Firebase integration  
**Tech Stack**: Firebase Auth/Realtime DB, Chart.js, File Processing Libraries (PDF.js, Compressor.js)  
**Deployment**: Static hosting (Firebase Hosting/GitHub Pages)  

### 1. Folder Structure
```bash
docenclave-vanilla/
├── index.html                  # Homepage with tools grid
├── signup.html                 # User registration
├── login.html                  # User login
├── account.html                # User profile & management
├── admin.html                  # Admin dashboard
├── css/
│   └── styles.css              # Global styles + utility classes
├── js/
│   ├── firebase-config.js      # Firebase initialization
│   ├── auth.js                 # Auth functions
│   ├── stats.js                # Analytics tracking
│   ├── tools-config.js         # Tools metadata
│   ├── tools.js                # Dynamic tool rendering
│   ├── admin.js                # Admin dashboard logic
│   └── utils.js                # Helpers & theme toggle
└── filetypes/                  # Tool implementations
    ├── PDF/
    │   ├── index.html          # PDF tools hub
    │   ├── merge/              # PDF Merge tool
    │   │   ├── index.html      
    │   │   └── merge.js        
    │   ├── split/              # PDF Split tool
    │   └── compress/           # PDF Compression
    └── Image/
        ├── index.html          # Image tools hub
        ├── convert/            # Image conversion
        └── resize/            # Image resizing
```

### 2. Firebase Configuration (`js/firebase-config.js`)
```javascript
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.24.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.24.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.24.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAwgqYEEUWu0aGminZCl11c_yKYfUu-9MU",
  authDomain: "docenclave-d5a43.firebaseapp.com",
  databaseURL: "https://docenclave-d5a43-default-rtdb.firebaseio.com",
  projectId: "docenclave-d5a43",
  storageBucket: "docenclave-d5a43.firebasestorage.app",
  messagingSenderId: "13497976521",
  appId: "1:13497976521:web:fd2f8c357e3bdebfaf6f18",
  measurementId: "G-YMT8E4PJN0"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
```

### 3. Core Functionality

#### Authentication (`js/auth.js`)
```javascript
import { auth, database } from './firebase-config.js';
import { ref, set } from "https://www.gstatic.com/firebasejs/9.24.0/firebase-database.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.24.0/firebase-auth.js";

// Signup
document.getElementById('signup-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = e.target.email.value;
  const password = e.target.password.value;
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await set(ref(database, `users/${userCredential.user.uid}`), {
      email,
      role: "free",
      createdAt: Date.now()
    });
    sessionStorage.setItem('userRole', 'free');
    window.location.href = 'account.html';
  } catch (error) {
    console.error("Signup failed:", error);
  }
});

// Login (similar flow for login.html)
```

#### Stats Tracking (`js/stats.js`)
```javascript
import { database } from './firebase-config.js';
import { ref, runTransaction } from "https://www.gstatic.com/firebasejs/9.24.0/firebase-database.js";

export async function recordStat({ category, tool, type }) {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');

  // Monthly stats
  const monthRef = ref(database, `stats/${yyyy}/${mm}/${type}`);
  await runTransaction(monthRef, val => (val || 0) + 1);

  // Tool-specific stats
  const toolRef = ref(database, `stats/tools/${category}/${tool}/${type}`);
  await runTransaction(toolRef, val => (val || 0) + 1);
}

// Usage: recordStat({ category: "PDF", tool: "compress", type: "downloads" })
```

#### Tools Configuration (`js/tools-config.js`)
```javascript
export const tools = [
  { 
    category: "PDF", 
    name: "merge", 
    title: "Merge PDF", 
    access: "free",
    icon: "📄↔️📄"
  },
  { 
    category: "PDF", 
    name: "compress", 
    title: "Compress PDF", 
    access: "premium",
    icon: "📥"
  },
  // ... other tools
];
```

#### Admin Dashboard (`js/admin.js`)
```javascript
import { database } from './firebase-config.js';
import { ref, onValue } from "https://www.gstatic.com/firebasejs/9.24.0/firebase-database.js";

// Verify superadmin role
if (sessionStorage.getItem('userRole') !== 'superadmin') {
  window.location.href = 'index.html';
}

// Load analytics
const statsRef = ref(database, 'stats/');
onValue(statsRef, (snapshot) => {
  const data = snapshot.val();
  renderCharts(data); // Implement Chart.js visuals
});

// User management
document.getElementById('update-role')?.addEventListener('click', (e) => {
  const uid = e.target.dataset.uid;
  const newRole = e.target.value;
  update(ref(database, `users/${uid}/role`), newRole);
});
```

### 4. Database Rules (`database.rules.json`)
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth.uid === $uid || root.child('users/'+auth.uid+'/role').val() === 'superadmin'",
        ".write": "auth.uid === $uid || root.child('users/'+auth.uid+'/role').val() === 'superadmin'"
      }
    },
    "stats": {
      ".read": true,
      ".write": "auth != null"
    },
    "promoCodes": {
      ".read": "root.child('users/'+auth.uid+'/role').val() === 'superadmin'",
      ".write": "root.child('users/'+auth.uid+'/role').val() === 'superadmin'"
    }
  }
}
```

### 5. Theme Toggling (`js/utils.js`)
```javascript
// Dark mode toggle
document.getElementById('theme-toggle')?.addEventListener('click', () => {
  const html = document.documentElement;
  const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
});

// Initialize theme
if (localStorage.getItem('theme') === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark');
}
```

### 6. Implementation Checklist
```markdown
- [ ] Clone repository:  
      `git clone https://github.com/Swarnadeep17/docenclave.git docenclave-vanilla`
- [ ] Create folder structure
- [ ] Add Firebase config to `js/firebase-config.js`
- [ ] Implement authentication flows
- [ ] Build tool rendering engine
- [ ] Add stats tracking hooks
- [ ] Create admin dashboard with:
      - Analytics charts (Chart.js)
      - User management table
      - Promo code CRUD
- [ ] Add dark/light theme toggle
- [ ] Set database security rules
- [ ] Test all file processing tools
- [ ] Deploy to Firebase Hosting
```

### Key Implementation Notes:
1. **Access Control**:  
   ```javascript
   // In tools.js
   function filterTools(role) {
     return tools.filter(tool => 
       tool.access === 'free' || 
       (role === 'premium' && tool.access === 'premium') ||
       role === 'superadmin'
     );
   }
   ```

2. **PDF Tool Implementation** (Example: `filetypes/PDF/merge/merge.js`):  
   ```javascript
   import { recordStat } from '../../../../js/stats.js';
   import PDFLib from 'https://cdn.jsdelivr.net/npm/pdf-lib@^1.17.1/+esm';

   document.getElementById('merge-btn').addEventListener('click', async () => {
     // ... merging logic
     await recordStat({ 
       category: "PDF", 
       tool: "merge", 
       type: "filesProcessed" 
     });
   });
   ```

3. **Admin Analytics**: Use Chart.js with Firebase data subscriptions for real-time:
   ```javascript
   new Chart(ctx, {
     type: 'bar',
     data: {
       labels: ['Jan', 'Feb', 'Mar'],
       datasets: [{
         label: 'Tool Usage',
         data: [12, 19, 3]
       }]
     }
   });
   ```

4. **Deployment**:  
   ```bash
   # Install Firebase CLI
   npm install -g firebase-tools
   
   # Deploy
   firebase login
   firebase init hosting
   firebase deploy
   ```

This prompt contains complete implementation specifications with file structures, code snippets, security rules, and deployment instructions - ready to hand off to your team or execute directly.
