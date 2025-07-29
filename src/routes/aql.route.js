import { Router } from 'express';
const router = Router();
import { createAqlInspection,getAllReferences } from '../controllers/aqlInspectionController.js';

router.get('/',getAllReferences)

router.post('/', createAqlInspection);


export default router;