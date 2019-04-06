var MongoClient = require('mongodb').MongoClient;


/***************************************
Program Description:

User chooses type of transaction
User inputs transaction amount
Record transaction as double-entry to ledger
Present ledger in format familiar to accountants
***************************************/

/***************************************
Resources:
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference
https://mongodb.github.io/node-mongodb-native/
https://docs.mongodb.com/manual/
***************************************/

var Company = function(name, database) {
  this.name = name;
  this.ledger = database.getTable('Ledger');
  this.accounts =
    [new Account('Cash','Assets')
      , new Account('Inventory', 'Assets')
      , new Account('Owner\'s Equity','Owner\'s Equity')
      , new Account('Accounts Payable', 'Liabilities')
      , new Account('Loans Payable', 'Liabilities')
      , new Account('Sales', 'Revenue')
      , new Account('Cost of Goods Sold', 'Expenses')]
}

var TransactionType = function(name, debitAccount, creditAccount) {
  this.name = name;
  this.debitAccount = debitAccount.name;
  this.creditAccount = creditAccount.name;
}

var Database = function(server_url, databaseName) {
  this.server_url = server_url
  this.name = databaseName;
  this.client;
};

Database.prototype.openConnection = async function() {
  this.client = await new MongoClient(this.server_url).connect();
}

Database.prototype.closeConnection = async function() {
  await this.client.close();
}

Database.prototype.getTable = function(table) {
  return new DatabaseTable(this, table);
}

var DatabaseTable = function(database,tableName) {
  this.name = tableName;
  this.database = database;
  this.client = database.client;
};

DatabaseTable.prototype.insertOne = async function(data) {
  var databaseName = this.database.name;
  var collectionName = this.name;
  var client = this.database.client;

  var collection = await client.db(databaseName).collection(collectionName);
  await collection.insertOne(data);
}

DatabaseTable.prototype.insertMany = async function(data) {
  var databaseName = this.database.name;
  var collectionName = this.name;
  var client = this.database.client

  var collection = await client.db(databaseName).collection(collectionName);
  await collection.insertMany(data);
}

DatabaseTable.prototype.drop = async function() {
  var databaseName = this.database.name;
  var collectionName = this.name;
  var client = this.database.client;

  var collection = await client.db(databaseName).collection(collectionName);
  await collection.drop();
}

DatabaseTable.prototype.select = async function(filter) {
  var databaseName = this.database.name;
  var collectionName = this.name;
  var client = this.database.client;

  var collection = await client.db(databaseName).collection(collectionName);
  return await collection.find(filter).toArray();
}

var Accountant = function(name, company) {
  this.name = name;
  this.company = company;
}

var Account = function(name, category) {
  this.name = name;
  this.category = category;
}

Accountant.prototype.recordTransaction = async function(transactionType, amount, dateTime) {
  //record transaction in ledger
  var doubleBooking =
    {'debit':{'Account':transactionType.debitAccount, 'Change':'Debit','Amount':amount, 'DateTime':new Date(dateTime)}
      ,'credit':{'Account':transactionType.creditAccount, 'Change':'Credit', 'Amount':amount, 'DateTime':new Date(dateTime)}};

  await this.company.ledger.insertOne(doubleBooking);
}

Accountant.prototype.balanceAccount = async function(account, date) {

  var currentDate = date.getDate();
  var currentMonth = date.getMonth();
  var currentYear = date.getFullYear();
  var date_add_day = new Date(currentYear, currentMonth, currentDate + 1);

  var ledger_records = await this.company.ledger.select({'credit.DateTime':{$lte: date_add_day}});

  var ledger_records_2 = ledger_records.map(element =>{
    var result = {
      debitAccount:element.debit.Account
      , debitAmount:element.debit.Amount
      , creditAccount:element.credit.Account
      , creditAmount:element.credit.Amount}

    return result
    }
  );

  var ledger_records_debit_filter = ledger_records_2.filter(element => {return element.debitAccount == account.name});
  var ledger_sum_debits = ledger_records_debit_filter.reduce((acc,curr) => acc + curr.debitAmount, 0);

  var ledger_records_credit_filter = ledger_records_2.filter(element => {return element.creditAccount == account.name});
  var ledger_sum_credits = ledger_records_credit_filter.reduce((acc,curr) => acc + curr.creditAmount, 0);

  if (account.category == 'Owner\'s Equity'
    || account.category == 'Liabilities'
    || account.category == 'Revenue') {
    return ledger_sum_credits - ledger_sum_debits;
  }

  if (account.category == 'Assets'
    || account.category == 'Expenses') {
    return ledger_sum_debits - ledger_sum_credits;
  }
}

Accountant.prototype.getBalanceSheet = async function(date) {
  //see this post on using async/await with array.map() https://medium.com/@ian.mundy/async-map-in-javascript-b19439f0099
  var mapper =  async function(element) {
    account_balance = await this.balanceAccount(element,date)
    var results =
      {account_name:element.name
        , account_category:element.category
        , account_balance:account_balance}

    return results
  }.bind(this);

  var results = this.company.accounts.map(await mapper);

  results_1 = await Promise.all(results).then((completed) => completed);

  /***************************************
  For each account category
  Filter out all account balances in that account category
  Sum up all those balances
  ***************************************/

  var results_owner_equity = results_1.filter(element => element.account_category =='Owner\'s Equity');
  var results_assets = results_1.filter(element => element.account_category =='Assets');
  var results_liabilities = results_1.filter(element => element.account_category =='Liabilities');

  var liabilities_total = results_liabilities.reduce((acc,curr) => curr.account_balance + acc, 0);
  var assets_total = results_assets.reduce((acc,curr) => curr.account_balance + acc, 0);
  var owner_equity_total = results_owner_equity.reduce((acc,curr) => curr.account_balance + acc, 0);

  results_1.filter((element) => element.account_category=='Liabilities').forEach((element) => {element.account_category_total = liabilities_total});
  results_1.filter((element) => element.account_category=='Owner\'s Equity').forEach((element) => {element.account_category_total = owner_equity_total});
  results_1.filter((element) => element.account_category=='Assets').forEach((element) => {element.account_category_total = assets_total});

  /***************************************
  Reformat the array as follows:
    [ { account_name: 'Accounts Payable',
      account_category: 'Liabilities',
      account_balance: 0,
      account_category_balance: 0},
    ...]

  So that each array has an account_category_balance entry

  For each account category
    Print the balance for that account category
      For each account in that account category
        Print the balance for that account

  Output the results as follows:
    Assets Total: $32,400
      Inventory: $0
      Cash: $32,400
    Equity Total: $20,400
    Total Liabilities: $0
      Accounts Payable: $0
      Loans Payable: $0
  ***************************************/

  return results_1
}

module.exports.TransactionType = TransactionType;
module.exports.Company = Company;
module.exports.Accountant = Accountant;
module.exports.Account = Account;
module.exports.Database = Database;
