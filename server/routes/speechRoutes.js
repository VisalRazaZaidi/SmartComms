// routes/speechRoutes.js
import express from "express";

const router = express.Router();

// Define your routes here
router.get("/", (req, res) => {
  res.send("Speech API endpoint");
});

export default router;



// ORIGINAL CODE
// const express = require('express');
// const { processSpeech } = require('../controllers/speechController');

// const router = express.Router();

// router.post('/speech-to-text', processSpeech);

// module.exports = router;

