const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { depositValidation, withdrawalValidation } = require('./validation');
var fs = require('fs');

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
    fs.readFile('accounts.json', 'utf8', function (err, data) {
        if (err) {
            console.err(`Error reading account: ${err}`);
            res.send(`Deposit failure: ${err}`);
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
                    console.err(`Error writing file: ${err}`);
                } else {
                    console.log(`File is written successfully!`);
                }
            });
            res.send(`Deposit successful: amount = ${req.body.amount}, new balance = ${balance}`);
        }
    });
});

app.post('/withdrawal', withdrawalValidation, (req, res) => {
    fs.readFile('accounts.json', 'utf8', function (err, data) {
        if (err || isNaN(req.body.amount)) {
            console.err(`Error reading account: ${err}`);
            res.send(`Account retrieval failure: ${err}`);
        } else {
            const currentData = JSON.parse(data);
            if (req.body.amount > currentData.balance) {
                res.send(`Withdrawal failure: insufficient founds.`);
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
                        console.err(`Error writing file: ${err}`);
                    } else {
                        console.log(`Account updated successfully!`);
                    }
                });
                res.send(`Withdrawal successful: amount = ${req.body.amount}, new balance = ${balance}`);
            }
        }
    });
});

app.get('/history', (req, res) => {
    fs.readFile('accounts.json', 'utf8', function (err, data) {
        if (err) {
            console.err(`Error reading account: ${err}`);
        } else {
            let banking = JSON.parse(data);
            res.send(banking.history);
        }
    });
});

app.use(express.static('public'));
app.use(cors());