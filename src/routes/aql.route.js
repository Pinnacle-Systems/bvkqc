import { Router } from 'express';
const router = Router();
import { createAqlInspection,getAllReferences ,getAllAqlInspectionsId} from '../controllers/aqlInspectionController.js';

router.get('/',getAllReferences)
router.get('/:id', getAllAqlInspectionsId);

router.post('/', createAqlInspection);


export default router;