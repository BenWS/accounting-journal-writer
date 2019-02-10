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
***************************************/

var Company = function(name, database) {
  this.name = name;
  this.ledger = database.getTable('Ledger');
}

var TransactionType = function(name, debitAccount, creditAccount) {
  this.name = name;
  this.debitAccount = debitAccount.name;
  this.creditAccount = creditAccount.name;
}

var Database = function(server_url, databaseName) {
  this.server_url = server_url
  this.name = databaseName;
};

Database.prototype.getTable = function(table) {
  return new DatabaseTable(this, table);
}

var DatabaseTable = function(database,tableName) {
  this.name = tableName;
  this.database = database;
};

DatabaseTable.prototype.insertOne = function(data) {
  var client = new MongoClient(this.database.server_url);
  client.connect((err, client) => {
    var databaseName = this.database.name;
    var collectionName = this.name;
    var collection = client.db(databaseName).collection(collectionName);
    collection.insertOne(data);
    client.close();
  })
}

DatabaseTable.prototype.insertMany = function(data) {
  var client = new MongoClient(this.database.server_url);
  client.connect((err, client) => {
    var databaseName = this.database.name;
    var collectionName = this.name;
    var collection = client.db(databaseName).collection(collectionName);
    collection.insertMany(data);
    client.close();
  })
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
      ,'credit':{'Account':transactionType.creditAccount, 'Change':'Credit', 'Amount':amount}, 'DateTime':new Date(dateTime)};

  await this.company.ledger.insertOne(doubleBooking);
}

Accountant.prototype.recordBulkTransaction = async function(transactionArray) {
  var doubleBookingArray = transactionArray.map((transaction) => {
    var doubleBooking = {'debit':{'Account':transaction.type.debitAccount, 'Change':'Debit','Amount': transaction.amount, 'DateTime': new Date(transaction.dateTime)}
      ,'credit':{'Account':transaction.type.creditAccount, 'Change':'Credit', 'Amount':transaction.amount}, 'DateTime': new Date(transaction.dateTime)};

    return doubleBooking;
  });

  await this.company.ledger.insertMany(doubleBookingArray);
}

module.exports.TransactionType = TransactionType;
module.exports.Company = Company;
module.exports.Accountant = Accountant;
module.exports.Account = Account;
module.exports.Database = Database;
