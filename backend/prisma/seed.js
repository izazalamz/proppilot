import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting comprehensive PropPilot database seeding...');

    // 1. Clean existing records in reverse dependency order
    console.log('🧹 Clearing existing data...');
    await prisma.activityLog.deleteMany();
    await prisma.announcement.deleteMany();
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

    const managerUser = await prisma.user.create({
        data: {
            firstName: 'Marcus',
            lastName: 'Wright',
            email: 'marcus.manager@example.com',
            passwordHash,
            phone: '+1-555-0101',
            isEmailVerified: true,
        },
    });

    const staffUser = await prisma.user.create({
        data: {
            firstName: 'Kyle',
            lastName: 'Reese',
            email: 'kyle.technician@example.com',
            passwordHash,
            phone: '+1-555-0102',
            isEmailVerified: true,
        },
    });

    const tenantUser1 = await prisma.user.create({
        data: {
            firstName: 'Alex',
            lastName: 'Murphy',
            email: 'alex.murphy@example.com',
            passwordHash,
            phone: '+1-555-0199',
            isEmailVerified: true,
        },
    });

    const tenantUser2 = await prisma.user.create({
        data: {
            firstName: 'Elena',
            lastName: 'Rostova',
            email: 'elena.rostova@example.com',
            passwordHash,
            phone: '+1-555-0200',
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
    await prisma.membership.createMany({
        data: [
            { userId: ownerUser.id, accountId: account.id, role: 'OWNER', status: 'ACTIVE', joinedAt: new Date() },
            { userId: managerUser.id, accountId: account.id, role: 'MANAGER', status: 'ACTIVE', joinedAt: new Date() },
            { userId: staffUser.id, accountId: account.id, role: 'STAFF', status: 'ACTIVE', joinedAt: new Date() },
            { userId: tenantUser1.id, accountId: account.id, role: 'TENANT', status: 'ACTIVE', joinedAt: new Date() },
            { userId: tenantUser2.id, accountId: account.id, role: 'TENANT', status: 'ACTIVE', joinedAt: new Date() },
        ],
    });

    // 6. Create Charge Types Catalog
    console.log('💳 Creating charge types catalog...');
    const rentCharge = await prisma.chargeType.create({
        data: {
            accountId: account.id,
            name: 'Base Monthly Rent',
            description: 'Standard monthly unit rental fee',
            isRecurring: true,
        },
    });

    const waterCharge = await prisma.chargeType.create({
        data: {
            accountId: account.id,
            name: 'Water & Sewage Fee',
            description: 'Municipal water supply and utility fee',
            isRecurring: true,
            defaultAmount: 60.0,
        },
    });

    const electricCharge = await prisma.chargeType.create({
        data: {
            accountId: account.id,
            name: 'Electricity Meter Charge',
            description: 'Grid consumption power charge',
            isRecurring: true,
            defaultAmount: 120.0,
        },
    });

    const parkingCharge = await prisma.chargeType.create({
        data: {
            accountId: account.id,
            name: 'Reserved Parking Slot',
            description: 'Designated underground garage slot fee',
            isRecurring: true,
            defaultAmount: 150.0,
        },
    });

    const latePenaltyCharge = await prisma.chargeType.create({
        data: {
            accountId: account.id,
            name: 'Late Payment Penalty',
            description: 'Penalty for overdue unpaid invoices',
            isRecurring: false,
            defaultAmount: 75.0,
        },
    });

    const maintenanceCharge = await prisma.chargeType.create({
        data: {
            accountId: account.id,
            name: 'Common Area Upkeep',
            description: 'Building maintenance, gym, security and elevator fee',
            isRecurring: true,
            defaultAmount: 45.0,
        },
    });

    // 7. Create Properties
    console.log('🏘️ Creating properties...');
    const property1 = await prisma.property.create({
        data: {
            accountId: account.id,
            name: 'Sunset Heights Luxury Tower',
            description: '12-story beachfront luxury residential building with full amenities.',
            address: '100 Ocean Drive',
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
            name: 'Apex Tech Hub & Offices',
            description: 'Modern glass-facade commercial building in prime innovation corridor.',
            address: '500 Innovation Way',
            city: 'Austin',
            country: 'USA',
            postalCode: '78701',
            currency: 'USD',
            defaultGraceDays: 3,
        },
    });

    // 8. Create Unit Groups & Unit Types
    console.log('📐 Creating unit groups and unit types...');
    const floor1 = await prisma.unitGroup.create({
        data: {
            propertyId: property1.id,
            name: 'Floor 1 (Ground Garden)',
            description: 'Ground level suites with patio and garden access',
            displayOrder: 1,
        },
    });

    const floor2 = await prisma.unitGroup.create({
        data: {
            propertyId: property1.id,
            name: 'Floor 2 (Executive)',
            description: 'Second floor premium residential suites',
            displayOrder: 2,
        },
    });

    const commercialWing = await prisma.unitGroup.create({
        data: {
            propertyId: property2.id,
            name: 'North Wing (Floors 3-5)',
            description: 'Enterprise office spaces with dedicated conference facilities',
            displayOrder: 1,
        },
    });

    const type2BR = await prisma.unitType.create({
        data: {
            accountId: account.id,
            name: '2-Bedroom Deluxe Apartment',
            description: '1,200 sqft with 2 bedrooms, 2 bathrooms, and balcony',
        },
    });

    const type1BR = await prisma.unitType.create({
        data: {
            accountId: account.id,
            name: '1-Bedroom Urban Suite',
            description: '750 sqft modern open-layout suite',
        },
    });

    const typeCommercial = await prisma.unitType.create({
        data: {
            accountId: account.id,
            name: 'Commercial Office Suite',
            description: '3,500 sqft fitted enterprise office space',
        },
    });

    // 9. Create Units across varied statuses
    console.log('🚪 Creating units in varied states...');
    const unit101 = await prisma.unit.create({
        data: {
            propertyId: property1.id,
            unitGroupId: floor1.id,
            unitTypeId: type2BR.id,
            name: 'Apt 101',
            description: 'Corner garden suite with smart home automation',
            status: 'OCCUPIED',
        },
    });

    const unit102 = await prisma.unit.create({
        data: {
            propertyId: property1.id,
            unitGroupId: floor1.id,
            unitTypeId: type1BR.id,
            name: 'Apt 102',
            description: 'Cozy 1-bedroom suite facing the inner courtyard',
            status: 'OCCUPIED',
        },
    });

    const unit201 = await prisma.unit.create({
        data: {
            propertyId: property1.id,
            unitGroupId: floor2.id,
            unitTypeId: type2BR.id,
            name: 'Apt 201',
            description: 'Second floor luxury suite with ocean view',
            status: 'VACANT',
        },
    });

    const unit202 = await prisma.unit.create({
        data: {
            propertyId: property1.id,
            unitGroupId: floor2.id,
            unitTypeId: type1BR.id,
            name: 'Apt 202',
            description: 'Undergoing bathroom fixture upgrade and repainting',
            status: 'UNDER_MAINTENANCE',
        },
    });

    const suite301 = await prisma.unit.create({
        data: {
            propertyId: property2.id,
            unitGroupId: commercialWing.id,
            unitTypeId: typeCommercial.id,
            name: 'Suite 301 (Cyberdyne Corp)',
            description: 'Full-floor open workspace with server room and 4 executive offices',
            status: 'OCCUPIED',
        },
    });

    const suite302 = await prisma.unit.create({
        data: {
            propertyId: property2.id,
            unitGroupId: commercialWing.id,
            unitTypeId: typeCommercial.id,
            name: 'Suite 302 (Tech Lab)',
            description: 'Available commercial space ready for tenant fit-out',
            status: 'VACANT',
        },
    });

    // 10. Create Tenant Profiles (Individual & Business)
    console.log('👨‍💼 Creating tenant profiles...');
    const tenant1 = await prisma.tenant.create({
        data: {
            accountId: account.id,
            userId: tenantUser1.id,
            tenantType: 'INDIVIDUAL',
            firstName: 'Alex',
            lastName: 'Murphy',
            email: 'alex.murphy@example.com',
            phone: '+1-555-0199',
            governmentId: 'NID-77291048',
            emergencyContact: 'Anne Lewis (+1-555-0188)',
            notes: 'Long-term resident, excellent payment record',
        },
    });

    const tenant2 = await prisma.tenant.create({
        data: {
            accountId: account.id,
            userId: tenantUser2.id,
            tenantType: 'INDIVIDUAL',
            firstName: 'Elena',
            lastName: 'Rostova',
            email: 'elena.rostova@example.com',
            phone: '+1-555-0200',
            governmentId: 'PASSPORT-US-99128',
            emergencyContact: 'Dmitri Rostov (+1-555-0201)',
            notes: 'Digital nomad, requested fast fiber internet setup',
        },
    });

    const tenant3 = await prisma.tenant.create({
        data: {
            accountId: account.id,
            tenantType: 'BUSINESS',
            businessName: 'Cyberdyne Systems Inc',
            firstName: 'John',
            lastName: 'Connor',
            email: 'billing@cyberdyne.io',
            phone: '+1-555-0300',
            governmentId: 'TAX-CORP-449102',
            emergencyContact: 'Miles Dyson (+1-555-0301)',
            notes: 'Commercial lease with quarterly billing cycle',
        },
    });

    // 11. Create Leases (Active and Historical)
    console.log('📜 Creating active and historical leases...');
    
    // Active Lease for Unit 101 (Alex Murphy)
    const lease101 = await prisma.lease.create({
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
            notes: 'Primary 12-month residential contract with parking inclusion',
        },
    });

    await prisma.occupancy.create({
        data: {
            unitId: unit101.id,
            tenantId: tenant1.id,
            leaseId: lease101.id,
            moveIn: new Date('2026-01-01'),
        },
    });

    // Active Lease for Unit 102 (Elena Rostova)
    const lease102 = await prisma.lease.create({
        data: {
            tenantId: tenant2.id,
            unitId: unit102.id,
            startDate: new Date('2026-03-01'),
            endDate: new Date('2027-02-28'),
            rentAmount: 1400.0,
            securityDeposit: 2800.0,
            billingCycle: 'MONTHLY',
            gracePeriodDays: 5,
            status: 'ACTIVE',
            notes: '1-year residential lease agreement',
        },
    });

    await prisma.occupancy.create({
        data: {
            unitId: unit102.id,
            tenantId: tenant2.id,
            leaseId: lease102.id,
            moveIn: new Date('2026-03-01'),
        },
    });

    // Active Commercial Lease for Suite 301 (Cyberdyne Systems)
    const lease301 = await prisma.lease.create({
        data: {
            tenantId: tenant3.id,
            unitId: suite301.id,
            startDate: new Date('2026-01-01'),
            endDate: new Date('2028-12-31'),
            rentAmount: 6500.0,
            securityDeposit: 13000.0,
            billingCycle: 'MONTHLY',
            gracePeriodDays: 3,
            status: 'ACTIVE',
            notes: '3-year enterprise commercial contract',
        },
    });

    await prisma.occupancy.create({
        data: {
            unitId: suite301.id,
            tenantId: tenant3.id,
            leaseId: lease301.id,
            moveIn: new Date('2026-01-01'),
        },
    });

    // Historical / Expired Lease on Unit 101 (to demonstrate past leases timeline in 360 drawer!)
    const pastLease101 = await prisma.lease.create({
        data: {
            tenantId: tenant2.id,
            unitId: unit101.id,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-12-31'),
            rentAmount: 1650.0,
            securityDeposit: 3300.0,
            billingCycle: 'MONTHLY',
            status: 'EXPIRED',
            notes: 'Previous year completed contract without disputes.',
        },
    });

    // 12. Create Invoices across all statuses (PAID, PARTIALLY_PAID, UNPAID, OVERDUE)
    console.log('🧾 Creating comprehensive invoices and payments...');

    // Invoice 1: PAID (Alex Murphy, August 2026)
    const inv1 = await prisma.invoice.create({
        data: {
            leaseId: lease101.id,
            invoiceNumber: 'INV-202608-1001',
            issueDate: new Date('2026-08-01'),
            dueDate: new Date('2026-08-06'),
            subtotal: 2010.0,
            discount: 0.0,
            totalAmount: 2010.0,
            paidAmount: 2010.0,
            status: 'PAID',
            notes: 'August 2026 Rent, Water & Parking Fee',
            items: {
                create: [
                    { chargeTypeId: rentCharge.id, description: 'August 2026 Monthly Rent', quantity: 1, unitPrice: 1800.0, amount: 1800.0 },
                    { chargeTypeId: waterCharge.id, description: 'Water & Sewage Utility', quantity: 1, unitPrice: 60.0, amount: 60.0 },
                    { chargeTypeId: parkingCharge.id, description: 'Reserved Slot #B2', quantity: 1, unitPrice: 150.0, amount: 150.0 },
                ],
            },
        },
    });

    await prisma.payment.create({
        data: {
            invoiceId: inv1.id,
            amount: 2010.0,
            paymentMethod: 'SSLCOMMERZ',
            paymentDate: new Date('2026-08-03'),
            transactionReference: 'SSLCZ-TXN-8891024',
            status: 'SUCCESS',
            remarks: 'Paid via SSLCommerz Visa Card Checkout.',
        },
    });

    // Invoice 2: PARTIALLY_PAID (Elena Rostova, August 2026)
    const inv2 = await prisma.invoice.create({
        data: {
            leaseId: lease102.id,
            invoiceNumber: 'INV-202608-1002',
            issueDate: new Date('2026-08-01'),
            dueDate: new Date('2026-08-10'),
            subtotal: 1505.0,
            discount: 0.0,
            totalAmount: 1505.0,
            paidAmount: 800.0,
            status: 'PARTIALLY_PAID',
            notes: 'August 2026 Rent & Upkeep Fee',
            items: {
                create: [
                    { chargeTypeId: rentCharge.id, description: 'Monthly Rent - Apt 102', quantity: 1, unitPrice: 1400.0, amount: 1400.0 },
                    { chargeTypeId: waterCharge.id, description: 'Water Utility', quantity: 1, unitPrice: 60.0, amount: 60.0 },
                    { chargeTypeId: maintenanceCharge.id, description: 'Common Area Upkeep', quantity: 1, unitPrice: 45.0, amount: 45.0 },
                ],
            },
        },
    });

    await prisma.payment.create({
        data: {
            invoiceId: inv2.id,
            amount: 800.0,
            paymentMethod: 'CASH',
            paymentDate: new Date('2026-08-05'),
            transactionReference: 'CASH-REC-4821',
            status: 'SUCCESS',
            remarks: 'Partial cash payment accepted by property manager.',
        },
    });

    // Invoice 3: UNPAID (Cyberdyne Systems, August 2026)
    const inv3 = await prisma.invoice.create({
        data: {
            leaseId: lease301.id,
            invoiceNumber: 'INV-202608-3001',
            issueDate: new Date('2026-08-01'),
            dueDate: new Date('2026-08-25'),
            subtotal: 6765.0,
            discount: 0.0,
            totalAmount: 6765.0,
            paidAmount: 0.0,
            status: 'UNPAID',
            notes: 'Commercial Rent, High-Voltage Power & Upkeep',
            items: {
                create: [
                    { chargeTypeId: rentCharge.id, description: 'Suite 301 Base Rent (August 2026)', quantity: 1, unitPrice: 6500.0, amount: 6500.0 },
                    { chargeTypeId: electricCharge.id, description: 'Server Room Electric Utility', quantity: 1, unitPrice: 220.0, amount: 220.0 },
                    { chargeTypeId: maintenanceCharge.id, description: 'Commercial Facility Upkeep', quantity: 1, unitPrice: 45.0, amount: 45.0 },
                ],
            },
        },
    });

    // Invoice 4: OVERDUE (Elena Rostova, July 2026)
    const inv4 = await prisma.invoice.create({
        data: {
            leaseId: lease102.id,
            invoiceNumber: 'INV-202607-0992',
            issueDate: new Date('2026-07-01'),
            dueDate: new Date('2026-07-10'),
            subtotal: 1475.0,
            discount: 0.0,
            totalAmount: 1475.0,
            paidAmount: 0.0,
            status: 'OVERDUE',
            notes: 'Overdue rent with penalty applied',
            items: {
                create: [
                    { chargeTypeId: rentCharge.id, description: 'July 2026 Rent - Apt 102', quantity: 1, unitPrice: 1400.0, amount: 1400.0 },
                    { chargeTypeId: latePenaltyCharge.id, description: 'Late Payment Penalty Fee', quantity: 1, unitPrice: 75.0, amount: 75.0 },
                ],
            },
        },
    });

    // 13. Create Maintenance Requests across lifecycle states
    console.log('🛠️ Creating maintenance requests in various states...');
    
    // Urgent Ticket: REQUESTED
    await prisma.maintenanceRequest.create({
        data: {
            propertyId: property1.id,
            unitId: unit101.id,
            tenantId: tenant1.id,
            createdByUserId: tenantUser1.id,
            title: 'Urgent: Water Pipe Leak under Kitchen Sink',
            problemDescription: 'The hot water intake valve under the sink is dripping continuously and soaking the cabinet base.',
            category: 'Plumbing',
            priority: 'URGENT',
            status: 'REQUESTED',
            requestedAt: new Date('2026-08-14T10:30:00Z'),
        },
    });

    // High Priority Ticket: IN_PROGRESS
    await prisma.maintenanceRequest.create({
        data: {
            propertyId: property1.id,
            unitId: unit101.id,
            tenantId: tenant1.id,
            createdByUserId: tenantUser1.id,
            assignedToUserId: staffUser.id,
            title: 'Balcony Sliding Door Latch Loose',
            problemDescription: 'The lock latch on the balcony sliding glass door is slipping and does not catch properly.',
            category: 'Carpentry & Locks',
            priority: 'MEDIUM',
            status: 'IN_PROGRESS',
            requestedAt: new Date('2026-08-10T14:15:00Z'),
            reviewNotes: 'Reviewed by Marcus. Hardware replacement parts ordered.',
        },
    });

    // Commercial Ticket: REVIEWED
    await prisma.maintenanceRequest.create({
        data: {
            propertyId: property2.id,
            unitId: suite301.id,
            tenantId: tenant3.id,
            createdByUserId: managerUser.id,
            assignedToUserId: staffUser.id,
            title: 'Conference Room HVAC Thermostat Calibration',
            problemDescription: 'AC temperature sensor in Conference Room B fluctuates between 65F and 78F unexpectedly.',
            category: 'HVAC & Cooling',
            priority: 'HIGH',
            status: 'REVIEWED',
            requestedAt: new Date('2026-08-12T09:00:00Z'),
            reviewNotes: 'Staff dispatched for digital sensor reset.',
        },
    });

    // Resolved Ticket: COMPLETED
    await prisma.maintenanceRequest.create({
        data: {
            propertyId: property1.id,
            unitId: unit102.id,
            tenantId: tenant2.id,
            createdByUserId: tenantUser2.id,
            assignedToUserId: staffUser.id,
            title: 'Living Room LED Spotlight Replacement',
            problemDescription: '2 recessed ceiling spotlights in living room are flickering.',
            category: 'Electrical',
            priority: 'LOW',
            status: 'COMPLETED',
            requestedAt: new Date('2026-08-02T11:00:00Z'),
            completedAt: new Date('2026-08-03T16:00:00Z'),
            reviewNotes: 'Assigned to Kyle Reese.',
            resolutionNotes: 'Replaced both LED driver transformers and tested voltage stability. Working perfectly.',
        },
    });

    // 14. Create Announcements & Documents
    console.log('📢 Creating notice board announcements & documents...');
    
    // Announcements
    await prisma.announcement.createMany({
        data: [
            {
                propertyId: property1.id,
                createdByUserId: ownerUser.id,
                title: 'Scheduled Water Tank Sanitization & Pressure Advisory',
                message: 'Please be advised that the main rooftop water tank will undergo scheduled sanitization on Sunday between 10:00 AM and 2:00 PM. Water pressure may temporarily fluctuate during this maintenance window.',
                isPublished: true,
                publishedAt: new Date('2026-08-14T08:00:00Z'),
            },
            {
                propertyId: property1.id,
                createdByUserId: managerUser.id,
                title: 'Smart Keycard & Intercom System Firmware Upgrade',
                message: 'New RFID keycards and mobile intercom app integration will be activated on Wednesday. Please contact the front desk if you require extra household access tags.',
                isPublished: true,
                publishedAt: new Date('2026-08-12T09:30:00Z'),
            },
            {
                propertyId: property2.id,
                createdByUserId: ownerUser.id,
                title: 'Commercial Fiber Backbone & Data Center Power Testing',
                message: 'Annual grid switchover testing for high-voltage server rooms will be conducted after business hours on Friday starting at 9:00 PM. Generator backups will remain online throughout.',
                isPublished: true,
                publishedAt: new Date('2026-08-11T14:00:00Z'),
            },
            {
                propertyId: property2.id,
                createdByUserId: managerUser.id,
                title: 'Quarterly Fire Drill & Emergency Evacuation Simulation',
                message: 'Mandatory commercial tower fire drill scheduled for Thursday at 11:00 AM. Please follow floor marshals to the designated East Plaza assembly area.',
                isPublished: true,
                publishedAt: new Date('2026-08-08T10:00:00Z'),
            },
        ],
    });

    // Documents Vault
    await prisma.document.createMany({
        data: [
            {
                accountId: account.id,
                uploadedByUserId: ownerUser.id,
                propertyId: property1.id,
                leaseId: lease101.id,
                tenantId: tenant1.id,
                fileName: 'Signed_Lease_Agreement_Apt101_2026.pdf',
                fileUrl: 'https://storage.proppilot.io/docs/Signed_Lease_Agreement_Apt101_2026.pdf',
                fileSize: 345000,
                mimeType: 'application/pdf',
                category: 'Lease Agreement',
                description: 'Official signed 12-month residential contract with tenant digital signature.',
            },
            {
                accountId: account.id,
                uploadedByUserId: ownerUser.id,
                propertyId: property2.id,
                leaseId: lease301.id,
                tenantId: tenant3.id,
                fileName: 'Master_Commercial_Lease_Cyberdyne_Suite301.pdf',
                fileUrl: 'https://storage.proppilot.io/docs/Master_Commercial_Lease_Cyberdyne_Suite301.pdf',
                fileSize: 1250000,
                mimeType: 'application/pdf',
                category: 'Lease Agreement',
                description: '3-year enterprise commercial contract including server room power covenants.',
            },
            {
                accountId: account.id,
                uploadedByUserId: managerUser.id,
                propertyId: property1.id,
                tenantId: tenant2.id,
                fileName: 'Passport_Scan_Elena_Rostova_KYC.pdf',
                fileUrl: 'https://storage.proppilot.io/docs/Passport_Scan_Elena_Rostova_KYC.pdf',
                fileSize: 520000,
                mimeType: 'application/pdf',
                category: 'Tenant ID / KYC',
                description: 'Verified tenant identity verification document and proof of address.',
            },
            {
                accountId: account.id,
                uploadedByUserId: ownerUser.id,
                propertyId: property1.id,
                fileName: 'Sunset_Heights_Tower_Title_Deed_2024.pdf',
                fileUrl: 'https://storage.proppilot.io/docs/Sunset_Heights_Tower_Title_Deed_2024.pdf',
                fileSize: 2400000,
                mimeType: 'application/pdf',
                category: 'Property Deed',
                description: 'County registrar recorded title deed and zoning permit records.',
            },
            {
                accountId: account.id,
                uploadedByUserId: staffUser.id,
                propertyId: property1.id,
                leaseId: lease101.id,
                fileName: 'Move_In_Condition_Checklist_Apt101.pdf',
                fileUrl: 'https://storage.proppilot.io/docs/Move_In_Condition_Checklist_Apt101.pdf',
                fileSize: 180000,
                mimeType: 'application/pdf',
                category: 'Inspection Report',
                description: 'Completed handover checklist with initial meter readings and appliance inspections.',
            },
        ],
    });

    // =========================================================================
    // 17. CREATE WORKSPACE 2: "OmniCorp Real Estate Group"
    //     Where Alex Murphy is OWNER and Sarah Connor is a TENANT
    // =========================================================================
    console.log('🏢 Creating Workspace 2: OmniCorp Real Estate Group (Alex Murphy = OWNER, Sarah Connor = TENANT)...');

    const account2 = await prisma.account.create({
        data: {
            name: 'OmniCorp Real Estate Group',
            description: "Alex Murphy's premier commercial and executive penthouse portfolio",
        },
    });

    // Memberships for Workspace 2
    await prisma.membership.createMany({
        data: [
            { userId: tenantUser1.id, accountId: account2.id, role: 'OWNER', status: 'ACTIVE', joinedAt: new Date() },
            { userId: ownerUser.id, accountId: account2.id, role: 'TENANT', status: 'ACTIVE', joinedAt: new Date() },
            { userId: tenantUser2.id, accountId: account2.id, role: 'MANAGER', status: 'ACTIVE', joinedAt: new Date() },
        ],
    });

    // Charge Types for Workspace 2
    const omniRentCharge = await prisma.chargeType.create({
        data: {
            accountId: account2.id,
            name: 'Executive Penthouse Rent',
            description: 'Monthly residential penthouse lease fee',
            isRecurring: true,
        },
    });

    const omniUtilityCharge = await prisma.chargeType.create({
        data: {
            accountId: account2.id,
            name: 'Sky Concierge & Utility Package',
            description: 'Private concierge, valet, and high-speed fiber internet',
            isRecurring: true,
            defaultAmount: 180.0,
        },
    });

    // Property for Workspace 2
    const propertyOmni = await prisma.property.create({
        data: {
            accountId: account2.id,
            name: 'OmniCorp Detroit Towers',
            description: 'Signature 50-story architectural landmark with executive residential penthouses',
            address: '100 Renaissance Center, Suite 4200',
            city: 'Detroit',
            country: 'USA',
            postalCode: '48243',
            currency: 'USD',
            defaultGraceDays: 5,
        },
    });

    // Unit Type for Workspace 2
    const pentHouseType = await prisma.unitType.create({
        data: {
            accountId: account2.id,
            name: 'Executive Sky Penthouse',
            description: '3-Bedroom Panoramic Sky Residence with private balcony and spa bath',
        },
    });

    // Unit Group for Workspace 2
    const pentHouseGroup = await prisma.unitGroup.create({
        data: {
            propertyId: propertyOmni.id,
            name: 'Sky Penthouse Tier (Floor 42)',
            description: 'Private keycard access top-tier suites',
            displayOrder: 1,
        },
    });

    // Units for Workspace 2
    const unit4201 = await prisma.unit.create({
        data: {
            propertyId: propertyOmni.id,
            unitGroupId: pentHouseGroup.id,
            unitTypeId: pentHouseType.id,
            name: 'Penthouse 4201',
            status: 'OCCUPIED',
            description: '2,850 sq ft luxury penthouse with panoramic city views',
        },
    });

    await prisma.unit.create({
        data: {
            propertyId: propertyOmni.id,
            unitGroupId: pentHouseGroup.id,
            unitTypeId: pentHouseType.id,
            name: 'Penthouse 4202',
            status: 'VACANT',
            description: '2,900 sq ft luxury corner penthouse suite',
        },
    });


    // Tenant Profile for Sarah Connor in Workspace 2
    const tenantSarahInOmni = await prisma.tenant.create({
        data: {
            accountId: account2.id,
            tenantType: 'INDIVIDUAL',
            firstName: 'Sarah',
            lastName: 'Connor',
            email: 'sarah.connor@example.com',
            phone: '+1-555-0100',
            governmentId: 'DL-CA-9921448',
            emergencyContact: 'John Connor (+1-555-0155)',
            notes: 'High-profile executive tenant. VIP service protocol.',
        },
    });

    // Active Lease for Sarah Connor in Penthouse 4201
    const lease4201 = await prisma.lease.create({
        data: {
            tenantId: tenantSarahInOmni.id,
            unitId: unit4201.id,
            startDate: new Date('2026-02-01'),
            endDate: new Date('2027-01-31'),
            rentAmount: 3200.0,
            securityDeposit: 6400.0,
            billingCycle: 'MONTHLY',
            gracePeriodDays: 5,
            status: 'ACTIVE',
            notes: '12-month luxury residential contract with executive parking and sky lounge access',
        },
    });

    await prisma.occupancy.create({
        data: {
            unitId: unit4201.id,
            tenantId: tenantSarahInOmni.id,
            leaseId: lease4201.id,
            moveIn: new Date('2026-02-01'),
        },
    });

    // Invoices for Sarah Connor in Penthouse 4201
    const invOmniFeb = await prisma.invoice.create({
        data: {
            leaseId: lease4201.id,
            invoiceNumber: 'INV-OMNI-2026-001',
            issueDate: new Date('2026-02-01'),
            dueDate: new Date('2026-02-05'),
            status: 'PAID',
            subtotal: 3380.0,
            discount: 0.0,
            totalAmount: 3380.0,
            paidAmount: 3380.0,
            notes: 'February 2026 Penthouse Rent + Sky Concierge',
            items: {
                create: [
                    { chargeTypeId: omniRentCharge.id, description: 'February 2026 Base Rent', quantity: 1, unitPrice: 3200.0, amount: 3200.0 },
                    { chargeTypeId: omniUtilityCharge.id, description: 'Sky Concierge & High-Speed Fiber', quantity: 1, unitPrice: 180.0, amount: 180.0 },
                ],
            },
        },
    });

    await prisma.payment.create({
        data: {
            invoiceId: invOmniFeb.id,
            amount: 3380.0,
            paymentMethod: 'SSLCOMMERZ',
            paymentDate: new Date('2026-02-02'),
            transactionReference: 'TXN-OMNI-994821',
            status: 'SUCCESS',
            remarks: 'Paid via auto-debit executive card',
        },
    });


    await prisma.invoice.create({
        data: {
            leaseId: lease4201.id,
            invoiceNumber: 'INV-OMNI-2026-002',
            issueDate: new Date('2026-03-01'),
            dueDate: new Date('2026-03-05'),
            status: 'UNPAID',
            subtotal: 3380.0,
            discount: 0.0,
            totalAmount: 3380.0,
            paidAmount: 0.0,
            notes: 'March 2026 Penthouse Rent + Sky Concierge',
            items: {
                create: [
                    { chargeTypeId: omniRentCharge.id, description: 'March 2026 Base Rent', quantity: 1, unitPrice: 3200.0, amount: 3200.0 },
                    { chargeTypeId: omniUtilityCharge.id, description: 'Sky Concierge & High-Speed Fiber', quantity: 1, unitPrice: 180.0, amount: 180.0 },
                ],
            },
        },
    });



    // Maintenance Request from Sarah in Penthouse 4201
    await prisma.maintenanceRequest.create({
        data: {
            propertyId: propertyOmni.id,
            unitId: unit4201.id,
            tenantId: tenantSarahInOmni.id,
            createdByUserId: ownerUser.id,
            title: 'Balcony Panoramic Glazing Wind Dampener Check',
            problemDescription: 'Floor 42 south terrace sliding track whistling in high winds. Needs track seal inspection.',
            category: 'Glazing & Terrace',
            priority: 'MEDIUM',
            status: 'IN_PROGRESS',
            requestedAt: new Date('2026-02-10'),
        },
    });

    // Announcement in OmniCorp Towers
    await prisma.announcement.create({
        data: {
            propertyId: propertyOmni.id,
            createdByUserId: tenantUser1.id,
            title: 'Sky Lounge Gala & 43rd Floor Terrace Access Protocol',
            message: 'Residents are cordially invited to the annual Spring Solstice reception at the Sky Lounge on March 20th. Biometric lift keycards have been updated.',
            isPublished: true,
            publishedAt: new Date('2026-02-05'),
        },
    });


    // Document in OmniCorp Towers
    await prisma.document.create({
        data: {
            accountId: account2.id,
            uploadedByUserId: tenantUser1.id,
            propertyId: propertyOmni.id,
            leaseId: lease4201.id,
            tenantId: tenantSarahInOmni.id,
            fileName: 'Signed_Executive_Lease_Penthouse4201_SarahConnor.pdf',
            fileUrl: 'https://storage.proppilot.io/docs/Signed_Executive_Lease_Penthouse4201_SarahConnor.pdf',
            fileSize: 420000,
            mimeType: 'application/pdf',
            category: 'Lease Agreement',
            description: 'Executive residential contract executed for Penthouse 4201.',
        },
    });

    console.log('\n========================================');
    console.log('🎉 Database seeding completed successfully!');
    console.log('========================================');
    console.log('🔑 TEST LOGIN CREDENTIALS & WORKSPACE ROLES:');
    console.log('  1. Sarah Connor (sarah.connor@example.com / password123)');
    console.log('     • Skynet Heights Portfolio:     👑 OWNER');
    console.log('     • OmniCorp Real Estate Group:   🏠 TENANT (Penthouse 4201)');
    console.log('  2. Alex Murphy (alex.murphy@example.com / password123)');
    console.log('     • OmniCorp Real Estate Group:   👑 OWNER');
    console.log('     • Skynet Heights Portfolio:     🏠 TENANT (Apt 101)');
    console.log('  3. Marcus Wright (marcus.manager@example.com / password123)');
    console.log('     • Skynet Heights Portfolio:     👔 MANAGER');
    console.log('  4. Kyle Reese (kyle.technician@example.com / password123)');
    console.log('     • Skynet Heights Portfolio:     🔧 STAFF');
    console.log('  5. Elena Rostova (elena.rostova@example.com / password123)');
    console.log('     • OmniCorp Real Estate Group:   👔 MANAGER');
    console.log('     • Skynet Heights Portfolio:     🏠 TENANT (Apt 102)');
    console.log('========================================\n');

}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });