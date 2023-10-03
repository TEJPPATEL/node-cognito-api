const authController = require('../authController');
const express = require('express');
const router = express.Router();


router.post("/signin", authController.signIn);
router.post("/signup", authController.signUp);
router.post("/verify/code", authController.verifyCode);


module.exports = router;