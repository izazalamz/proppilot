import { Router } from 'express';
import {
    getDocuments,
    getSingleDocument,
    handleCreateDocument,
    handleUpdateDocument,
    handleDeleteDocument,
    getAnnouncements,
    handleCreateAnnouncement,
    handleUpdateAnnouncement,
    handleDeleteAnnouncement,
} from '../controllers/document.controller.js';
import { authenticate, requireWorkspace } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate, requireWorkspace());

// Announcements / Notice Board
router.get('/announcements', getAnnouncements);
router.post('/announcements', handleCreateAnnouncement);
router.put('/announcements/:id', handleUpdateAnnouncement);
router.delete('/announcements/:id', handleDeleteAnnouncement);

// Documents Vault CRUD
router.get('/', getDocuments);
router.post('/', handleCreateDocument);
router.get('/:id', getSingleDocument);
router.put('/:id', handleUpdateDocument);
router.delete('/:id', handleDeleteDocument);

export default router;
