import { Router } from 'express';
const router = Router();
import { create,get } from '../controllers/sizeTable.js';

router.get('/',get)
router.post('/', create);


export default router;