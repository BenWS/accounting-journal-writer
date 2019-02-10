var readLine = require('readline-sync'); //https://www.npmjs.com/package/readline-sync
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
var costOfGoodsSold = new Account('Cost of Goods Sold', 'Expenses');

var cashSale = new TransactionType('Cash Sale', cash, sales);
var ownerInvestment = new TransactionType('Owner Investment', cash, ownersEquity);
var inventoryPurchase = new TransactionType('Inventory Purchase', inventory, cash)
var costOfGoodsSold = new TransactionType('Cost of Goods Sold', costOfGoodsSold, inventory);
var buildingRent = new TransactionType('Building Rent', cash, ownersEquity);

var main = async function() {
  //Main Execution
  var server_url = 'mongodb://localhost:27017';
  var database = new Database(server_url, 'Accounting');
  var company = new Company('Furniture by Ben', database);
  var accountant = new Accountant('Ben', company);

  // var startingEquity = readLine.question('Please state your starting amount in U.S. dollars: ');

  var startingEquity = 5000;
  var startingLiabilities = 0;
  var startingAssets = startingEquity + startingLiabilities;

  var currentEquity = startingEquity;
  var currentLiabilities = startingLiabilities;
  var currentAssets = currentEquity + currentLiabilities;

  var rentAmount = 800;
  var retailAmount = 3;
  var costOfGoodAmount = 2;
  var salesAmount;
  var quantitySold;


  var currentDate = new Date('1/1/2019');
  /***************************************
  allow user to input sales
  record rent transasction
  record Inventory Purchase transaction
  record Cost of Goods Sold transaction
  ***************************************/

  await accountant.recordTransaction(buildingRent, rent, '1/1/2019');

  while(true) {
    quantitySold = readLine.question('Quantity product sold for the month of January: ');
    sales = quantitySold * retailAmount;
    costOfGoods = quantitySold * costOfGood;

    if (currentEquity < costOfGoodsSold) {
      console.log('You do not have enough equity invested to cover the cost of goods sold for the provided amount.\r\nPlease enter a valid amount.');
      
    } else {
      await accountant.recordTransaction(inventoryPurchase, costOfGoods, '1/1/2019');
      await accountant.recordTransaction(cashSale,sales,'1/1/2019');
      await accountant.recordTransaction(costOfGoodsSold, costOfGoods, '1/1/2019');
    }
  }
}

main();
