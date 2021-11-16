from flask import *
import json, time

error_to_catch = getattr(__builtins__,'FileNotFoundError', IOError)

app = Flask(__name__)

@app.route('/deposit', methods=['POST'])
def deposit():
    try:
        file = open("./accounts.json", "r+")
    except error_to_catch:
        return "Deposit failure: account not retrieveable."
    account = json.loads(file.read())
    amount = request.get_json()['amount']
    balance = account['balance'] + amount
    history = account['history']
    newAction = {
        "action": "deposit",
        "amount": amount,
        "balance": balance,
        "date": int(time.time())
    }
    history.append(newAction)
    newData = {
        "balance": balance,
        "history": history
    }
    file.seek(0)
    file.write(json.dumps(newData))
    file.truncate()
    file.close()
    return "Deposit successful: amount = " + str(amount) + ", new balance = " + str(balance)

@app.route('/withdrawal', methods=['POST'])
def withdrawal():
    try:
        file = open("./accounts.json", "r+")
    except error_to_catch:
        return "Deposit failure: account not retrieveable."
    account = json.loads(file.read())
    if request.get_json()['amount'] > account['balance']:
        return "Withdrawal failure: insufficient founds."
    amount = request.get_json()['amount']
    balance = account['balance'] - amount
    history = account['history']
    newAction = {
        "action": "withdrawal",
        "amount": amount,
        "balance": balance,
        "date": int(time.time())
    }
    history.append(newAction)
    newData = {
        "balance": balance,
        "history": history
    }
    file.seek(0)
    file.write(json.dumps(newData))
    file.truncate()
    file.close()
    return "Withdrawal successful: amount = " + str(amount) + ", new balance = " + str(balance)

@app.route('/history', methods=['GET'])
def history():
    try:
        file = open("./accounts.json", "r+")
    except error_to_catch:
        return "Deposit failure: account not retrieveable."
    account = json.loads(file.read())
    file.close()
    return account

if __name__ == '__main__':
    app.run(port=3000)