# FlowerBoom Architecture & Data Flow

## Overview

FlowerBoom is a **frontend-only React application** that uses browser `localStorage` for all data persistence. No backend server or external database is required.

---

## Core Data Flow: Sign Up to localStorage

### Complete Process Flow

```
User fills form → Clicks "Sign Up" button → React state updates → handleSubmit() triggered
    ↓
Form validation (password match check)
    ↓
signUpUser() function called with (email, password, metadata)
    ↓
authHelpers.js processes:
  1. Read existing users from localStorage ("flowerboom_users")
  2. Check if email already exists
  3. Create new user object with unique ID
  4. Save all users back to localStorage
    ↓
Success message returned to component
    ↓
Redirect to Sign In page after 1.5 seconds
```

### Step-by-Step Breakdown

#### 1. Frontend Component (SignUp.jsx)

**File**: `src/Components/SignUp.jsx`

```javascript
// Import the auth function
import { signUpUser } from "../services/authHelpers";

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
        // Validate passwords match
        if (formdata.password !== formdata.confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        
        // CALL AUTH FUNCTION with form data
        const result = await signUpUser(
            formdata.email,
            formdata.password,
            { name: formdata.name }
        );
        
        // Show success message
        setMessage(result.message);
        
        // Redirect to signin
        setTimeout(() => navigate("/signin"), 1500);
    } catch (error) {
        setError(error.message);
    } finally {
        setLoading(false);
    }
};
```

**Key Points:**
- Form data stored in `formdata` state
- `handleSubmit()` fires on button click
- Calls `signUpUser()` with email, password, and name
- Waits for response with `await`
- Handles success/error with messages

---

#### 2. Auth Helper Function (authHelpers.js)

**File**: `src/services/authHelpers.js`

```javascript
// Storage key constants
const USERS_STORAGE_KEY = "flowerboom_users";
const CURRENT_USER_STORAGE_KEY = "flowerboom_user";

// Helper to safely read JSON from localStorage
const safeReadJson = (key, fallback) => {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
};

// Helper to safely write JSON to localStorage
const safeWriteJson = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
};

// Main signup function
export const signUpUser = async (email, password, metadata = {}) => {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    
    // READ: Get all existing users from localStorage
    const users = safeReadJson(USERS_STORAGE_KEY, []);
    
    // VALIDATE: Check if email already exists
    const existingUser = users.find((user) => user.email === normalizedEmail);
    if (existingUser) {
        throw new Error("An account with this email already exists.");
    }
    
    // CREATE: New user object
    const newUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        email: normalizedEmail,
        password,
        name: metadata.name || normalizedEmail.split("@")[0],
        createdAt: new Date().toISOString(),
    };
    
    // WRITE: Save all users (including new one) to localStorage
    safeWriteJson(USERS_STORAGE_KEY, [...users, newUser]);
    
    // RETURN: Success response
    return {
        user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
        },
        session: null,
        message: "Sign up successful! Please sign in.",
    };
};
```

**Key Points:**
- Reads from localStorage with `safeReadJson()`
- Validates email is unique
- Creates user object with timestamp
- **Writes back to localStorage** with `safeWriteJson()`
- Returns new user data to component

---

#### 3. Browser localStorage Storage

**What gets stored:**

```javascript
// localStorage["flowerboom_users"] contains:
[
  {
    id: "user_1715877234123_abc123",
    email: "user@example.com",
    password: "hashedPassword123",
    name: "John Doe",
    createdAt: "2026-05-16T10:20:34.123Z"
  },
  {
    id: "user_1715877334456_def456",
    email: "jane@example.com",
    password: "hashedPassword456",
    name: "Jane Smith",
    createdAt: "2026-05-16T10:22:14.456Z"
  }
]
```

**How to inspect in browser:**
1. Open DevTools (F12)
2. Go to "Application" tab
3. Click "Local Storage"
4. Look for `flowerboom_users` key

---

## Connection Points: How It All Connects

### Import Chain
```
SignUp.jsx
    ↓
imports signUpUser from authHelpers.js
    ↓
authHelpers.js
    ↓
uses localStorage API (built-in browser API)
```

### Function Call Chain
```
handleSubmit() in SignUp.jsx
    ↓ calls
signUpUser() in authHelpers.js
    ↓ which calls
safeReadJson() and safeWriteJson()
    ↓ which call
localStorage.getItem() and localStorage.setItem()
```

