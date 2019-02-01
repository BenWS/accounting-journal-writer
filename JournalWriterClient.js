var readline = require('readline-sync');
var journalWriter = require('./JournalWriter.js');

var TransactionType = journalWriter.TransactionType;
var Company = journalWriter.Company;
var Accountant = journalWriter.Accountant;
var Account = journalWriter.Account;
var Database = journalWriter.Database;

var cash = new Account('Cash','Assets');
var inventory = new Account('Inventory', 'Assets')
var ownersEquity = new Account('Owner\'s Equity','Owner\'s Equity');
var accountsPayable = new Account('Accounts Payable', 'Liabilities');
var loansPayable = new Account('Loans Payable', 'Liabilities');
var sales = new Account('Sales', 'Revenue');

var cashSale = new TransactionType('Cash Sale', cash, sales);
var ownerInvestment = new TransactionType('Owner Investment', cash, ownersEquity);
var bankLoan = new TransactionType('Bank Loan', cash, loansPayable);

var main = async function() {
  //Main Execution
  var server_url = 'mongodb://localhost:27017';
  var database = new Database(server_url, 'Accounting');
  var company = new Company('Furniture by Ben', database);
  var accountant = new Accountant('Ben', company);

  var transactionArray = [
    {type:cashSale,amount:3,dateTime:'1/1/2019'}
    , {type:ownerInvestment,amount:500,dateTime:'1/3/2019'}
    , {type:cashSale,amount:3,dateTime:'1/7/2019'}
    , {type:cashSale,amount:7,dateTime:'1/9/2019'}
  ]

  await accountant.company.ledger.insertMany(transactionArray)
}

main();
