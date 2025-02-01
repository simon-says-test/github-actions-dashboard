import express from 'express';
import config from '../../src/config.js';

const createConfigRoutes = () => {
  const router = express.Router();

  router.get('/', (req, res) => {
    res.json(config);
  });

  return router;
};

export default createConfigRoutes;
