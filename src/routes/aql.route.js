import { Router } from 'express';
const router = Router();
import { createAqlInspection,getAllReferences ,getAllAqlInspectionsId,deleteAqlInspection} from '../controllers/aqlInspectionController.js';

router.get('/',getAllReferences)
router.get('/:id', getAllAqlInspectionsId);
router.delete('/:id', deleteAqlInspection);
router.post('/', createAqlInspection);


export default router;