import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

const MANAGERIAL_ROLES = ['OWNER', 'ADMIN', 'MANAGER', 'STAFF'];

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [workspaces, setWorkspaces] = useState([]);
    const [activeWorkspace, setActiveWorkspace] = useState(null);
    const [loading, setLoading] = useState(true);

    const managerialWorkspaces = workspaces.filter((w) => MANAGERIAL_ROLES.includes(w.role));
    const tenantWorkspaces = workspaces.filter((w) => w.role === 'TENANT');
    const hasManagementAccess = managerialWorkspaces.length > 0;

    useEffect(() => {
        const fetchSession = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await api.get('/auth/me');
                const userData = response.data.user;
                const wsList = response.data.workspaces || [];

                setUser(userData);
                setWorkspaces(wsList);

                const mgrWs = wsList.filter((w) => MANAGERIAL_ROLES.includes(w.role));
                const savedWorkspaceId = localStorage.getItem('activeWorkspaceId');

                // If user has management workspaces, prioritize selecting a management workspace
                if (mgrWs.length > 0) {
                    const matchedMgrWs = mgrWs.find((w) => w.id === savedWorkspaceId) || mgrWs[0];
                    setActiveWorkspace(matchedMgrWs);
                    localStorage.setItem('activeWorkspaceId', matchedMgrWs.id);
                } else if (wsList.length > 0) {
                    const fallbackWs = wsList.find((w) => w.id === savedWorkspaceId) || wsList[0];
                    setActiveWorkspace(fallbackWs);
                    localStorage.setItem('activeWorkspaceId', fallbackWs.id);
                } else {
                    setActiveWorkspace(null);
                }
            } catch (err) {
                console.error('Session restore failed:', err);
                logout();
            } finally {
                setLoading(false);
            }
        };

        fetchSession();
    }, []);

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        const { token, user: userData, workspaces: wsList } = response.data;

        localStorage.setItem('token', token);

        const mgrWs = (wsList || []).filter((w) => MANAGERIAL_ROLES.includes(w.role));
        let selectedWs = null;

        if (mgrWs.length > 0) {
            selectedWs = mgrWs[0];
        } else if (wsList && wsList.length > 0) {
            selectedWs = wsList[0];
        }

        if (selectedWs) {
            localStorage.setItem('activeWorkspaceId', selectedWs.id);
            setActiveWorkspace(selectedWs);
        }

        setUser(userData);
        setWorkspaces(wsList || []);
        return {
            ...response.data,
            activeWorkspace: selectedWs,
            hasManagementAccess: mgrWs.length > 0,
            managerialWorkspaces: mgrWs,
        };
    };

    const register = async ({ fullName, companyName, email, password }) => {
        const parts = (fullName || 'Jane Doe').trim().split(' ');
        const firstName = parts[0] || 'User';
        const lastName = parts.slice(1).join(' ') || 'Owner';
        const workspaceName = companyName?.trim() || `${fullName || 'Primary'}'s Workspace`;

        const response = await api.post('/auth/register', {
            firstName,
            lastName,
            email,
            password,
            workspaceName,
        });
        const { token, user: userData, activeWorkspace: primaryWs } = response.data;

        localStorage.setItem('token', token);
        if (primaryWs) {
            localStorage.setItem('activeWorkspaceId', primaryWs.id);
            setActiveWorkspace(primaryWs);
        }

        setUser(userData);
        setWorkspaces(primaryWs ? [primaryWs] : []);
        return response.data;
    };

    const switchWorkspace = (workspaceId, targetPath = null) => {
        const ws = workspaces.find((w) => w.id === workspaceId);
        if (ws) {
            setActiveWorkspace(ws);
            localStorage.setItem('activeWorkspaceId', ws.id);
            if (targetPath) {
                window.location.href = targetPath;
            } else {
                window.location.reload();
            }
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('activeWorkspaceId');
        setUser(null);
        setWorkspaces([]);
        setActiveWorkspace(null);
    };


    const updateUser = (updatedUserData) => {
        setUser((prev) => ({ ...prev, ...updatedUserData }));
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                workspaces,
                managerialWorkspaces,
                tenantWorkspaces,
                hasManagementAccess,
                activeWorkspace,
                loading,
                login,
                register,
                logout,
                switchWorkspace,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);