const express = require('express');
const { checkEmail } = require('../emailValidator');

const app = express();
const port = 3000;

app.use(express.json());

app.post('/validate-email', (req, res) => {
    const email = req.body.email;
    if (!email) {
        res.status(400).send('Email is required');
        return;
    }

    console.log(`Checking email: ${email}`);
    checkEmail(email, (result) => {
        if (!res.headersSent) {
            console.log(`Result for ${email}: ${result}`);
            res.send({ email, result });
        }
    });
});

app.listen(port, () => {
    console.log(`Email validation server running at http://localhost:${port}`);
});


const express = require('express');
const { checkEmail } = require('../emailValidator');
