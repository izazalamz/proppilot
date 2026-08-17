import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting comprehensive PropPilot enterprise database seeding...');

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

    // 3. Create Users
    console.log('👤 Creating user profiles...');
    const users = {
        sarah: await prisma.user.create({
            data: {
                firstName: 'Sarah',
                lastName: 'Connor',
                email: 'sarah.connor@example.com',
                passwordHash,
                phone: '+1-555-0100',
                isEmailVerified: true,
            },
        }),
        marcus: await prisma.user.create({
            data: {
                firstName: 'Marcus',
                lastName: 'Wright',
                email: 'marcus.manager@example.com',
                passwordHash,
                phone: '+1-555-0101',
                isEmailVerified: true,
            },
        }),
        kyle: await prisma.user.create({
            data: {
                firstName: 'Kyle',
                lastName: 'Reese',
                email: 'kyle.technician@example.com',
                passwordHash,
                phone: '+1-555-0102',
                isEmailVerified: true,
            },
        }),
        alex: await prisma.user.create({
            data: {
                firstName: 'Alex',
                lastName: 'Murphy',
                email: 'alex.murphy@example.com',
                passwordHash,
                phone: '+1-555-0199',
                isEmailVerified: true,
            },
        }),
        elena: await prisma.user.create({
            data: {
                firstName: 'Elena',
                lastName: 'Rostova',
                email: 'elena.rostova@example.com',
                passwordHash,
                phone: '+1-555-0200',
                isEmailVerified: true,
            },
        }),
        miles: await prisma.user.create({
            data: {
                firstName: 'Miles',
                lastName: 'Dyson',
                email: 'miles.dyson@example.com',
                passwordHash,
                phone: '+1-555-0201',
                isEmailVerified: true,
            },
        }),
        john: await prisma.user.create({
            data: {
                firstName: 'John',
                lastName: 'Anderton',
                email: 'john.anderton@example.com',
                passwordHash,
                phone: '+1-555-0202',
                isEmailVerified: true,
            },
        }),
        claire: await prisma.user.create({
            data: {
                firstName: 'Claire',
                lastName: 'Dearing',
                email: 'claire.dearing@example.com',
                passwordHash,
                phone: '+1-555-0203',
                isEmailVerified: true,
            },
        }),
        david: await prisma.user.create({
            data: {
                firstName: 'David',
                lastName: 'Kim',
                email: 'david.kim@example.com',
                passwordHash,
                phone: '+1-555-0204',
                isEmailVerified: true,
            },
        }),
        maya: await prisma.user.create({
            data: {
                firstName: 'Maya',
                lastName: 'Lin',
                email: 'maya.lin@example.com',
                passwordHash,
                phone: '+1-555-0205',
                isEmailVerified: true,
            },
        }),
        robert: await prisma.user.create({
            data: {
                firstName: 'Robert',
                lastName: 'Chen',
                email: 'robert.chen@example.com',
                passwordHash,
                phone: '+1-555-0206',
                isEmailVerified: true,
            },
        }),
        samantha: await prisma.user.create({
            data: {
                firstName: 'Samantha',
                lastName: 'Vance',
                email: 'samantha.vance@example.com',
                passwordHash,
                phone: '+1-555-0207',
                isEmailVerified: true,
            },
        }),
    };

    // 4. Create Workspace Accounts
    console.log('🏢 Creating workspace accounts...');
    const accountSkynet = await prisma.account.create({
        data: {
            name: 'Skynet Heights Portfolio',
            description: 'Premier residential towers, smart corporate tech centers, and suburban luxury villas.',
        },
    });

    const accountOmniCorp = await prisma.account.create({
        data: {
            name: 'OmniCorp Real Estate Group',
            description: 'Executive high-rise penthouses, corporate commercial complexes, and retail dining plazas.',
        },
    });

    // 5. Memberships Setup
    console.log('🔑 Assigning role-based memberships...');
    // Skynet Memberships
    await prisma.membership.createMany({
        data: [
            { userId: users.sarah.id, accountId: accountSkynet.id, role: 'OWNER', status: 'ACTIVE', joinedAt: new Date() },
            { userId: users.marcus.id, accountId: accountSkynet.id, role: 'MANAGER', status: 'ACTIVE', joinedAt: new Date() },
            { userId: users.kyle.id, accountId: accountSkynet.id, role: 'STAFF', status: 'ACTIVE', joinedAt: new Date() },
            { userId: users.alex.id, accountId: accountSkynet.id, role: 'TENANT', status: 'ACTIVE', joinedAt: new Date() },
            { userId: users.elena.id, accountId: accountSkynet.id, role: 'TENANT', status: 'ACTIVE', joinedAt: new Date() },
            { userId: users.miles.id, accountId: accountSkynet.id, role: 'TENANT', status: 'ACTIVE', joinedAt: new Date() },
            { userId: users.david.id, accountId: accountSkynet.id, role: 'TENANT', status: 'ACTIVE', joinedAt: new Date() },
            { userId: users.maya.id, accountId: accountSkynet.id, role: 'TENANT', status: 'ACTIVE', joinedAt: new Date() },
        ],
    });

    // OmniCorp Memberships
    await prisma.membership.createMany({
        data: [
            { userId: users.alex.id, accountId: accountOmniCorp.id, role: 'OWNER', status: 'ACTIVE', joinedAt: new Date() },
            { userId: users.elena.id, accountId: accountOmniCorp.id, role: 'MANAGER', status: 'ACTIVE', joinedAt: new Date() },
            { userId: users.sarah.id, accountId: accountOmniCorp.id, role: 'TENANT', status: 'ACTIVE', joinedAt: new Date() },
            { userId: users.john.id, accountId: accountOmniCorp.id, role: 'TENANT', status: 'ACTIVE', joinedAt: new Date() },
            { userId: users.claire.id, accountId: accountOmniCorp.id, role: 'TENANT', status: 'ACTIVE', joinedAt: new Date() },
            { userId: users.robert.id, accountId: accountOmniCorp.id, role: 'TENANT', status: 'ACTIVE', joinedAt: new Date() },
            { userId: users.samantha.id, accountId: accountOmniCorp.id, role: 'TENANT', status: 'ACTIVE', joinedAt: new Date() },
        ],
    });

    // 6. Charge Types Catalogs
    console.log('💳 Creating charge types catalogs...');
    const createCharges = async (accountId) => ({
        rent: await prisma.chargeType.create({
            data: { accountId, name: 'Base Monthly Rent', description: 'Standard contractual monthly unit rental fee', isRecurring: true },
        }),
        water: await prisma.chargeType.create({
            data: { accountId, name: 'Water & Utility Fee', description: 'Municipal water supply & drainage charge', isRecurring: true, defaultAmount: 65.0 },
        }),
        electric: await prisma.chargeType.create({
            data: { accountId, name: 'Electricity Meter Charge', description: 'Monthly sub-meter power consumption', isRecurring: true, defaultAmount: 135.0 },
        }),
        parking: await prisma.chargeType.create({
            data: { accountId, name: 'Reserved Parking Slot', description: 'Secured underground parking space', isRecurring: true, defaultAmount: 150.0 },
        }),
        fiber: await prisma.chargeType.create({
            data: { accountId, name: 'High-Speed Fiber Internet', description: '1Gbps dedicated optical broadband', isRecurring: true, defaultAmount: 85.0 },
        }),
        concierge: await prisma.chargeType.create({
            data: { accountId, name: 'Sky Lounge & Concierge', description: 'Access to rooftop infinity pool, gym, and 24/7 concierge', isRecurring: true, defaultAmount: 120.0 },
        }),
        cam: await prisma.chargeType.create({
            data: { accountId, name: 'Common Area Maintenance (CAM)', description: 'Shared facility HVAC, security, and cleaning operations', isRecurring: true, defaultAmount: 180.0 },
        }),
        lateFee: await prisma.chargeType.create({
            data: { accountId, name: 'Late Payment Penalty', description: 'Delinquency surcharge for overdue settlement', isRecurring: false, defaultAmount: 75.0 },
        }),
    });

    const skynetCharges = await createCharges(accountSkynet.id);
    const omniCharges = await createCharges(accountOmniCorp.id);

    // 7. Unit Types Setup
    console.log('📐 Creating unit types...');
    const createUnitTypes = async (accountId) => ({
        studio: await prisma.unitType.create({ data: { accountId, name: 'Studio Executive Suite', description: 'Compact luxury studio with built-in kitchenette' } }),
        oneBed: await prisma.unitType.create({ data: { accountId, name: '1-Bedroom Deluxe Apartment', description: 'Spacious master suite with private terrace' } }),
        twoBed: await prisma.unitType.create({ data: { accountId, name: '2-Bedroom Panoramic Residence', description: 'Corner unit with floor-to-ceiling glass & ensuite bathrooms' } }),
        threeBed: await prisma.unitType.create({ data: { accountId, name: '3-Bedroom Royal Villa', description: 'Suburban multi-level luxury townhouse with private garden' } }),
        penthouse: await prisma.unitType.create({ data: { accountId, name: 'Sky Penthouse Grand Residence', description: 'Top floor penthouse with panoramic skyline vistas and private plunge pool' } }),
        commercialFloor: await prisma.unitType.create({ data: { accountId, name: 'Commercial Corporate Floor', description: 'Open-plan tech office floor with server room and fiber backbone' } }),
        retailStore: await prisma.unitType.create({ data: { accountId, name: 'Ground Retail Flagship Store', description: 'High-foot-traffic commercial retail storefront' } }),
    });

    const skynetUnitTypes = await createUnitTypes(accountSkynet.id);
    const omniUnitTypes = await createUnitTypes(accountOmniCorp.id);

    // 8. Properties & Unit Groups Setup
    console.log('🏙️ Creating properties, space hierarchies, and units...');

    // === SKYNET PORTFOLIO PROPERTIES ===
    // Property 1: Sunset Heights Luxury Tower
    const propSunset = await prisma.property.create({
        data: {
            accountId: accountSkynet.id,
            name: 'Sunset Heights Luxury Tower',
            description: '45-story premier luxury residential high-rise featuring 24/7 concierge, infinity pool, and underground parking.',
            address: '742 Evergreen Boulevard, Suite 100',
            city: 'Los Angeles',
            country: 'USA',
            postalCode: '90001',
            currency: 'USD',
            status: 'ACTIVE',
            defaultGraceDays: 5,
        },
    });

    const ugSunsetLow = await prisma.unitGroup.create({ data: { propertyId: propSunset.id, name: 'Low-Rise Residences (Floors 1-4)', displayOrder: 1 } });
    const ugSunsetMid = await prisma.unitGroup.create({ data: { propertyId: propSunset.id, name: 'Mid-Rise Panorama (Floors 5-10)', displayOrder: 2 } });
    const ugSunsetPent = await prisma.unitGroup.create({ data: { propertyId: propSunset.id, name: 'Sky Penthouses (Floors 14-15)', displayOrder: 3 } });

    // Property 2: Cyberdyne Innovation Center
    const propCyberdyne = await prisma.property.create({
        data: {
            accountId: accountSkynet.id,
            name: 'Cyberdyne Innovation Center',
            description: 'Smart commercial tech office hub with Tier-4 data facilities, enterprise meeting centers, and helipad.',
            address: '1024 Silicon Parkway',
            city: 'Palo Alto',
            country: 'USA',
            postalCode: '94301',
            currency: 'USD',
            status: 'ACTIVE',
            defaultGraceDays: 10,
        },
    });

    const ugCyberdyneData = await prisma.unitGroup.create({ data: { propertyId: propCyberdyne.id, name: 'Data & Infrastructure Floor (Floor 1)', displayOrder: 1 } });
    const ugCyberdyneSuites = await prisma.unitGroup.create({ data: { propertyId: propCyberdyne.id, name: 'Executive Corporate Suites (Floors 4-12)', displayOrder: 2 } });

    // Property 3: Greenwood Residential Villas
    const propGreenwood = await prisma.property.create({
        data: {
            accountId: accountSkynet.id,
            name: 'Greenwood Residential Villas',
            description: 'Eco-conscious suburban enclave of gated 3-bedroom luxury townhomes with private solar arrays and gardens.',
            address: '500 Meadowlark Trail',
            city: 'Pasadena',
            country: 'USA',
            postalCode: '91101',
            currency: 'USD',
            status: 'ACTIVE',
            defaultGraceDays: 5,
        },
    });

    const ugGreenwoodEast = await prisma.unitGroup.create({ data: { propertyId: propGreenwood.id, name: 'East Garden Villas', displayOrder: 1 } });
    const ugGreenwoodWest = await prisma.unitGroup.create({ data: { propertyId: propGreenwood.id, name: 'West Meadow Villas', displayOrder: 2 } });

    // === OMNICORP PORTFOLIO PROPERTIES ===
    // Property 1: OmniCorp Detroit Towers
    const propOmniTowers = await prisma.property.create({
        data: {
            accountId: accountOmniCorp.id,
            name: 'OmniCorp Detroit Towers',
            description: 'Ultra-modern 50-story commercial & residential skyscraper in the heart of the downtown metropolitan district.',
            address: '100 Renaissance Center Way',
            city: 'Detroit',
            country: 'USA',
            postalCode: '48243',
            currency: 'USD',
            status: 'ACTIVE',
            defaultGraceDays: 7,
        },
    });

    const ugOmniLofts = await prisma.unitGroup.create({ data: { propertyId: propOmniTowers.id, name: 'Executive Sky Lofts (Floor 38)', displayOrder: 1 } });
    const ugOmniPenthouses = await prisma.unitGroup.create({ data: { propertyId: propOmniTowers.id, name: 'Royal Penthouses (Floor 42)', displayOrder: 2 } });

    // Property 2: MetroPoint Commercial Plaza
    const propMetroPoint = await prisma.property.create({
        data: {
            accountId: accountOmniCorp.id,
            name: 'MetroPoint Commercial Plaza',
            description: 'Bustling urban mixed-use retail and culinary center with direct transit connection.',
            address: '88 Woodward Avenue',
            city: 'Detroit',
            country: 'USA',
            postalCode: '48226',
            currency: 'USD',
            status: 'ACTIVE',
            defaultGraceDays: 5,
        },
    });

    const ugMetroRetail = await prisma.unitGroup.create({ data: { propertyId: propMetroPoint.id, name: 'Ground Floor Commercial Retail', displayOrder: 1 } });

    // 9. Units Creation
    console.log('🚪 Seeding individual units across properties...');

    // Skynet Units
    const skynetUnits = {
        apt101: await prisma.unit.create({
            data: { propertyId: propSunset.id, unitGroupId: ugSunsetLow.id, unitTypeId: skynetUnitTypes.oneBed.id, name: 'Apt 101', status: 'OCCUPIED', description: '1-bedroom luxury suite overlooking courtyard garden.' },
        }),
        apt102: await prisma.unit.create({
            data: { propertyId: propSunset.id, unitGroupId: ugSunsetLow.id, unitTypeId: skynetUnitTypes.oneBed.id, name: 'Apt 102', status: 'OCCUPIED', description: '1-bedroom modern corner unit with smart lighting.' },
        }),
        apt103: await prisma.unit.create({
            data: { propertyId: propSunset.id, unitGroupId: ugSunsetLow.id, unitTypeId: skynetUnitTypes.twoBed.id, name: 'Apt 103', status: 'OCCUPIED', description: '2-bedroom deluxe residence with dual ensuite bathrooms.' },
        }),
        apt104: await prisma.unit.create({
            data: { propertyId: propSunset.id, unitGroupId: ugSunsetLow.id, unitTypeId: skynetUnitTypes.studio.id, name: 'Apt 104', status: 'UNDER_MAINTENANCE', description: 'Studio unit undergoing smart thermostat & HVAC upgrades.' },
        }),
        apt201: await prisma.unit.create({
            data: { propertyId: propSunset.id, unitGroupId: ugSunsetLow.id, unitTypeId: skynetUnitTypes.oneBed.id, name: 'Apt 201', status: 'OCCUPIED', description: 'Second-floor city view 1BR unit.' },
        }),
        apt202: await prisma.unit.create({
            data: { propertyId: propSunset.id, unitGroupId: ugSunsetLow.id, unitTypeId: skynetUnitTypes.twoBed.id, name: 'Apt 202', status: 'VACANT', description: '2-bedroom premium flat available for immediate move-in.' },
        }),
        apt203: await prisma.unit.create({
            data: { propertyId: propSunset.id, unitGroupId: ugSunsetLow.id, unitTypeId: skynetUnitTypes.studio.id, name: 'Apt 203', status: 'RESERVED', description: 'Cozy studio reserved for incoming resident.' },
        }),
        suite501: await prisma.unit.create({
            data: { propertyId: propSunset.id, unitGroupId: ugSunsetMid.id, unitTypeId: skynetUnitTypes.twoBed.id, name: 'Suite 501', status: 'OCCUPIED', description: 'Mid-rise 2BR luxury residence with south-facing balcony.' },
        }),
        suite502: await prisma.unit.create({
            data: { propertyId: propSunset.id, unitGroupId: ugSunsetMid.id, unitTypeId: skynetUnitTypes.twoBed.id, name: 'Suite 502', status: 'VACANT', description: 'Mid-rise 2BR ready for leasing.' },
        }),
        suite801: await prisma.unit.create({
            data: { propertyId: propSunset.id, unitGroupId: ugSunsetMid.id, unitTypeId: skynetUnitTypes.twoBed.id, name: 'Suite 801', status: 'OCCUPIED', description: '8th floor corner flat with ocean breeze exposure.' },
        }),
        penthouse1401: await prisma.unit.create({
            data: { propertyId: propSunset.id, unitGroupId: ugSunsetPent.id, unitTypeId: skynetUnitTypes.penthouse.id, name: 'Penthouse 1401', status: 'OCCUPIED', description: 'Sky Penthouse with private wrap-around terrace and spa.' },
        }),
        penthouse1501: await prisma.unit.create({
            data: { propertyId: propSunset.id, unitGroupId: ugSunsetPent.id, unitTypeId: skynetUnitTypes.penthouse.id, name: 'Penthouse 1501 (Grand)', status: 'VACANT', description: 'The Crown Jewel: Full-floor presidential penthouse suite.' },
        }),

        // Cyberdyne Units
        dataHubAlpha: await prisma.unit.create({
            data: { propertyId: propCyberdyne.id, unitGroupId: ugCyberdyneData.id, unitTypeId: skynetUnitTypes.commercialFloor.id, name: 'Data Hub Alpha', status: 'OCCUPIED', description: 'Tier-4 high-density server room with dedicated UPS power.' },
        }),
        suite400: await prisma.unit.create({
            data: { propertyId: propCyberdyne.id, unitGroupId: ugCyberdyneSuites.id, unitTypeId: skynetUnitTypes.commercialFloor.id, name: 'Floor 4 Corporate Suite', status: 'OCCUPIED', description: 'Cyberdyne Systems R&D engineering headquarters.' },
        }),
        suite800: await prisma.unit.create({
            data: { propertyId: propCyberdyne.id, unitGroupId: ugCyberdyneSuites.id, unitTypeId: skynetUnitTypes.commercialFloor.id, name: 'Floor 8 Executive Office', status: 'VACANT', description: 'Fully partitioned corporate office floor ready for lease.' },
        }),

        // Greenwood Villas
        villa101: await prisma.unit.create({
            data: { propertyId: propGreenwood.id, unitGroupId: ugGreenwoodEast.id, unitTypeId: skynetUnitTypes.threeBed.id, name: 'Villa 101 - Oakwood', status: 'OCCUPIED', description: '3-bedroom townhouse with 2-car garage and solar backup.' },
        }),
        villa102: await prisma.unit.create({
            data: { propertyId: propGreenwood.id, unitGroupId: ugGreenwoodEast.id, unitTypeId: skynetUnitTypes.threeBed.id, name: 'Villa 102 - Birchwood', status: 'OCCUPIED', description: '3-bedroom family villa with private backyard.' },
        }),
        villa201: await prisma.unit.create({
            data: { propertyId: propGreenwood.id, unitGroupId: ugGreenwoodWest.id, unitTypeId: skynetUnitTypes.threeBed.id, name: 'Villa 201 - Pinecrest', status: 'VACANT', description: 'Modern eco-villa with private EV charging station.' },
        }),
    };

    // OmniCorp Units
    const omniUnits = {
        loft3801: await prisma.unit.create({
            data: { propertyId: propOmniTowers.id, unitGroupId: ugOmniLofts.id, unitTypeId: omniUnitTypes.oneBed.id, name: 'Loft 3801', status: 'VACANT', description: 'High-ceiling industrial loft with skyline views.' },
        }),
        loft3802: await prisma.unit.create({
            data: { propertyId: propOmniTowers.id, unitGroupId: ugOmniLofts.id, unitTypeId: omniUnitTypes.twoBed.id, name: 'Loft 3802', status: 'OCCUPIED', description: 'Luxury 2-bedroom loft occupied by John Anderton.' },
        }),
        penthouse4201: await prisma.unit.create({
            data: { propertyId: propOmniTowers.id, unitGroupId: ugOmniPenthouses.id, unitTypeId: omniUnitTypes.penthouse.id, name: 'Penthouse 4201', status: 'OCCUPIED', description: 'Executive Top-Tier Penthouse occupied by Sarah Connor.' },
        }),
        penthouse4202: await prisma.unit.create({
            data: { propertyId: propOmniTowers.id, unitGroupId: ugOmniPenthouses.id, unitTypeId: omniUnitTypes.penthouse.id, name: 'Penthouse 4202', status: 'VACANT', description: 'Executive Penthouse with private rooftop helipad access.' },
        }),

        // MetroPoint Retail Units
        retailG01: await prisma.unit.create({
            data: { propertyId: propMetroPoint.id, unitGroupId: ugMetroRetail.id, unitTypeId: omniUnitTypes.retailStore.id, name: 'Retail Unit G-01', status: 'OCCUPIED', description: 'Metro Coffee Roasters flagship cafe.' },
        }),
        retailG04: await prisma.unit.create({
            data: { propertyId: propMetroPoint.id, unitGroupId: ugMetroRetail.id, unitTypeId: omniUnitTypes.retailStore.id, name: 'Retail Unit G-04', status: 'OCCUPIED', description: 'Isla Luxury Boutique by Claire Dearing.' },
        }),
        retailG08: await prisma.unit.create({
            data: { propertyId: propMetroPoint.id, unitGroupId: ugMetroRetail.id, unitTypeId: omniUnitTypes.retailStore.id, name: 'Retail Unit G-08', status: 'VACANT', description: 'Prime corner retail shop suitable for high-end dining or pharmacy.' },
        }),
    };

    // 10. Tenant Profiles Setup
    console.log('👥 Creating tenant profiles...');
    const tenants = {
        // Skynet Tenants
        alex: await prisma.tenant.create({
            data: {
                accountId: accountSkynet.id,
                userId: users.alex.id,
                tenantType: 'INDIVIDUAL',
                firstName: 'Alex',
                lastName: 'Murphy',
                email: 'alex.murphy@example.com',
                phone: '+1-555-0199',
                governmentId: 'DL-CA-994821',
                emergencyContact: 'Anne Lewis (+1-555-0198)',
                notes: 'Law enforcement officer; highly reliable resident.',
            },
        }),
        elena: await prisma.tenant.create({
            data: {
                accountId: accountSkynet.id,
                userId: users.elena.id,
                tenantType: 'INDIVIDUAL',
                firstName: 'Elena',
                lastName: 'Rostova',
                email: 'elena.rostova@example.com',
                phone: '+1-555-0200',
                governmentId: 'PASSPORT-RU-882190',
                emergencyContact: 'Dmitri Rostov (+1-555-0299)',
                notes: 'Architect & Interior Designer; spotless tenancy track record.',
            },
        }),
        milesDyson: await prisma.tenant.create({
            data: {
                accountId: accountSkynet.id,
                userId: users.miles.id,
                tenantType: 'BUSINESS',
                businessName: 'Cyberdyne Systems Corporation',
                firstName: 'Miles',
                lastName: 'Dyson',
                email: 'miles.dyson@example.com',
                phone: '+1-555-0201',
                governmentId: 'EIN-84-9921820',
                emergencyContact: 'Tarissa Dyson (+1-555-0300)',
                notes: 'Chief Technology Officer; enterprise commercial lease with 5-year term.',
            },
        }),
        davidKim: await prisma.tenant.create({
            data: {
                accountId: accountSkynet.id,
                userId: users.david.id,
                tenantType: 'INDIVIDUAL',
                firstName: 'David',
                lastName: 'Kim',
                email: 'david.kim@example.com',
                phone: '+1-555-0204',
                governmentId: 'DL-CA-771829',
                emergencyContact: 'Grace Kim (+1-555-0244)',
                notes: 'Senior Software Architect at Silicon Labs.',
            },
        }),
        mayaLin: await prisma.tenant.create({
            data: {
                accountId: accountSkynet.id,
                userId: users.maya.id,
                tenantType: 'INDIVIDUAL',
                firstName: 'Maya',
                lastName: 'Lin',
                email: 'maya.lin@example.com',
                phone: '+1-555-0205',
                governmentId: 'DL-CA-449102',
                emergencyContact: 'Ken Lin (+1-555-0255)',
                notes: 'Biomedical researcher; lease includes 1 parking space.',
            },
        }),

        // OmniCorp Tenants
        sarah: await prisma.tenant.create({
            data: {
                accountId: accountOmniCorp.id,
                userId: users.sarah.id,
                tenantType: 'INDIVIDUAL',
                firstName: 'Sarah',
                lastName: 'Connor',
                email: 'sarah.connor@example.com',
                phone: '+1-555-0100',
                governmentId: 'DL-MI-110293',
                emergencyContact: 'John Connor (+1-555-0111)',
                notes: 'VIP Resident in Penthouse 4201; includes 2 parking bays & Sky Lounge VIP access.',
            },
        }),
        johnAnderton: await prisma.tenant.create({
            data: {
                accountId: accountOmniCorp.id,
                userId: users.john.id,
                tenantType: 'INDIVIDUAL',
                firstName: 'John',
                lastName: 'Anderton',
                email: 'john.anderton@example.com',
                phone: '+1-555-0202',
                governmentId: 'DL-MI-449201',
                emergencyContact: 'Lara Anderton (+1-555-0222)',
                notes: 'Chief of Precrime Security Division; 2-year lease.',
            },
        }),
        claireDearing: await prisma.tenant.create({
            data: {
                accountId: accountOmniCorp.id,
                userId: users.claire.id,
                tenantType: 'BUSINESS',
                businessName: 'Isla Luxury Boutique LLC',
                firstName: 'Claire',
                lastName: 'Dearing',
                email: 'claire.dearing@example.com',
                phone: '+1-555-0203',
                governmentId: 'EIN-38-1192834',
                emergencyContact: 'Owen Grady (+1-555-0233)',
                notes: 'High-end retail apparel boutique; high foot traffic tenant.',
            },
        }),
        robertChen: await prisma.tenant.create({
            data: {
                accountId: accountOmniCorp.id,
                userId: users.robert.id,
                tenantType: 'INDIVIDUAL',
                firstName: 'Robert',
                lastName: 'Chen',
                email: 'robert.chen@example.com',
                phone: '+1-555-0206',
                governmentId: 'DL-MI-881920',
                emergencyContact: 'Lisa Chen (+1-555-0266)',
                notes: 'Managing Director at Detroit Automotive Robotics.',
            },
        }),
        samanthaVance: await prisma.tenant.create({
            data: {
                accountId: accountOmniCorp.id,
                userId: users.samantha.id,
                tenantType: 'BUSINESS',
                businessName: 'Metro Coffee Roasters LLC',
                firstName: 'Samantha',
                lastName: 'Vance',
                email: 'samantha.vance@example.com',
                phone: '+1-555-0207',
                governmentId: 'EIN-45-7788192',
                emergencyContact: 'Thomas Vance (+1-555-0277)',
                notes: 'Artisan bakery & specialty espresso cafe on ground floor retail.',
            },
        }),
    };

    // 11. Leases & Occupancies
    console.log('📜 Generating active lease agreements & occupancies...');
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    const oneYearLater = new Date(now.getFullYear() + 1, now.getMonth(), 1);
    const sixMonthsLater = new Date(now.getFullYear(), now.getMonth() + 6, 1);

    // Skynet Leases
    const leaseAlex = await prisma.lease.create({
        data: {
            tenantId: tenants.alex.id,
            unitId: skynetUnits.apt101.id,
            startDate: oneYearAgo,
            endDate: oneYearLater,
            rentAmount: 1800.0,
            securityDeposit: 3600.0,
            billingCycle: 'MONTHLY',
            status: 'ACTIVE',
            notes: 'Standard 24-month residential lease agreement.',
        },
    });

    const leaseElena = await prisma.lease.create({
        data: {
            tenantId: tenants.elena.id,
            unitId: skynetUnits.apt102.id,
            startDate: new Date(now.getFullYear(), now.getMonth() - 6, 1),
            endDate: sixMonthsLater,
            rentAmount: 1950.0,
            securityDeposit: 3900.0,
            billingCycle: 'MONTHLY',
            status: 'ACTIVE',
            notes: 'Designer residence lease with custom built-ins.',
        },
    });

    const leaseCyberdyne = await prisma.lease.create({
        data: {
            tenantId: tenants.milesDyson.id,
            unitId: skynetUnits.suite400.id,
            startDate: new Date(now.getFullYear() - 2, 0, 1),
            endDate: new Date(now.getFullYear() + 3, 0, 1),
            rentAmount: 12500.0,
            securityDeposit: 25000.0,
            billingCycle: 'MONTHLY',
            status: 'ACTIVE',
            notes: 'Enterprise Tier-A corporate commercial agreement.',
        },
    });

    const leaseDavidKim = await prisma.lease.create({
        data: {
            tenantId: tenants.davidKim.id,
            unitId: skynetUnits.apt103.id,
            startDate: new Date(now.getFullYear(), now.getMonth() - 4, 1),
            endDate: new Date(now.getFullYear() + 1, now.getMonth() - 4, 1),
            rentAmount: 2400.0,
            securityDeposit: 4800.0,
            billingCycle: 'MONTHLY',
            status: 'ACTIVE',
            notes: '2-bedroom deluxe tenancy with 1 parking slot.',
        },
    });

    const leaseMayaLin = await prisma.lease.create({
        data: {
            tenantId: tenants.mayaLin.id,
            unitId: skynetUnits.suite501.id,
            startDate: new Date(now.getFullYear(), now.getMonth() - 3, 15),
            endDate: new Date(now.getFullYear() + 1, now.getMonth() - 3, 15),
            rentAmount: 2650.0,
            securityDeposit: 5300.0,
            billingCycle: 'MONTHLY',
            status: 'ACTIVE',
            notes: 'Mid-rise panoramic suite lease with pet deposit on file.',
        },
    });

    const leaseVilla101 = await prisma.lease.create({
        data: {
            tenantId: tenants.davidKim.id,
            unitId: skynetUnits.villa101.id,
            startDate: new Date(now.getFullYear(), now.getMonth() - 8, 1),
            endDate: new Date(now.getFullYear() + 1, now.getMonth() - 8, 1),
            rentAmount: 4200.0,
            securityDeposit: 8400.0,
            billingCycle: 'MONTHLY',
            status: 'ACTIVE',
            notes: 'Suburban Villa lease with private garden maintenance included.',
        },
    });

    // OmniCorp Leases
    const leaseSarah = await prisma.lease.create({
        data: {
            tenantId: tenants.sarah.id,
            unitId: omniUnits.penthouse4201.id,
            startDate: new Date(now.getFullYear(), now.getMonth() - 5, 1),
            endDate: new Date(now.getFullYear() + 1, now.getMonth() + 7, 1),
            rentAmount: 3200.0,
            securityDeposit: 6400.0,
            billingCycle: 'MONTHLY',
            status: 'ACTIVE',
            notes: 'VIP Sky Penthouse lease agreement with priority building concierge.',
        },
    });

    const leaseJohnAnderton = await prisma.lease.create({
        data: {
            tenantId: tenants.johnAnderton.id,
            unitId: omniUnits.loft3802.id,
            startDate: new Date(now.getFullYear(), now.getMonth() - 9, 1),
            endDate: new Date(now.getFullYear() + 1, now.getMonth() + 3, 1),
            rentAmount: 2800.0,
            securityDeposit: 5600.0,
            billingCycle: 'MONTHLY',
            status: 'ACTIVE',
            notes: 'Executive Sky Loft 2BR lease.',
        },
    });

    const leaseClaireBoutique = await prisma.lease.create({
        data: {
            tenantId: tenants.claireDearing.id,
            unitId: omniUnits.retailG04.id,
            startDate: new Date(now.getFullYear() - 1, 5, 1),
            endDate: new Date(now.getFullYear() + 2, 5, 1),
            rentAmount: 5500.0,
            securityDeposit: 11000.0,
            billingCycle: 'MONTHLY',
            status: 'ACTIVE',
            notes: 'Commercial Retail lease for Isla Luxury Boutique.',
        },
    });

    const leaseMetroCoffee = await prisma.lease.create({
        data: {
            tenantId: tenants.samanthaVance.id,
            unitId: omniUnits.retailG01.id,
            startDate: new Date(now.getFullYear() - 2, 2, 1),
            endDate: new Date(now.getFullYear() + 3, 2, 1),
            rentAmount: 4800.0,
            securityDeposit: 9600.0,
            billingCycle: 'MONTHLY',
            status: 'ACTIVE',
            notes: 'Metro Coffee Roasters long-term anchor retail tenancy.',
        },
    });

    // Create Occupancies
    const allLeases = [leaseAlex, leaseElena, leaseCyberdyne, leaseDavidKim, leaseMayaLin, leaseVilla101, leaseSarah, leaseJohnAnderton, leaseClaireBoutique, leaseMetroCoffee];
    for (const l of allLeases) {
        await prisma.occupancy.create({
            data: {
                unitId: l.unitId,
                tenantId: l.tenantId,
                leaseId: l.id,
                moveIn: l.startDate,
            },
        });
    }

    // 12. Invoices & Itemized Billings & Payments
    console.log('💵 Generating billing invoices and payment transactions...');

    const createInvoiceWithPayment = async ({
        lease,
        invoiceNumber,
        issueDate,
        dueDate,
        items,
        status = 'PAID',
        paymentMethod = 'SSLCOMMERZ',
        paymentDate = null,
        transactionRef = null,
    }) => {
        const subtotal = items.reduce((sum, it) => sum + it.unitPrice * (it.quantity || 1), 0);
        const totalAmount = subtotal;
        const paidAmount = status === 'PAID' ? totalAmount : status === 'PARTIALLY_PAID' ? Math.round(totalAmount * 0.5) : 0;

        const invoice = await prisma.invoice.create({
            data: {
                leaseId: lease.id,
                invoiceNumber,
                issueDate,
                dueDate,
                subtotal,
                discount: 0,
                totalAmount,
                paidAmount,
                status,
                notes: `Billing statement for period ${issueDate.toISOString().slice(0, 7)}`,
                items: {
                    create: items.map((it) => ({
                        chargeTypeId: it.chargeTypeId,
                        description: it.description,
                        quantity: it.quantity || 1,
                        unitPrice: it.unitPrice,
                        amount: it.unitPrice * (it.quantity || 1),
                    })),
                },
            },
        });

        if (paidAmount > 0) {
            await prisma.payment.create({
                data: {
                    invoiceId: invoice.id,
                    amount: paidAmount,
                    paymentMethod,
                    paymentDate: paymentDate || new Date(issueDate.getTime() + 86400000 * 2),
                    transactionReference: transactionRef || `TXN-${paymentMethod.slice(0, 3)}-${Math.floor(100000 + Math.random() * 900000)}`,
                    status: 'SUCCESS',
                    remarks: `Settled via ${paymentMethod} online payment channel.`,
                },
            });
        }

        return invoice;
    };

    // Skynet Invoices: Alex Murphy (Apt 101)
    await createInvoiceWithPayment({
        lease: leaseAlex,
        invoiceNumber: 'INV-SKY-2026-001',
        issueDate: new Date(now.getFullYear(), now.getMonth() - 2, 1),
        dueDate: new Date(now.getFullYear(), now.getMonth() - 2, 5),
        items: [
            { chargeTypeId: skynetCharges.rent.id, description: 'Base Rent - Apt 101', unitPrice: 1800.0 },
            { chargeTypeId: skynetCharges.water.id, description: 'Water & Utility Surcharge', unitPrice: 65.0 },
            { chargeTypeId: skynetCharges.parking.id, description: 'Underground Slot #B1-12', unitPrice: 150.0 },
        ],
        status: 'PAID',
        paymentMethod: 'SSLCOMMERZ',
        transactionRef: 'SSL-BKASH-99120',
    });

    await createInvoiceWithPayment({
        lease: leaseAlex,
        invoiceNumber: 'INV-SKY-2026-002',
        issueDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 5),
        items: [
            { chargeTypeId: skynetCharges.rent.id, description: 'Base Rent - Apt 101', unitPrice: 1800.0 },
            { chargeTypeId: skynetCharges.water.id, description: 'Water & Utility Surcharge', unitPrice: 65.0 },
            { chargeTypeId: skynetCharges.parking.id, description: 'Underground Slot #B1-12', unitPrice: 150.0 },
        ],
        status: 'PAID',
        paymentMethod: 'BANK_TRANSFER',
        transactionRef: 'WIRE-CHASE-44910',
    });

    await createInvoiceWithPayment({
        lease: leaseAlex,
        invoiceNumber: 'INV-SKY-2026-003',
        issueDate: new Date(now.getFullYear(), now.getMonth(), 1),
        dueDate: new Date(now.getFullYear(), now.getMonth(), 5),
        items: [
            { chargeTypeId: skynetCharges.rent.id, description: 'Base Rent - Apt 101', unitPrice: 1800.0 },
            { chargeTypeId: skynetCharges.water.id, description: 'Water & Utility Surcharge', unitPrice: 65.0 },
            { chargeTypeId: skynetCharges.parking.id, description: 'Underground Slot #B1-12', unitPrice: 150.0 },
            { chargeTypeId: skynetCharges.electric.id, description: 'Power Consumption (420 kWh)', unitPrice: 115.0 },
        ],
        status: 'UNPAID',
    });

    // Skynet Invoices: Elena Rostova (Apt 102)
    await createInvoiceWithPayment({
        lease: leaseElena,
        invoiceNumber: 'INV-SKY-2026-010',
        issueDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 5),
        items: [
            { chargeTypeId: skynetCharges.rent.id, description: 'Base Rent - Apt 102', unitPrice: 1950.0 },
            { chargeTypeId: skynetCharges.fiber.id, description: 'Fiber Gigabit Broadband', unitPrice: 85.0 },
        ],
        status: 'PAID',
        paymentMethod: 'SSLCOMMERZ',
    });

    await createInvoiceWithPayment({
        lease: leaseElena,
        invoiceNumber: 'INV-SKY-2026-011',
        issueDate: new Date(now.getFullYear(), now.getMonth(), 1),
        dueDate: new Date(now.getFullYear(), now.getMonth(), 5),
        items: [
            { chargeTypeId: skynetCharges.rent.id, description: 'Base Rent - Apt 102', unitPrice: 1950.0 },
            { chargeTypeId: skynetCharges.fiber.id, description: 'Fiber Gigabit Broadband', unitPrice: 85.0 },
        ],
        status: 'UNPAID',
    });

    // Skynet Invoices: Cyberdyne Systems (Commercial)
    await createInvoiceWithPayment({
        lease: leaseCyberdyne,
        invoiceNumber: 'INV-CYBER-2026-04',
        issueDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 15),
        items: [
            { chargeTypeId: skynetCharges.rent.id, description: 'Corporate Floor 4 Lease', unitPrice: 12500.0 },
            { chargeTypeId: skynetCharges.cam.id, description: 'Commercial CAM Surcharge', unitPrice: 1200.0 },
            { chargeTypeId: skynetCharges.parking.id, description: 'Executive Fleet Bay (8 spots)', unitPrice: 1200.0 },
        ],
        status: 'PAID',
        paymentMethod: 'BANK_TRANSFER',
        transactionRef: 'WIRE-SVB-881920',
    });

    await createInvoiceWithPayment({
        lease: leaseCyberdyne,
        invoiceNumber: 'INV-CYBER-2026-05',
        issueDate: new Date(now.getFullYear(), now.getMonth(), 1),
        dueDate: new Date(now.getFullYear(), now.getMonth(), 15),
        items: [
            { chargeTypeId: skynetCharges.rent.id, description: 'Corporate Floor 4 Lease', unitPrice: 12500.0 },
            { chargeTypeId: skynetCharges.cam.id, description: 'Commercial CAM Surcharge', unitPrice: 1200.0 },
            { chargeTypeId: skynetCharges.parking.id, description: 'Executive Fleet Bay (8 spots)', unitPrice: 1200.0 },
        ],
        status: 'PARTIALLY_PAID',
        paymentMethod: 'CHEQUE',
        transactionRef: 'CHK-WF-00918',
    });

    // OmniCorp Invoices: Sarah Connor (Penthouse 4201)
    await createInvoiceWithPayment({
        lease: leaseSarah,
        invoiceNumber: 'INV-OMNI-2026-001',
        issueDate: new Date(now.getFullYear(), now.getMonth() - 2, 1),
        dueDate: new Date(now.getFullYear(), now.getMonth() - 2, 7),
        items: [
            { chargeTypeId: omniCharges.rent.id, description: 'Sky Penthouse 4201 Monthly Rent', unitPrice: 3200.0 },
            { chargeTypeId: omniCharges.concierge.id, description: 'VIP Sky Lounge & Concierge', unitPrice: 120.0 },
            { chargeTypeId: omniCharges.parking.id, description: 'VIP Tandem Parking Space', unitPrice: 200.0 },
        ],
        status: 'PAID',
        paymentMethod: 'SSLCOMMERZ',
        transactionRef: 'SSL-CARD-77881',
    });

    await createInvoiceWithPayment({
        lease: leaseSarah,
        invoiceNumber: 'INV-OMNI-2026-002',
        issueDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 7),
        items: [
            { chargeTypeId: omniCharges.rent.id, description: 'Sky Penthouse 4201 Monthly Rent', unitPrice: 3200.0 },
            { chargeTypeId: omniCharges.concierge.id, description: 'VIP Sky Lounge & Concierge', unitPrice: 120.0 },
            { chargeTypeId: omniCharges.parking.id, description: 'VIP Tandem Parking Space', unitPrice: 200.0 },
        ],
        status: 'PAID',
        paymentMethod: 'BANK_TRANSFER',
        transactionRef: 'WIRE-DET-55190',
    });

    await createInvoiceWithPayment({
        lease: leaseSarah,
        invoiceNumber: 'INV-OMNI-2026-003',
        issueDate: new Date(now.getFullYear(), now.getMonth(), 1),
        dueDate: new Date(now.getFullYear(), now.getMonth(), 7),
        items: [
            { chargeTypeId: omniCharges.rent.id, description: 'Sky Penthouse 4201 Monthly Rent', unitPrice: 3200.0 },
            { chargeTypeId: omniCharges.concierge.id, description: 'VIP Sky Lounge & Concierge', unitPrice: 120.0 },
            { chargeTypeId: omniCharges.parking.id, description: 'VIP Tandem Parking Space', unitPrice: 200.0 },
            { chargeTypeId: omniCharges.water.id, description: 'City Water & Drainage', unitPrice: 60.0 },
        ],
        status: 'UNPAID',
    });

    // OmniCorp Invoices: John Anderton (Loft 3802)
    await createInvoiceWithPayment({
        lease: leaseJohnAnderton,
        invoiceNumber: 'INV-OMNI-2026-015',
        issueDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 7),
        items: [
            { chargeTypeId: omniCharges.rent.id, description: 'Executive Loft 3802 Rent', unitPrice: 2800.0 },
            { chargeTypeId: omniCharges.parking.id, description: 'Garage Space #38', unitPrice: 150.0 },
        ],
        status: 'PAID',
        paymentMethod: 'SSLCOMMERZ',
    });

    // OmniCorp Invoices: Isla Luxury Boutique (Retail G-04)
    await createInvoiceWithPayment({
        lease: leaseClaireBoutique,
        invoiceNumber: 'INV-RETAIL-2026-08',
        issueDate: new Date(now.getFullYear(), now.getMonth(), 1),
        dueDate: new Date(now.getFullYear(), now.getMonth(), 5),
        items: [
            { chargeTypeId: omniCharges.rent.id, description: 'Retail Flagship Unit G-04 Rent', unitPrice: 5500.0 },
            { chargeTypeId: omniCharges.cam.id, description: 'Mall Airflow & Security CAM', unitPrice: 450.0 },
        ],
        status: 'UNPAID',
    });

    // 13. Maintenance Work Orders
    console.log('🔧 Creating maintenance work orders & repair tickets...');

    // Skynet Tickets
    await prisma.maintenanceRequest.create({
        data: {
            propertyId: propSunset.id,
            unitId: skynetUnits.apt101.id,
            tenantId: tenants.alex.id,
            createdByUserId: users.alex.id,
            assignedToUserId: users.kyle.id,
            title: 'Master Bathroom Hot Water Pressure Fluctuation',
            problemDescription: 'Water heater temperature fluctuates rapidly during morning hours (7 AM - 9 AM). Pressure drops by ~40%.',
            category: 'Plumbing',
            priority: 'MEDIUM',
            status: 'IN_PROGRESS',
            requestedAt: new Date(now.getTime() - 86400000 * 3),
            reviewNotes: 'Assigned to Kyle Reese. Technician scheduled to inspect mixing valve.',
        },
    });

    await prisma.maintenanceRequest.create({
        data: {
            propertyId: propSunset.id,
            unitId: skynetUnits.apt102.id,
            tenantId: tenants.elena.id,
            createdByUserId: users.elena.id,
            assignedToUserId: users.kyle.id,
            title: 'Balcony Sliding Door Wind Seal Whistle',
            problemDescription: 'High winds cause acoustic whistling along the rubber acoustic weatherstrip on the south balcony slider.',
            category: 'Structural',
            priority: 'LOW',
            status: 'COMPLETED',
            requestedAt: new Date(now.getTime() - 86400000 * 12),
            completedAt: new Date(now.getTime() - 86400000 * 10),
            reviewNotes: 'Acoustic silicone gasket replaced and slider track lubricated.',
            resolutionNotes: 'Verified airtight seal at 35mph wind simulation. Resolved.',
        },
    });

    await prisma.maintenanceRequest.create({
        data: {
            propertyId: propCyberdyne.id,
            unitId: skynetUnits.suite400.id,
            tenantId: tenants.milesDyson.id,
            createdByUserId: users.miles.id,
            assignedToUserId: users.kyle.id,
            title: 'Server Room Alpha Precision AC Unit #2 Fault',
            problemDescription: 'Redundant cooling compressor is reporting Error Code E-44 (Refrigerant sensor threshold low).',
            category: 'HVAC',
            priority: 'URGENT',
            status: 'IN_PROGRESS',
            requestedAt: new Date(now.getTime() - 86400000 * 1),
            reviewNotes: 'Critical enterprise ticket. Trane commercial technician dispatched on-site.',
        },
    });

    await prisma.maintenanceRequest.create({
        data: {
            propertyId: propSunset.id,
            unitId: null,
            tenantId: null,
            createdByUserId: users.marcus.id,
            assignedToUserId: users.kyle.id,
            title: 'Elevator Car 3 Optical Door Sensor Recalibration',
            problemDescription: 'Elevator door bounces twice before closing on Floor 8.',
            category: 'Elevators',
            priority: 'HIGH',
            status: 'CLOSED',
            requestedAt: new Date(now.getTime() - 86400000 * 18),
            completedAt: new Date(now.getTime() - 86400000 * 17),
            reviewNotes: 'Otis Elevator service team replaced laser alignment diodes.',
            resolutionNotes: 'Passes all 50-cycle automated tests without error.',
        },
    });

    // OmniCorp Tickets
    await prisma.maintenanceRequest.create({
        data: {
            propertyId: propOmniTowers.id,
            unitId: omniUnits.penthouse4201.id,
            tenantId: tenants.sarah.id,
            createdByUserId: users.sarah.id,
            assignedToUserId: null,
            title: 'Penthouse Plunge Pool Temperature Sensor Sync',
            problemDescription: 'The smart automation app is reporting 24°C but the water thermometer reads 30°C. Needs recalibration.',
            category: 'Appliances',
            priority: 'MEDIUM',
            status: 'REQUESTED',
            requestedAt: new Date(now.getTime() - 86400000 * 2),
            reviewNotes: 'Pending dispatch of pool automation technician.',
        },
    });

    await prisma.maintenanceRequest.create({
        data: {
            propertyId: propMetroPoint.id,
            unitId: omniUnits.retailG04.id,
            tenantId: tenants.claireDearing.id,
            createdByUserId: users.claire.id,
            assignedToUserId: null,
            title: 'Track Spotlight 4-Circuit Dimmer Module Replacement',
            problemDescription: 'Showcase display lighting flickering in west window section.',
            category: 'Electrical',
            priority: 'MEDIUM',
            status: 'REQUESTED',
            requestedAt: new Date(now.getTime() - 86400000 * 4),
        },
    });

    // 14. Document Vault Setup
    console.log('📁 Creating digital document vault records...');

    const createDoc = async ({
        accountId,
        uploadedByUserId,
        propertyId = null,
        leaseId = null,
        tenantId = null,
        fileName,
        fileUrl,
        fileSize,
        mimeType = 'application/pdf',
        category,
        description,
    }) => {
        await prisma.document.create({
            data: {
                accountId,
                uploadedByUserId,
                propertyId,
                leaseId,
                tenantId,
                fileName,
                fileUrl,
                fileSize,
                mimeType,
                category,
                description,
            },
        });
    };

    // Skynet Documents
    await createDoc({
        accountId: accountSkynet.id,
        uploadedByUserId: users.sarah.id,
        propertyId: propSunset.id,
        leaseId: leaseAlex.id,
        tenantId: tenants.alex.id,
        fileName: 'Executed_Lease_Agreement_Apt101_Murphy.pdf',
        fileUrl: 'https://storage.proppilot.io/docs/leases/lease_apt101_murphy_signed.pdf',
        fileSize: 2450000,
        category: 'Lease Agreement',
        description: 'Digitally executed 24-month tenancy contract with countersignatures.',
    });

    await createDoc({
        accountId: accountSkynet.id,
        uploadedByUserId: users.marcus.id,
        propertyId: propSunset.id,
        fileName: 'Sunset_Heights_Annual_Fire_Safety_Certificate_2026.pdf',
        fileUrl: 'https://storage.proppilot.io/docs/compliance/sunset_fire_cert_2026.pdf',
        fileSize: 1850000,
        category: 'Compliance & Safety',
        description: 'City of Los Angeles annual NFPA-101 fire suppression compliance report.',
    });

    await createDoc({
        accountId: accountSkynet.id,
        uploadedByUserId: users.sarah.id,
        propertyId: propCyberdyne.id,
        leaseId: leaseCyberdyne.id,
        tenantId: tenants.milesDyson.id,
        fileName: 'Cyberdyne_Systems_Master_Commercial_Lease_2026.pdf',
        fileUrl: 'https://storage.proppilot.io/docs/commercial/cyberdyne_master_lease.pdf',
        fileSize: 6200000,
        category: 'Commercial Contract',
        description: 'Master enterprise lease contract including server infrastructure SLAs.',
    });

    await createDoc({
        accountId: accountSkynet.id,
        uploadedByUserId: users.marcus.id,
        propertyId: propSunset.id,
        fileName: 'Sunset_Heights_Architectural_Floorplans_AsBuilt.pdf',
        fileUrl: 'https://storage.proppilot.io/docs/plans/sunset_as_built_dwg.pdf',
        fileSize: 14800000,
        category: 'Building Plans',
        description: 'Complete MEP and structural architectural blueprints.',
    });

    // OmniCorp Documents
    await createDoc({
        accountId: accountOmniCorp.id,
        uploadedByUserId: users.alex.id,
        propertyId: propOmniTowers.id,
        leaseId: leaseSarah.id,
        tenantId: tenants.sarah.id,
        fileName: 'OmniCorp_SkyPenthouse_4201_Lease_Agreement.pdf',
        fileUrl: 'https://storage.proppilot.io/docs/leases/omni_penthouse4201_connor.pdf',
        fileSize: 3100000,
        category: 'Lease Agreement',
        description: 'Full residential penthouse lease contract with VIP concierge addendum.',
    });

    await createDoc({
        accountId: accountOmniCorp.id,
        uploadedByUserId: users.elena.id,
        propertyId: propOmniTowers.id,
        fileName: 'OmniCorp_Towers_HVAC_Chiller_Inspection_Report.pdf',
        fileUrl: 'https://storage.proppilot.io/docs/engineering/omni_chiller_q1_2026.pdf',
        fileSize: 2200000,
        category: 'Inspection Report',
        description: 'Q1 Comprehensive engineering assessment of central rooftop chillers.',
    });

    // 15. Announcements
    console.log('📢 Publishing community notices & announcements...');

    await prisma.announcement.create({
        data: {
            propertyId: propSunset.id,
            createdByUserId: users.marcus.id,
            title: '🏊 Sky Lounge & Rooftop Infinity Pool Annual Maintenance',
            message: 'Please be advised that the 45th-floor rooftop pool and spa will undergo bi-annual filter deep-cleaning on Thursday from 8:00 AM to 4:00 PM. Gym and sundeck remain open.',
            isPublished: true,
            publishedAt: new Date(now.getTime() - 86400000 * 2),
        },
    });

    await prisma.announcement.create({
        data: {
            propertyId: propSunset.id,
            createdByUserId: users.marcus.id,
            title: '⚡ Emergency Backup Generator Routine Load Testing',
            message: 'The facility engineering team will perform a scheduled 10-minute transfer switch test on Sunday at 3:00 AM. No residential power interruption is expected.',
            isPublished: true,
            publishedAt: new Date(now.getTime() - 86400000 * 5),
        },
    });

    await prisma.announcement.create({
        data: {
            propertyId: propCyberdyne.id,
            createdByUserId: users.marcus.id,
            title: '🌐 Commercial Fiber Backbone Redundancy Upgrade',
            message: 'Telecom engineers are activating secondary fiber path circuits this weekend. Zero packet loss expected during switchover.',
            isPublished: true,
            publishedAt: new Date(now.getTime() - 86400000 * 4),
        },
    });

    await prisma.announcement.create({
        data: {
            propertyId: propOmniTowers.id,
            createdByUserId: users.elena.id,
            title: '🍸 Annual Detroit Towers Residents Rooftop Gala',
            message: 'Join fellow residents and property management on Friday, August 28th at 7:00 PM on the 42nd-floor terrace for champagne, artisanal hors d’oeuvres, and live jazz.',
            isPublished: true,
            publishedAt: new Date(now.getTime() - 86400000 * 1),
        },
    });

    await prisma.announcement.create({
        data: {
            propertyId: propMetroPoint.id,
            createdByUserId: users.elena.id,
            title: '🛍️ MetroPoint Summer Culinary & Artisan Weekend Market',
            message: 'Outdoor plaza stalls will be operating this Saturday & Sunday with live acoustic performances and specialty food tastings.',
            isPublished: true,
            publishedAt: new Date(now.getTime() - 86400000 * 3),
        },
    });

    // 16. Activity Logs
    console.log('📝 Logging initial audit events...');
    const createLog = async (accountId, userId, action, entity, entityId, details) => {
        await prisma.activityLog.create({
            data: {
                accountId,
                userId,
                action,
                entity,
                entityId,
                details,
            },
        });
    };

    await createLog(accountSkynet.id, users.sarah.id, 'CREATE', 'PROPERTY', propSunset.id, { name: propSunset.name, city: propSunset.city });
    await createLog(accountSkynet.id, users.marcus.id, 'CREATE_LEASE', 'LEASE', leaseAlex.id, { tenant: 'Alex Murphy', unit: 'Apt 101', rent: 1800 });
    await createLog(accountSkynet.id, users.alex.id, 'SUBMIT_TICKET', 'MAINTENANCE', 'TICKET-01', { category: 'Plumbing', priority: 'MEDIUM' });
    await createLog(accountOmniCorp.id, users.alex.id, 'CREATE_LEASE', 'LEASE', leaseSarah.id, { tenant: 'Sarah Connor', unit: 'Penthouse 4201', rent: 3200 });

    console.log('✅ PropPilot enterprise database seeded successfully with rich real-world multi-workspace dataset!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });