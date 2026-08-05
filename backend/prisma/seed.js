import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    // 1. Clean existing records (in reverse dependency order)
    console.log('🧹 Clearing existing data...');
    await prisma.activityLog.deleteMany();
    await prisma.document.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.invoiceItem.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.chargeType.deleteMany();
    await prisma.maintenanceRequest.deleteMany();
    await prisma.occupancy.deleteMany();
    await prisma.lease.deleteMany();
    await prisma.unit.deleteMany();
    await prisma.unitGroup.deleteMany();
    await prisma.unitType.deleteMany();
    await prisma.property.deleteMany();
    await prisma.membership.deleteMany();
    await prisma.tenant.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();

    // 2. Hash default password
    const passwordHash = await bcrypt.hash('password123', 10);

    // 3. Create Primary Users
    console.log('👤 Creating users...');
    const ownerUser = await prisma.user.create({
        data: {
            firstName: 'Sarah',
            lastName: 'Connor',
            email: 'sarah.connor@example.com',
            passwordHash,
            phone: '+1-555-0100',
            isEmailVerified: true,
        },
    });

    const tenantUser = await prisma.user.create({
        data: {
            firstName: 'Alex',
            lastName: 'Murphy',
            email: 'alex.murphy@example.com',
            passwordHash,
            phone: '+1-555-0199',
            isEmailVerified: true,
        },
    });

    // 4. Create Workspace Account
    console.log('🏢 Creating workspace account...');
    const account = await prisma.account.create({
        data: {
            name: 'Skynet Heights Portfolio',
            description: 'Primary residential and commercial management account',
        },
    });

    // 5. Add Memberships
    console.log('🔑 Setting up memberships...');
    await prisma.membership.create({
        data: {
            userId: ownerUser.id,
            accountId: account.id,
            role: 'OWNER',
            status: 'ACTIVE',
            joinedAt: new Date(),
        },
    });

    await prisma.membership.create({
        data: {
            userId: tenantUser.id,
            accountId: account.id,
            role: 'TENANT',
            status: 'ACTIVE',
            joinedAt: new Date(),
        },
    });

    // 6. Create Charge Types
    console.log('💳 Creating charge types...');
    const rentCharge = await prisma.chargeType.create({
        data: {
            accountId: account.id,
            name: 'Monthly Rent',
            description: 'Standard monthly unit rent charge',
            isRecurring: true,
        },
    });

    const waterCharge = await prisma.chargeType.create({
        data: {
            accountId: account.id,
            name: 'Water & Utility Fee',
            description: 'Municipal water supply charge',
            isRecurring: true,
            defaultAmount: 50.0,
        },
    });

    // 7. Create Properties
    console.log('🏘️ Creating properties...');
    const property1 = await prisma.property.create({
        data: {
            accountId: account.id,
            name: 'Sunset Tower',
            description: 'Luxury 10-story residential tower with ocean views',
            address: '123 Ocean Drive',
            city: 'Miami',
            country: 'USA',
            postalCode: '33139',
            currency: 'USD',
            defaultGraceDays: 5,
        },
    });

    const property2 = await prisma.property.create({
        data: {
            accountId: account.id,
            name: 'Apex Commercial Center',
            description: 'Modern office spaces in prime tech hub',
            address: '456 Innovation Way',
            city: 'Austin',
            country: 'USA',
            postalCode: '78701',
            currency: 'USD',
            defaultGraceDays: 3,
        },
    });

    // 8. Create Unit Groups & Types
    console.log('📐 Creating unit groups and types...');
    const floor1 = await prisma.unitGroup.create({
        data: {
            propertyId: property1.id,
            name: 'Floor 1',
            description: 'Ground floor residential suites',
            displayOrder: 1,
        },
    });

    const floor2 = await prisma.unitGroup.create({
        data: {
            propertyId: property1.id,
            name: 'Floor 2',
            description: 'Second floor premium suites',
            displayOrder: 2,
        },
    });

    const residentialType = await prisma.unitType.create({
        data: {
            accountId: account.id,
            name: '2-Bedroom Apartment',
            description: 'Standard 2BR / 2BA floor plan',
        },
    });

    const officeType = await prisma.unitType.create({
        data: {
            accountId: account.id,
            name: 'Commercial Office Suite',
            description: 'Open plan office with meeting rooms',
        },
    });

    // 9. Create Units
    console.log('🚪 Creating units...');
    const unit101 = await prisma.unit.create({
        data: {
            propertyId: property1.id,
            unitGroupId: floor1.id,
            unitTypeId: residentialType.id,
            name: 'Apt 101',
            description: 'Corner suite with private balcony',
            status: 'OCCUPIED',
        },
    });

    const unit102 = await prisma.unit.create({
        data: {
            propertyId: property1.id,
            unitGroupId: floor1.id,
            unitTypeId: residentialType.id,
            name: 'Apt 102',
            description: 'Ground level suite with garden access',
            status: 'VACANT',
        },
    });

    const unit201 = await prisma.unit.create({
        data: {
            propertyId: property1.id,
            unitGroupId: floor2.id,
            unitTypeId: residentialType.id,
            name: 'Apt 201',
            description: 'Upper level suite',
            status: 'VACANT',
        },
    });

    const office301 = await prisma.unit.create({
        data: {
            propertyId: property2.id,
            unitTypeId: officeType.id,
            name: 'Suite 301',
            description: '3,000 sq ft office space',
            status: 'VACANT',
        },
    });

    // 10. Create Tenant Profile
    console.log('👨‍💼 Creating tenant profiles...');
    const tenant1 = await prisma.tenant.create({
        data: {
            accountId: account.id,
            userId: tenantUser.id,
            tenantType: 'INDIVIDUAL',
            firstName: 'Alex',
            lastName: 'Murphy',
            email: 'alex.murphy@example.com',
            phone: '+1-555-0199',
            governmentId: 'ID-992031',
            emergencyContact: 'Anne Lewis (+1-555-0188)',
            notes: 'Long-term tenant, excellent credit score',
        },
    });

    // 11. Create Active Lease & Occupancy
    console.log('📜 Creating lease & occupancy records...');
    const lease1 = await prisma.lease.create({
        data: {
            tenantId: tenant1.id,
            unitId: unit101.id,
            startDate: new Date('2026-01-01'),
            endDate: new Date('2026-12-31'),
            rentAmount: 1800.0,
            securityDeposit: 3600.0,
            billingCycle: 'MONTHLY',
            gracePeriodDays: 5,
            status: 'ACTIVE',
            notes: 'Standard 12-month lease agreement',
        },
    });

    await prisma.occupancy.create({
        data: {
            unitId: unit101.id,
            tenantId: tenant1.id,
            leaseId: lease1.id,
            moveIn: new Date('2026-01-01'),
        },
    });

    // 12. Create Sample Invoice & Payment
    console.log('🧾 Creating invoices & payment history...');
    const invoice1 = await prisma.invoice.create({
        data: {
            leaseId: lease1.id,
            invoiceNumber: 'INV-2026-001',
            issueDate: new Date('2026-08-01'),
            dueDate: new Date('2026-08-05'),
            subtotal: 1850.0,
            discount: 0.0,
            totalAmount: 1850.0,
            paidAmount: 1850.0,
            status: 'PAID',
            notes: 'August 2026 Rent & Utilities',
        },
    });

    await prisma.invoiceItem.createMany({
        data: [
            {
                invoiceId: invoice1.id,
                chargeTypeId: rentCharge.id,
                description: 'Monthly Rent - Apt 101 (August 2026)',
                quantity: 1,
                unitPrice: 1800.0,
                amount: 1800.0,
            },
            {
                invoiceId: invoice1.id,
                chargeTypeId: waterCharge.id,
                description: 'Water Utility Fee',
                quantity: 1,
                unitPrice: 50.0,
                amount: 50.0,
            },
        ],
    });

    await prisma.payment.create({
        data: {
            invoiceId: invoice1.id,
            amount: 1850.0,
            paymentMethod: 'SSLCOMMERZ',
            paymentDate: new Date('2026-08-02'),
            transactionReference: 'TRX_SSL_9981203',
            status: 'SUCCESS',
            remarks: 'Online portal payment',
        },
    });

    // 13. Create Sample Maintenance Request
    console.log('🛠️ Creating sample maintenance request...');
    await prisma.maintenanceRequest.create({
        data: {
            propertyId: property1.id,
            unitId: unit101.id,
            tenantId: tenant1.id,
            createdByUserId: tenantUser.id,
            assignedToUserId: ownerUser.id,
            title: 'Balcony Door Handle Loose',
            problemDescription: 'The lock latch on the balcony sliding door is slipping.',
            category: 'Carpentry',
            priority: 'MEDIUM',
            status: 'IN_PROGRESS',
            requestedAt: new Date('2026-08-03'),
        },
    });

    console.log('✅ Database seeded successfully!');
    console.log('\n----------------------------------------');
    console.log('🔑 Seeded Credentials:');
    console.log('  Owner Account:  sarah.connor@example.com / password123');
    console.log('  Tenant Account: alex.murphy@example.com / password123');
    console.log('----------------------------------------\n');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });