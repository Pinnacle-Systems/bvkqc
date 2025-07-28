import { Router } from 'express';
const router = Router();
import { createAqlInspection } from '../controllers/aqlInspectionController.js';

// router.get('/',getAqlInspectionById)

router.post('/', createAqlInspection);


export default router;