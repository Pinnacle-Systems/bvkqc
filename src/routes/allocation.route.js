import { Router } from 'express';
const router = Router();
import { createAllocation, } from '../controllers/allocation.js';

router.post('/', createAllocation);


export default router;