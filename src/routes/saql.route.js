import { Router } from 'express';
const router = Router();
import { createAqlInspection,getAqlInspections ,getAqlInspectionById,deleteAqlInspection,updateAqlStatusInspection} from '../controllers/saqlInspectionController.js';

router.get('/',getAqlInspections)
router.get('/:id', getAqlInspectionById);
router.delete('/:id', deleteAqlInspection);
router.post('/', createAqlInspection);
router.put('/:id/status', updateAqlStatusInspection)


export default router;