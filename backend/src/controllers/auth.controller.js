import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { generateToken } from '../utils/jwt.js';
import { findUserByEmail, registerUserAndWorkspace } from '../services/auth.service.js';

const registerSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    workspaceName: z.string().min(1, 'Workspace name is required'),
});

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export const register = async (req, res, next) => {
    try {
        const validatedData = registerSchema.parse(req.body);

        const existingUser = await findUserByEmail(validatedData.email);
        if (existingUser) {
            return res.status(400).json({ error: 'A user with this email already exists.' });
        }

        const { user, account, membership } = await registerUserAndWorkspace(validatedData);

        const token = generateToken({
            userId: user.id,
            accountId: account.id,
        });

        return res.status(201).json({
            message: 'Registration successful!',
            token,
            user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email },
            activeWorkspace: { id: account.id, name: account.name, role: membership.role },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const validatedData = loginSchema.parse(req.body);

        const user = await findUserByEmail(validatedData.email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const isPasswordValid = await bcrypt.compare(validatedData.password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const primaryMembership = user.memberships[0];
        const activeAccountId = primaryMembership ? primaryMembership.accountId : null;

        const token = generateToken({
            userId: user.id,
            accountId: activeAccountId,
        });

        return res.status(200).json({
            message: 'Login successful!',
            token,
            user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email },
            workspaces: user.memberships.map((m) => ({ id: m.account.id, name: m.account.name, role: m.role })),
            activeWorkspace: primaryMembership
                ? { id: primaryMembership.account.id, name: primaryMembership.account.name, role: primaryMembership.role }
                : null,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        next(error);
    }
};

export const getMe = async (req, res, next) => {
    try {
        const user = await findUserByEmail(req.user.email);

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        return res.status(200).json({
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                createdAt: user.createdAt,
            },
            workspaces: user.memberships.map((m) => ({
                id: m.account.id,
                name: m.account.name,
                role: m.role,
            })),
            activeAccountId: req.accountId,
        });
    } catch (error) {
        next(error);
    }
};

const updateProfileSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().optional().nullable(),
});

export const updateProfile = async (req, res, next) => {
    try {
        const validatedData = updateProfileSchema.parse(req.body);
        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                firstName: validatedData.firstName,
                lastName: validatedData.lastName,
                phone: validatedData.phone || null,
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                createdAt: true,
            },
        });

        return res.status(200).json({
            message: 'Profile updated successfully!',
            user: updatedUser,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        next(error);
    }
};

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const changePassword = async (req, res, next) => {
    try {
        const validatedData = changePasswordSchema.parse(req.body);
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const isCurrentValid = await bcrypt.compare(validatedData.currentPassword, user.passwordHash);
        if (!isCurrentValid) {
            return res.status(400).json({ error: 'Incorrect current password.' });
        }

        const newHash = await bcrypt.hash(validatedData.newPassword, 10);
        await prisma.user.update({
            where: { id: req.user.id },
            data: { passwordHash: newHash },
        });

        return res.status(200).json({ message: 'Password updated successfully!' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        next(error);
    }
};