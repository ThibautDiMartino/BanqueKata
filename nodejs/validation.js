const { check } = require('express-validator');
 
exports.depositValidation = [
    check('amount', 'Please enter a valid number').isNumeric()
]
 
exports.withdrawalValidation = [
    check('amount', 'Please enter a valid number').isNumeric()
]