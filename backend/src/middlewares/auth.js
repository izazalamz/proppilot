import prisma from '../config/db.js';
import { verifyToken } from '../utils/jwt.js';

/**
 * Protect routes by validating JWT Bearer token
 */
export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authentication required. No token provided.' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);

        // Fetch user details
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                isEmailVerified: true,
            },
        });

        if (!user) {
            return res.status(401).json({ error: 'User associated with token no longer exists.' });
        }

        req.user = user;
        req.accountId = decoded.accountId || null;

        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
};

/**
 * Ensure user has access to the requested workspace (Account)
 */
export const requireWorkspace = (allowedRoles = []) => {
    return async (req, res, next) => {
        try {
            const accountId = req.headers['x-account-id'] || req.accountId;

            if (!accountId) {
                return res.status(400).json({ error: 'Workspace ID (accountId) is required.' });
            }

            // Check membership
            const membership = await prisma.membership.findUnique({
                where: {
                    accountId_userId: {
                        accountId,
                        userId: req.user.id,
                    },
                },
                include: {
                    account: true,
                },
            });

            if (!membership || membership.status !== 'ACTIVE') {
                return res.status(403).json({ error: 'Access denied to this workspace.' });
            }

            // Check roles if specified
            if (allowedRoles.length > 0 && !allowedRoles.includes(membership.role)) {
                return res.status(403).json({ error: 'You do not have permission to perform this action.' });
            }

            req.membership = membership;
            req.accountId = accountId;

            next();
        } catch (error) {
            next(error);
        }
    };
};