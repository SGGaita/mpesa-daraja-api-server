const express = require('express');
//const router = express.Router();
const axios = require('axios')
require('dotenv').config()
const {
    db
} = require('../firebase')

const passkey = process.env.PASSKEY
const shortcode = process.env.SHORTCODE
const consumerKey = process.env.CONSUMERKEY
const consumerSecret = process.env.CONSUMERSECRET
const oauth_token_url = process.env.AUTH_URL
const stkURL = process.env.STK_URL

//generate timestamp
const current_timestamp = () => {
    let year = new Date().getFullYear();
    let month = new Date().getMonth();
    month = month < 10 ? `0${month}` : month;
    let day = new Date().getDay();
    day = day < 10 ? `0${day}` : day;
    let hour = new Date().getHours();
    hour = hour < 10 ? `0${hour}` : hour;
    let minute = new Date().getMinutes();
    minute = minute < 10 ? `0${minute}` : minute;
    let second = new Date().getSeconds();
    second = second < 10 ? `0${second}` : second;

    return `${year}${month}${day}${hour}${minute}${second}`;
};

//Generate new Mpesa password
const newPassword = () => {
    const passString = shortcode + passkey + current_timestamp()
    const base64EncodedPassword = Buffer.from(passString).toString('base64')

    return base64EncodedPassword
}

//Generate Mpesa password
const mpesaPassword = (req, res) => {
    res.send(newPassword())
}

const mpesaToken = async (req, res, next) => {
    const auth = 'Basic ' + Buffer.from(consumerKey + ":" + consumerSecret).toString("base64");
    const headers = {
        Authorization: auth,
    };

    await axios.get(oauth_token_url, {
        headers: headers,
    })
        .then((response) => {
            let data = response.data
            let access_token = data.access_token
            req.token = access_token;
            next();
        })
        .catch((error) => console.log(error));
}

//Initiate STK PUSH
const mpesaSTKPUSH = async (req, res) => {
    const token = req.token
    const headers = {
        Authorization: 'Bearer ' + token
    };

    let data = {
        "BusinessShortCode": '174379',
        "Password": newPassword(),
        "Timestamp": current_timestamp(),
        "TransactionType": "CustomerPayBillOnline",
        "Amount": req.body.amount,
        "PartyA": req.body.phoneNumber,
        "PartyB": '174379',
        "PhoneNumber": req.body.phoneNumber,
        "CallBackURL": "http://7584-41-215-57-230.ngrok.io",
        "AccountReference": "U Abiri",
        "TransactionDesc": 'Pay U Abiri fare'
    }


    axios.post(stkURL, data, {
        headers: headers
    })
        .then((response) => {
            res.send(response.data)
        })
        .catch((err) => {
            res.send({ message: err.response.data.errorMessage })
        })
}


module.exports = {
    mpesaPassword,
    mpesaToken,
    mpesaSTKPUSH
}