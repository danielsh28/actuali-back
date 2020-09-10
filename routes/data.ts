import express from 'express';
import { insertToDB } from '../monitor-data/data.service.db';

const router = express.Router();
router.post('/', (req, res) => {
  insertToDB(req.body);
});

export default router;
