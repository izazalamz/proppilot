import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [workspaces, setWorkspaces] = useState([]);
    const [activeWorkspace, setActiveWorkspace] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSession = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await api.get('/auth/me');
                setUser(response.data.user);
                setWorkspaces(response.data.workspaces);

                const savedWorkspaceId = localStorage.getItem('activeWorkspaceId');
                const currentWs = response.data.workspaces.find(
                    (w) => w.id === savedWorkspaceId
                ) || response.data.workspaces[0];

                if (currentWs) {
                    setActiveWorkspace(currentWs);
                    localStorage.setItem('activeWorkspaceId', currentWs.id);
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
        const { token, user: userData, workspaces: wsList, activeWorkspace: primaryWs } = response.data;

        localStorage.setItem('token', token);
        if (primaryWs) {
            localStorage.setItem('activeWorkspaceId', primaryWs.id);
            setActiveWorkspace(primaryWs);
        }

        setUser(userData);
        setWorkspaces(wsList);
        return response.data;
    };

    const switchWorkspace = (workspaceId) => {
        const ws = workspaces.find((w) => w.id === workspaceId);
        if (ws) {
            setActiveWorkspace(ws);
            localStorage.setItem('activeWorkspaceId', ws.id);
            window.location.reload();
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('activeWorkspaceId');
        setUser(null);
        setWorkspaces([]);
        setActiveWorkspace(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                workspaces,
                activeWorkspace,
                loading,
                login,
                logout,
                switchWorkspace,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);