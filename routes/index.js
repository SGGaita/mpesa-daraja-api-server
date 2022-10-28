const express= require('express');
const router = express.Router();

//controllers
const mpesa = require('../controller/mpesa');

//route to get the auth token
router.get('/get-token',mpesa.mpesaToken);

//lipa na mpesa online 
router.post('/lipa-na-mpesa',mpesa.mpesaToken, mpesa.mpesaSTKPUSH);

//router.get('/lipa-na-mpesa-password',mpesaAPI.mpesaPassword);

//callback url
//router.post('/stk-push',mpesaAPI.lipaNaMpesaOnlineCallBack)

module.exports = router;