import { Router } from 'express';
const router = Router();
import { createAllocation, get} from '../controllers/allocation.js';

router.post('/', createAllocation);
router.get('/', get);



export default router;