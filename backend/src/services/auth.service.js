import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';

export const findUserByEmail = async (email) => {
    return await prisma.user.findUnique({
        where: { email },
        include: {
            memberships: {
                where: { status: 'ACTIVE' },
                include: { account: true },
            },
        },
    });
};

export const registerUserAndWorkspace = async ({ firstName, lastName, email, password, workspaceName }) => {
    const passwordHash = await bcrypt.hash(password, 10);

    return await prisma.$transaction(async (tx) => {
        // 1. Create User
        const user = await tx.user.create({
            data: { firstName, lastName, email, passwordHash },
        });

        // 2. Create Primary Workspace Account
        const account = await tx.account.create({
            data: {
                name: workspaceName,
                description: `${firstName}'s primary property workspace`,
            },
        });

        // 3. Set User as OWNER in Membership
        const membership = await tx.membership.create({
            data: {
                userId: user.id,
                accountId: account.id,
                role: 'OWNER',
                status: 'ACTIVE',
                joinedAt: new Date(),
            },
        });

        return { user, account, membership };
    });
};