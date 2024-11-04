const express = require('express');
const { generateContent  } = require('../controllers/ia.controller');

const router = express.Router();

router.post('/stream-stats', generateContent );

module.exports = router;