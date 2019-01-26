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
