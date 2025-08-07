import { Router } from 'express';
const router = Router();
import { create,get,getReference } from '../controllers/sizeTable.js';

router.get('/',get)

router.get('/reference',getReference)

router.post('/', create);


export default router;