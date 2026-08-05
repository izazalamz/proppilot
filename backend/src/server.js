import dotenv from 'dotenv';
import app from './app.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 PropPilot API running on port ${PORT}`);
    console.log(`🌐 Health check available at http://localhost:${PORT}/api/health`);
});