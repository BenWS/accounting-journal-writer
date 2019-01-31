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

DatabaseTable.prototype.insert = function(data) {
  var client = new MongoClient(this.database.server_url);
  client.connect((err, client) => {
    var databaseName = this.database.name;
    var collectionName = this.name;
    var collection = client.db(databaseName).collection(collectionName);
    collection.insertOne(data);
    client.close();
  })
}

DatabaseTable.prototype.selectLast = async function() {
  var client = new MongoClient(this.database.server_url);
  await client.connect();
  var databaseName = this.database.name;
  var collectionName = this.name;
  var collection = client.db(databaseName).collection(collectionName);
  var result = await collection.find({}).sort('_id',-1).limit(1).toArray();
  await client.close();
  return result[0]
}

var Accountant = function(name, company) {
  this.name = name;
  this.company = company;
}

var Account = function(name, category) {
  this.name = name;
  this.category = category;
}

Accountant.prototype.recordTransaction = async function(transactionType, amount) {
  //get current transactionID
  var transactionID;
  var lastTransaction = await this.company.ledger.selectLast();
  if (lastTransaction == undefined) {
    transactionID = 0
  } else {
    transactionID = lastTransaction.TransactionID + 1;
  }

  //record transaction in ledger
  var transaction =
    {'debit':{'TransactionID':transactionID, 'Account':transactionType.debitAccount, 'Change':'Debit','Amount':amount}
      ,'credit':{'TransactionID':transactionID, 'Account':transactionType.creditAccount, 'Change':'Credit', 'Amount':amount}};

  this.company.ledger.insert(transaction.debit);
  this.company.ledger.insert(transaction.credit);
}

module.exports.TransactionType = TransactionType;
module.exports.Company = Company;
module.exports.Accountant = Accountant;
module.exports.Account = Account;
module.exports.Database = Database;
