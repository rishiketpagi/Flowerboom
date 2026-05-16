/**
 * Authentication Helper Functions (Frontend-only)
 *
 * Auth state is persisted in localStorage for demo mode.
 */

const USERS_STORAGE_KEY = "flowerboom_users";
const CURRENT_USER_STORAGE_KEY = "flowerboom_user";

const safeReadJson = (key, fallback) => {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
};

const safeWriteJson = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
};

const emitAuthChange = (event, user) => {
    window.dispatchEvent(
        new CustomEvent("flowerboom-auth-changed", {
            detail: {
                event,
                session: user ? { user } : null,
            },
        })
    );
};

/**
 * Sign up a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {Object} metadata - Additional user metadata (name, etc.)
 * @returns {Promise<Object>} - User object and session
 */
export const signUpUser = async (email, password, metadata = {}) => {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const users = safeReadJson(USERS_STORAGE_KEY, []);

    if (!normalizedEmail || !password) {
        throw new Error("Email and password are required.");
    }

    const existingUser = users.find((user) => user.email === normalizedEmail);
    if (existingUser) {
        throw new Error("An account with this email already exists.");
    }

    const newUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        email: normalizedEmail,
        password,
        name: metadata.name || normalizedEmail.split("@")[0],
        createdAt: new Date().toISOString(),
    };

    safeWriteJson(USERS_STORAGE_KEY, [...users, newUser]);

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

/**
 * Sign in an existing user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - User object and session
 */
export const signInUser = async (email, password) => {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const users = safeReadJson(USERS_STORAGE_KEY, []);

    const matchedUser = users.find(
        (user) => user.email === normalizedEmail && user.password === password
    );

    if (!matchedUser) {
        throw new Error("Invalid email or password.");
    }

    const authUser = {
        id: matchedUser.id,
        email: matchedUser.email,
        name: matchedUser.name,
    };

    safeWriteJson(CURRENT_USER_STORAGE_KEY, authUser);
    emitAuthChange("SIGNED_IN", authUser);

    return {
        user: authUser,
        session: {
            user: authUser,
            access_token: "demo-token",
        },
        message: "Sign in successful!",
    };
};

/**
 * Sign out the current user
 * @returns {Promise<boolean>} - Success flag
 */
export const signOutUser = async () => {
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    emitAuthChange("SIGNED_OUT", null);
    return true;
};

/**
 * Get current authenticated session
 * @returns {Promise<Object|null>} - Session object or null
 */
export const getSession = async () => {
    const user = safeReadJson(CURRENT_USER_STORAGE_KEY, null);
    return user
        ? {
            user,
            access_token: "demo-token",
        }
        : null;
};

/**
 * Get current authenticated user
 * @returns {Promise<Object|null>} - User object or null
 */
export const getCurrentUser = async () => {
    return safeReadJson(CURRENT_USER_STORAGE_KEY, null);
};

/**
 * Send password reset email
 * @param {string} email - User email
 * @returns {Promise<boolean>} - Success flag
 */
export const resetPassword = async (email) => {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const users = safeReadJson(USERS_STORAGE_KEY, []);
    const exists = users.some((user) => user.email === normalizedEmail);
    if (!exists) {
        throw new Error("No account found with this email.");
    }
    return true;
};

/**
 * Update user password
 * @param {string} newPassword - New password
 * @returns {Promise<boolean>} - Success flag
 */
export const updatePassword = async (newPassword) => {
    const currentUser = safeReadJson(CURRENT_USER_STORAGE_KEY, null);
    if (!currentUser) {
        throw new Error("You must be signed in to update password.");
    }

    const users = safeReadJson(USERS_STORAGE_KEY, []);
    const updatedUsers = users.map((user) =>
        user.id === currentUser.id ? { ...user, password: newPassword } : user
    );
    safeWriteJson(USERS_STORAGE_KEY, updatedUsers);
    return true;
};

/**
 * Set up auth state listener
 * @param {Function} callback - Callback function to execute on auth state change
 * @returns {Function} - Unsubscribe function
 */
export const onAuthStateChange = (callback) => {
    const handler = (event) => {
        callback(event.detail.session, event.detail.event);
    };

    window.addEventListener("flowerboom-auth-changed", handler);

    return () => {
        window.removeEventListener("flowerboom-auth-changed", handler);
    };
};