---

## All localStorage Keys

| Key | Purpose | Data Type | Example |
|-----|---------|-----------|---------|
| `flowerboom_users` | All registered users | Array of user objects | `[{id, email, password, name, createdAt}]` |
| `flowerboom_user` | Currently logged-in user | User object | `{id, email, name}` |
| `flowerboom_cart` | Shopping cart items | Array of products | `[{id, name, price, quantity}]` |
| `flowerboom_orders` | User's order history | Array of orders | `[{id, items, total, status, date}]` |

---

## Other Related Flows

### Sign In Flow
**File**: `src/Components/SignIn.jsx` + `authHelpers.js`

```javascript
signInUser(email, password) {
  1. Read all users from localStorage
  2. Find user matching email AND password
  3. Save current user to "flowerboom_user"
  4. Emit auth change event
  5. Return success
}
```

### Cart Management
**File**: `src/hooks/useCart.js`

```javascript
addToCart(item) {
  1. Read cart from localStorage ("flowerboom_cart")
  2. Add new item or increase quantity
  3. Save updated cart back to localStorage
  4. Emit cartUpdated event
}
```

### Order Creation
**File**: `src/services/databaseHelpers.js`

```javascript
createOrder(userId, items, totalAmount) {
  1. Create order object with ID and timestamp
  2. Read all orders from localStorage
  3. Add new order to array
  4. Save updated orders back to localStorage
  5. Return order confirmation
}
```

---

## Component Dependencies

```
SignUp.jsx
  ├── imports: signUpUser from authHelpers.js
  └── uses: useState, useNavigate from React

SignIn.jsx
  ├── imports: signInUser from authHelpers.js
  └── uses: useState, useNavigate from React

Gallery.jsx
  ├── imports: fetchFlowers, searchFlowers from databaseHelpers.js
  └── imports: useCart hook

Cart.jsx
  ├── imports: createOrder from databaseHelpers.js
  ├── imports: useAuth hook
  └── imports: useCart hook

Navbar.jsx
  ├── imports: useAuth hook
  ├── imports: signOutUser from authHelpers.js
  └── imports: useCart hook

ProtectedRoute.jsx
  └── imports: useAuth hook
```

---

## Data Persistence Architecture

```
┌─────────────────────────────────────────┐
│         React Components                │
│  (SignUp, SignIn, Cart, Gallery, etc)   │
└────────────┬────────────────────────────┘
             │
             │ import & call functions
             ↓
┌─────────────────────────────────────────┐
│     Helper Functions (Services)         │
│  authHelpers.js                         │
│  databaseHelpers.js                     │
└────────────┬────────────────────────────┘
             │
             │ read/write using
             ↓
┌─────────────────────────────────────────┐
│       Browser localStorage API          │
│  localStorage.getItem()                 │
│  localStorage.setItem()                 │
└────────────┬────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────┐
│   Browser's Local Storage Database      │
│   (Persistent across page reloads)      │
└─────────────────────────────────────────┘
```

---

## Why This Architecture?

✅ **No backend needed** - Runs entirely in the browser  
✅ **Demo-friendly** - Works offline, no server setup  
✅ **Data persists** - localStorage survives page reloads  
✅ **Fast** - No network latency for data operations  
✅ **Secure for demo** - Passwords stored locally (NOT production-safe)  
✅ **Easy to understand** - Simple flow, no complex backend logic  

---

## Important Notes

⚠️ **This is a DEMO only** - Not suitable for production:
- Passwords stored in plain text (should be hashed)
- No authentication tokens or sessions
- Data visible in browser DevTools
- No real security validation
- All data lost if localStorage is cleared

For production, replace with:
- Real backend API (Node.js, Python, etc.)
- Secure password hashing (bcrypt)
- JWT authentication
- Real database (PostgreSQL, MongoDB, etc.)
- HTTPS + secure headers

---

## Testing the Flow

1. **Open DevTools** (F12)
2. **Go to Application → Local Storage**
3. **Fill SignUp form** and click "Sign Up"
4. **Watch** `flowerboom_users` key get created/updated
5. **Inspect** the stored data in JSON format
6. **Reload page** - data persists!
7. **Try to sign up** with same email - error shows
8. **Sign In** with your credentials
9. **Watch** `flowerboom_user` key get created
10. **Add items to cart** - watch `flowerboom_cart` update

