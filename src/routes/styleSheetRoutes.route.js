// src/routes/styleSheetRoutes.route.js
import { Router } from 'express';
import { 
  get, 
  getOne, 
  create, 
  update, 
  remove 
} from '../controllers/styleSheetController.js';

const router = Router();

router.post('/', create);
router.get('/', get);
router.get('/:id', getOne);
router.put('/:id', update);
router.delete('/:id', remove);

export default router;
