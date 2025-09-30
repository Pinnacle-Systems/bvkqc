import { Router } from 'express';
const router = Router();
import { createAqlInspection,getAqlInspectionById,getSAqlInspections,updateSAqlStatusInspection,deleteSAqlInspection,updateSAqlInspection} from '../controllers/saqlInspectionController.js';

router.get('/',getSAqlInspections)
router.get('/:id', getAqlInspectionById);
router.delete('/:id', deleteSAqlInspection);
router.post('/', createAqlInspection);
router.put('/:id/status', updateSAqlStatusInspection)
router.put('/:id',updateSAqlInspection)



export default router;