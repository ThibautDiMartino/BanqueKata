const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { depositValidation, withdrawalValidation } = require('./validation');
var fs = require('fs');
const { validationResult } = require('express-validator');

const port = process.env.port || 3000;
const app = express();

app.use(express.json());

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
    extended: true
}));

app.listen(port, () => {
    console.log(`Listenning on port: ${port}`);
});

app.post('/deposit', depositValidation, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    fs.readFile('accounts.json', 'utf8', function (err, data) {
        if (err) {
            res.status(409).json({
                method: "Deposit",
                status: "Failure",
                error: "Account retrieval failed"
            });
        } else {
            const currentData = JSON.parse(data);
            let bankingHistory = currentData.history;
            const balance = currentData.balance + req.body.amount;
            let newAction = {
                action: "deposit",
                amount: req.body.amount,
                balance: balance,
                date: Date.now()
            };
            bankingHistory.push(newAction);
            const newData = {
                balance: balance,
                history: bankingHistory
            }
            fs.writeFile('./accounts.json', JSON.stringify(newData), 'utf8', (err) => {
                if (err) {
                    res.status(409).json({
                        method: "Deposit",
                        status: "Failure",
                        error: "Account update failed"
                    });
                }
            });
            res.status(200).json({
                method: "Deposit",
                status: "Success",
                amount: req.body.amount,
                newBalance: balance
            });
        }
    });
});

app.post('/withdrawal', withdrawalValidation, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    fs.readFile('accounts.json', 'utf8', function (err, data) {
        if (err) {
            res.status(409).json({
                method: "Withdrawal",
                status: "Failure",
                error: "Account retrieval failed"
            });
        } else {
            const currentData = JSON.parse(data);
            if (req.body.amount > currentData.balance) {
                res.status(202).json({
                    method: "Withdrawal",
                    status: "Aborted",
                    error: "Not enough founds"
                });
            } else {
                let bankingHistory = currentData.history;
                const balance = currentData.balance - req.body.amount;
                let newAction = {
                    action: "withdrawal",
                    amount: req.body.amount,
                    balance: balance,
                    date: Date.now()
                };
                bankingHistory.push(newAction);
                const newData = {
                    balance: balance,
                    history: bankingHistory
                }
                fs.writeFile('./accounts.json', JSON.stringify(newData), 'utf8', (err) => {
                    if (err) {
                        res.status(409).json({
                            method: "Withdrawal",
                            status: "Failure",
                            error: "Account update failed"
                        });
                    }
                });
                res.status(200).json({
                    method: "Withdrawal",
                    status: "Success",
                    amount: req.body.amount,
                    newBalance: balance
                });
            }
        }
    });
});

app.get('/history', (req, res) => {
    fs.readFile('accounts.json', 'utf8', function (err, data) {
        if (err) {
            res.status(409).json({
                method: "Withdrawal",
                status: "Failure",
                error: "Account retrieval failed"
            });
        } else {
            let banking = JSON.parse(data);
            res.status(200).send(banking.history);
        }
    });
});

app.use(express.static('public'));
app.use(cors());