import { z } from 'zod';
import {
    getPropertiesByAccount,
    getPropertyById,
    createProperty,
    createUnitGroup,
    createUnit,
} from '../services/property.service.js';

const propertySchema = z.object({
    name: z.string().min(1, 'Property name is required'),
    description: z.string().optional(),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    country: z.string().min(1, 'Country is required'),
    postalCode: z.string().optional(),
    currency: z.string().optional(),
    defaultGraceDays: z.number().optional(),
});

const unitGroupSchema = z.object({
    name: z.string().min(1, 'Group name is required'),
    description: z.string().optional(),
    displayOrder: z.number().optional(),
});

const unitSchema = z.object({
    name: z.string().min(1, 'Unit name/number is required'),
    unitGroupId: z.string().optional(),
    unitTypeName: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(['VACANT', 'OCCUPIED', 'UNDER_MAINTENANCE', 'RESERVED']).optional(),
});

export const getProperties = async (req, res, next) => {
    try {
        const properties = await getPropertiesByAccount(req.accountId);
        return res.status(200).json({ data: properties });
    } catch (error) {
        next(error);
    }
};

export const getSingleProperty = async (req, res, next) => {
    try {
        const property = await getPropertyById(req.params.id, req.accountId);
        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }
        return res.status(200).json({ data: property });
    } catch (error) {
        next(error);
    }
};

export const handleCreateProperty = async (req, res, next) => {
    try {
        const validated = propertySchema.parse(req.body);
        const property = await createProperty(req.accountId, validated);
        return res.status(201).json({ message: 'Property created successfully', data: property });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        next(error);
    }
};

export const handleCreateUnitGroup = async (req, res, next) => {
    try {
        const validated = unitGroupSchema.parse(req.body);
        const group = await createUnitGroup(req.params.propertyId, validated);
        return res.status(201).json({ message: 'Unit group created', data: group });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        next(error);
    }
};

export const handleCreateUnit = async (req, res, next) => {
    try {
        const validated = unitSchema.parse(req.body);
        const unit = await createUnit(req.accountId, req.params.propertyId, validated);
        return res.status(201).json({ message: 'Unit created successfully', data: unit });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        next(error);
    }
};