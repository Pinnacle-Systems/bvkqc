import { Router } from 'express';
const router = Router();
import { create } from '../controllers/sizeTable.js';


router.post('/', create);


export default router;