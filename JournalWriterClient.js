var main = async function() {

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
  var sales = new Account('Sales', 'Revenue')


  //Main Execution
  var cashSale = new TransactionType('Cash Sale', cash, sales);
  var ownerInvestment = new TransactionType('Owner Investment', cash, ownersEquity);
  var bankLoan = new TransactionType('Bank Loan', cash, loansPayable);

  var server_url = 'mongodb://localhost:27017';
  var database = new Database(server_url, 'Accounting');
  var company = new Company('Furniture by Ben', database);
  var accountant = new Accountant('Ben', company);

  await accountant.recordTransaction(cashSale, 3);
  await accountant.recordTransaction(ownerInvestment, 500);
  await accountant.recordTransaction(cashSale, 3);
  await accountant.recordTransaction(cashSale, 7);

}

main();
