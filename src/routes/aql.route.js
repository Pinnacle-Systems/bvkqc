import { Router } from 'express';
const router = Router();
import { createAqlInspection,getAllReferences ,getAqlInspectionById,deleteAqlInspection,updateAqlStatusInspection} from '../controllers/aqlInspectionController.js';

router.get('/',getAllReferences)
router.get('/:id', getAqlInspectionById);
router.delete('/:id', deleteAqlInspection);
router.post('/', createAqlInspection);
router.put('/:id/status', updateAqlStatusInspection)


export default router;