import { getDashboardAnalytics } from '../services/analytics.service.js';

export const getDashboardData = async (req, res, next) => {
    try {
        const data = await getDashboardAnalytics(req.accountId);
        return res.status(200).json({ data });
    } catch (err) {
        next(err);
    }
};
