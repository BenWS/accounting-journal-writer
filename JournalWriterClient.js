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

function question_slider(question, max_value) {
  /*Code adapted from that suggested at https://www.npmjs.com/package/readline-sync
    See section beginning with 'An UI like Range Slider...'
  */
  var MAX = 60;
  var MIN = 0;
  var value = 30;
  var key;

  console.log('\n\n' + question);
  console.log('\n\n ' + (new Array(20)).join(' ') +
    '[Z] <- -> [X]  FIX: [SPACE]\n');

  while (true) {
    console.log('\x1B[1A\x1B[K|' + (new Array(value + 1)).join('-') + 'O' + (new Array(MAX - value + 1)).join('-') + '| ' + (value/60 )* max_value);
    key = readLine.keyIn('', {hideEchoBack: true, mask: '', limit: 'zx '});

    if (key === 'z') {
        if (value > MIN) { value--; }
    } else if (key === 'x') {
      if (value < MAX) { value++; }
    }
    else { break; }
  }
  return (value/60 )* max_value;
}

var main = async function() {
  //Main Execution
  var server_url = 'mongodb://localhost:27017';
  var database = new Database(server_url, 'Accounting');
  var company = new Company('Furniture by Ben', database);
  var accountant = new Accountant('Ben', company);

  var salesAmount;
  var quantitySold;

  var startingEquity = question_slider('Your business\'s starting investment (in US $): ', 20000);
  var rentAmount = question_slider('Your business\'s monthly building rent expense (in US $): ', 3000);
  var itemName = readLine.question('Name of item being sold: ');
  var itemRetail = question_slider(`How much is your business selling each ${itemName} for (in US $)?`, 6)
  var itemCost = question_slider(`How much is your business buying each ${itemName} for (in US $)?`, 6);

  var currentYear = (new Date(Date.now())).getFullYear();
  var currentDate = new Date(currentYear , 0);
  console.log(currentDate);
  var monthNames =
    ['January', 'February', 'March', 'April'
      , 'May', 'June', 'July', 'August', 'September'
      , 'October', 'November', 'December']

  await database.openConnection();
  await company.ledger.drop();

  while (currentDate.getFullYear() == currentYear) {
      quantitySold = question_slider('Quantity product sold for the month of ' + monthNames[currentDate.getMonth()] + ': ', 1000);

      sales = quantitySold * itemRetail;
      costOfGoods = quantitySold * itemCost;

      await accountant.recordTransaction(buildingRent, rentAmount, currentDate);
      await accountant.recordTransaction(inventoryPurchase, costOfGoods, currentDate);
      await accountant.recordTransaction(cashSale,sales,currentDate);
      await accountant.recordTransaction(costOfGoodsSold, costOfGoods, currentDate);

      currentDate.setMonth(currentDate.getMonth() + 1);
  }
  //print the balance sheet
  console.log('Balance Sheet: ')
  console.log(await accountant.getBalanceSheet(currentDate));

  await database.closeConnection();
}

main();
