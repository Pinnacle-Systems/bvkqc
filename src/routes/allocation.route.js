import { Router } from 'express';
const router = Router();
import { createAllocation, get, updateAllocation, deleteAllocation} from '../controllers/allocation.js';

router.post('/', createAllocation);
router.get('/', get);
router.put('/:id', updateAllocation);
router.delete('/:id', deleteAllocation);
export default router;