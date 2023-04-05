const exp = require("express").Router()
const bcrypt = require('bcrypt')
const users = require('../db')
const jwtToken = require('jsonwebtoken')
const { check, validationResult } = require('express-validator')
const { Router } = require("express")
exp.post('/signup', [
    check("email", "please provide a valid mail").isEmail(),
    check("password", "please provide a valid password greater than 6 character").isLength({
            min: 8
        })
], async (request, response) => {

    const email = request.body;
    const password = request.body;

    // validating email and password

    const error = validationResult(req)
    if (!error.isEmpty()) {
        return res.status(400).json({
            error: error.array()
        });
    }

    // validating wether is existed or not
    let user = users.find((user) => { //finding user from req.body
        return user.email == email;
    })
    if (user) {
        res.status(400).json({
            "err": [{
                    "massege": "this user is already existed"
                }
            ]
        })
    }

    const hashPassword = await bcrypt.hash(password, 10)//hashing the password given by user
    console.log(hashPassword)
    users.push({
        email,
        password: hashPassword
    })
    // console.log(users)
    const token = await jwtToken.sign({
        email               //details of user
    }, "lkjasdf", {        //secret key
        expiresIn: 36000
    })
    // console.log(email,password)
    res.json({
        token
    })
    // res.send("Auth is working")
})

exp.post('/login', async (req, res) => {
    const { password, email } = req.body
    let user = users.find((user) => {
        return user.email === email;
    })

    if (!user) {
        return res.status(400).json({
            "err": [
                {
                    "massege": "invalid Credentill, Please Register first"
                }
            ]
        })
    }

    let match = await bcrypt.compare(password, user.password)
    if (!match) {
        return res.status(400).json({
            "err": [
                {
                    "massege": "invalid Credentill"
                }
            ]
        })
    }

    const token = await jwtToken.sign({
        email
    }, "lkjasdf", {
        expiresIn: 36000
    })
    res.json({
        token
    })
})

exp.get('/', (req, res) => {
    res.json(users)

})

module.exports = exp;