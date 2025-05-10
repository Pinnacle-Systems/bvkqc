import { Router } from 'express';
const router = Router();
import { get, getOne, getSearch, create, update, remove, uploadBillProofImage, upload, attach } from '../controllers/orderEntry.controller.js';
import multerUpload, { multerUploadForGrid } from '../utils/multerUpload.js';


router.post('/', multerUploadForGrid.array('images'), create);

// router.post('/', create);

router.patch('/uploadBillProofImage/:id', multerUpload.fields([{ name: 'images' }]), uploadBillProofImage);

router.get('/', get);

router.get('/:id', getOne);

router.get('/search/:searchKey', getSearch);

// router.put('/:id', update);
router.put('/:id', multerUploadForGrid.array('images'), update);

router.post('/upload', multerUpload.single('file'), upload);

router.post('/attach', multerUpload.single('file'), attach);



router.delete('/:id', remove);

export default router;