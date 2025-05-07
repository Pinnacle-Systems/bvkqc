import { Router } from 'express';
const router = Router();
import { get, getOne, getSearch, create, update, remove, uploadBillProofImage,upload } from '../controllers/orderEntry.controller.js';
import multerUpload from '../utils/multerUpload.js';




router.post('/', create);

router.patch('/uploadBillProofImage/:id', multerUpload.fields([{ name: 'images' }]), uploadBillProofImage);

router.get('/', get);

router.get('/:id', getOne);

router.get('/search/:searchKey', getSearch);

router.put('/:id', update);

router.post('/upload', multerUpload.single('file'), upload);


router.delete('/:id', remove);

export default router;