import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchProfile } from "../services/databaseHelpers";
import "../styles/Profile.css";

const Profile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProfile = async () => {
            if (!user?.id) {
                setLoading(false);
                return;
            }

            try {
                const storedProfile = await fetchProfile(user.id);
                setProfile(storedProfile);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [user]);

    const displayName = profile?.name || user?.name || "Your profile";
    const email = profile?.email || user?.email || "-";

    return (
        <div className="profile-page">
            <div className="profile-card">
                <span className="profile-badge">Profile</span>
                <h2>{displayName}</h2>
                <p>
                    Manage your FlowerBoom account details here.
                </p>

                {loading ? (
                    <div className="profile-loading">Loading profile...</div>
                ) : (
                    <div className="profile-details">
                        <div>
                            <span>Email</span>
                            <strong>{email}</strong>
                        </div>
                        <div>
                            <span>Member ID</span>
                            <strong>{user?.id || "-"}</strong>
                        </div>
                    </div>
                )}

                <div className="profile-actions">
                    <Link to="/orders" className="profile-link-btn">View orders</Link>
                    <Link to="/gallery" className="profile-link-btn secondary">Continue shopping</Link>
                </div>
            </div>
        </div>
    );
};

export default Profile;