/**
 * Frontend-only Database Helpers
 *
 * Uses local mock arrays and localStorage persistence.
 */

const ORDERS_STORAGE_KEY = "flowerboom_orders";
const PROFILES_STORAGE_KEY = "flowerboom_profiles";

const MOCK_FLOWERS = [
    {
        id: "flr_rose_red",
        name: "Red Rose Bouquet",
        description: "Classic bouquet of fresh red roses.",
        price: 799,
        category: "Bouquets",
        image: "https://images.pexels.com/photos/56866/garden-rose-red-pink-56866.jpeg?auto=compress&cs=tinysrgb&w=1200",
    },
    {
        id: "flr_lily_white",
        name: "White Lily Basket",
        description: "Elegant white lilies arranged in a premium basket.",
        price: 999,
        category: "Basket",
        image: "https://images.pexels.com/photos/931176/pexels-photo-931176.jpeg?auto=compress&cs=tinysrgb&w=1200",
    },
    {
        id: "flr_tulip_mix",
        name: "Mixed Tulips",
        description: "Vibrant tulips perfect for celebrations.",
        price: 649,
        category: "Seasonal",
        image: "https://images.pexels.com/photos/15239/flower-tulip-garden-purple.jpg?auto=compress&cs=tinysrgb&w=1200",
    },
    {
        id: "flr_orchid_pink",
        name: "Pink Orchid Charm",
        description: "Graceful pink orchids with soft wrapping.",
        price: 1199,
        category: "Premium",
        image: "https://images.pexels.com/photos/132474/pexels-photo-132474.jpeg?auto=compress&cs=tinysrgb&w=1200",
    },
    {
        id: "flr_sunflower",
        name: "Sunflower Smile",
        description: "Bright and cheerful sunflower bunch.",
        price: 549,
        category: "Bouquets",
        image: "https://images.pexels.com/photos/33044/sunflower-sun-summer-yellow.jpg?auto=compress&cs=tinysrgb&w=1200",
    },
    {
        id: "flr_carnation",
        name: "Carnation Delight",
        description: "Pastel carnations for every occasion.",
        price: 599,
        category: "Bouquets",
        image: "https://images.pexels.com/photos/1624076/pexels-photo-1624076.jpeg?auto=compress&cs=tinysrgb&w=1200",
    },
    {
        id: "flr_mixed_box",
        name: "Bloom Gift Box",
        description: "Curated mixed flowers in a gift-ready box.",
        price: 1299,
        category: "Gift Box",
        image: "https://images.pexels.com/photos/2300713/pexels-photo-2300713.jpeg?auto=compress&cs=tinysrgb&w=1200",
    },
    {
        id: "flr_daisy",
        name: "Daisy Fresh",
        description: "Simple and joyful daisy arrangement.",
        price: 499,
        category: "Seasonal",
        image: "https://images.pexels.com/photos/212324/pexels-photo-212324.jpeg?auto=compress&cs=tinysrgb&w=1200",
    },
];

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

export const fetchFlowers = async (options = {}) => {
    let flowers = [...MOCK_FLOWERS];

    if (options.category) {
        flowers = flowers.filter((flower) => flower.category === options.category);
    }

    if (typeof options.limit === "number") {
        flowers = flowers.slice(0, options.limit);
    }

    return flowers;
};

export const fetchFlowerById = async (id) => {
    const flower = MOCK_FLOWERS.find((item) => item.id === id);
    if (!flower) {
        throw new Error("Flower not found");
    }
    return flower;
};

export const searchFlowers = async (searchTerm) => {
    const term = String(searchTerm || "").trim().toLowerCase();
    if (!term) {
        return [...MOCK_FLOWERS];
    }

    return MOCK_FLOWERS.filter((flower) => {
        const name = flower.name.toLowerCase();
        const description = flower.description.toLowerCase();
        const category = (flower.category || "").toLowerCase();
        return name.includes(term) || description.includes(term) || category.includes(term);
    });
};

export const createOrder = async (userId, items, totalAmount, shippingInfo = {}) => {
    if (!userId) {
        throw new Error("User is required to create order.");
    }

    const orders = safeReadJson(ORDERS_STORAGE_KEY, []);
    const newOrder = {
        id: `ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        user_id: userId,
        items,
        total_amount: Number(totalAmount) || 0,
        status: "pending",
        shipping_info: shippingInfo,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };

    safeWriteJson(ORDERS_STORAGE_KEY, [newOrder, ...orders]);
    return newOrder;
};

export const fetchUserOrders = async (userId) => {
    const orders = safeReadJson(ORDERS_STORAGE_KEY, []);
    return orders.filter((order) => order.user_id === userId);
};

export const fetchOrderById = async (orderId) => {
    const orders = safeReadJson(ORDERS_STORAGE_KEY, []);
    const order = orders.find((item) => item.id === orderId);
    if (!order) {
        throw new Error("Order not found");
    }
    return order;
};

export const updateOrderStatus = async (orderId, status) => {
    const orders = safeReadJson(ORDERS_STORAGE_KEY, []);
    const index = orders.findIndex((item) => item.id === orderId);

    if (index < 0) {
        throw new Error("Order not found");
    }

    const updatedOrder = {
        ...orders[index],
        status,
        updated_at: new Date().toISOString(),
    };

    orders[index] = updatedOrder;
    safeWriteJson(ORDERS_STORAGE_KEY, orders);
    return updatedOrder;
};

export const cancelOrder = async (orderId) => {
    await updateOrderStatus(orderId, "cancelled");
    return true;
};

export const upsertProfile = async (userId, profileData) => {
    const profiles = safeReadJson(PROFILES_STORAGE_KEY, {});
    const current = profiles[userId] || {};

    const updatedProfile = {
        ...current,
        ...profileData,
        id: userId,
        updated_at: new Date().toISOString(),
    };

    profiles[userId] = updatedProfile;
    safeWriteJson(PROFILES_STORAGE_KEY, profiles);
    return updatedProfile;
};

export const fetchProfile = async (userId) => {
    const profiles = safeReadJson(PROFILES_STORAGE_KEY, {});
    return profiles[userId] || null;
};

export const updateProfile = async (userId, updates) => {
    return upsertProfile(userId, updates);
};

export const uploadImage = async (file) => {
    if (!file) {
        throw new Error("File is required");
    }
    return URL.createObjectURL(file);
};

export const deleteImage = async () => {
    return true;
};
