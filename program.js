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
  this.debitAccount = debitAccount;
  this.creditAccount = creditAccount
}

var Company = function(name) {
  this.name = name;
  this.ledger = [];
}

var Accountant = function(name, company) {
  this.name = name;
  this.company = company;
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


//Main Execution
var cashSale = new TransactionType('Cash Sale', 'Cash Assets', 'Sales');
var ownerInvestment = new TransactionType('Owner Investment', 'Cash Assets', 'Owner Equity');
var bankLoan = new TransactionType('Bank Loan', 'Cash Assets','Credit Loans Payable');
var bankStatementFee = new TransactionType('Bank Statement Fee', 'Bank Fees', 'Cash Assets');

var company = new Company('Furniture by Ben');
var accountant = new Accountant('Ben', company);

accountant.recordTransaction(cashSale, 3);
accountant.recordTransaction(ownerInvestment, 500);
accountant.recordTransaction(cashSale, 3);
accountant.recordTransaction(cashSale, 7);
