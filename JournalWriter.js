/***************************************
Program Description:

User chooses type of transaction
User inputs transaction amount
Record transaction as double-entry to ledger
Present ledger in format familiar to accountants
***************************************/

//Defining Program Classes
var TransactionType = function(name, debitAccount, creditAccount) {
  this.name = name;
  this.debitAccount = debitAccount.name;
  this.creditAccount = creditAccount.name;
}

var Company = function(name) {
  this.name = name;
  this.ledger = [];
}

var Accountant = function(name, company) {
  this.name = name;
  this.company = company;
}

var Account = function(name, category) {
  this.name = name;
  this.category = category;
}

Accountant.prototype.recordTransaction = function(transactionType, amount) {
  //get current transactionID
  var lastTransaction = this.company.ledger[this.company.ledger.length - 1];
  if (lastTransaction != undefined) {
    var transactionID = lastTransaction.TransactionID + 1;
  } else {
    var transactionID = 1;
  }

  //record transaction in ledger
  var transaction =
    {'debit':{'TransactionID':transactionID, 'Account':transactionType.debitAccount, 'Change':'Debit','Amount':amount}
      ,'credit':{'TransactionID':transactionID, 'Account':transactionType.creditAccount, 'Change':'Credit', 'Amount':amount}};

  this.company.ledger.push(transaction.debit);
  this.company.ledger.push(transaction.credit);
}

module.exports.TransactionType = TransactionType;
module.exports.Company = Company;
module.exports.Accountant = Accountant;
module.exports.Account = Account;
