pragma solidity ^0.4.11;

contract LoanList {
  // Defines a new type with two fields.
  struct Funder {
    address addr;
    uint amount;
  }

  struct Loan {
    address beneficiary;
    uint goal; // 20000
    uint num_funders; // 1
    uint amount; // 0
    mapping (uint => Funder) funders;
  }

  uint public num_loans;
  mapping (uint => Loan) public loans;

  event Created(uint id, address indexed beneficiary, uint goal);
  event Contributed(uint indexed id, address indexed funder, uint amount);
  event Finalised(uint indexed id, uint amount);

  // function my_loans () returns (uint[] loans) {
  //   uint[] loans;
  //   for (var i = 0; i < num_loans; i++) {
  //
  //   }
  // }

  function create (address beneficiary, uint goal) returns (uint loan_id) {
    require(goal > 0);
    loan_id = num_loans++; // loan_id is return variable
    // Creates new struct and saves in storage. We leave out the mapping type.
    loans[loan_id] = Loan(beneficiary, goal, 0, 0);
    Created(loan_id, beneficiary, goal);
  }

  function contribute (uint loan_id) payable {
    Loan loan = loans[loan_id];
    // if (!loans[loan_id]) throw;
    require(loan.goal > 0);
    // Creates a new temporary memory struct, initialised with the given values
    // and copies it over to storage.
    // Note that you can also use Funder(msg.sender, msg.value) to initialise.
    uint amount = msg.value;
    if (loan.amount + amount > loan.goal) {
      uint refund = loan.amount + amount - loan.goal;
      amount -= refund;
      // msg.sender.send(refund);
      msg.sender.transfer(refund);
    }
    var funder = Funder({addr: msg.sender, amount: msg.value});
    loan.funders[loan.num_funders++] = funder;
    loan.amount += amount;

    Contributed(loan_id, funder.addr, funder.amount - refund);
  }

  function finalise (uint loan_id) returns (bool reached) {
    Loan loan = loans[loan_id];
    if (loan.amount < loan.goal)
      return false;
    uint amount = loan.amount;
    loan.amount = 0;
    loan.beneficiary.transfer(amount);
    Finalised(loan_id, amount);
    return true;
  }


}
