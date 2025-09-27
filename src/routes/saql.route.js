import { Router } from 'express';
const router = Router();
import { createAqlInspection,getAqlInspectionById,getSAqlInspections} from '../controllers/saqlInspectionController.js';

router.get('/',getSAqlInspections)
router.get('/:id', getAqlInspectionById);
// router.delete('/:id', deleteAqlInspection);
router.post('/', createAqlInspection);
// router.put('/:id/status', updateAqlStatusInspection)


export default router;