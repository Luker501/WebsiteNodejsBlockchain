pragma solidity ^0.5.0;

contract myBallot {

    uint[] tally;
    int optionNumber;

    /// Create a new ballot with $(_numProposals) different proposals.
    constructor(uint8 _numProposals) public {
        tally.length = _numProposals;
        optionNumber = _numProposals;
    }

    /// Give a single vote to proposal $(toProposal).
    function vote(uint8 toProposal) public {
        if (optionNumber < toProposal) return;
        tally[toProposal]++;
    }

    function winningProposal() public view returns (uint8 _winningProposal) {
        
        uint256 winningVoteCount = 0;
        for (uint8 option = 0; option < tally.length; option++){
            if (tally[option] > winningVoteCount) {
                winningVoteCount = tally[option];
                _winningProposal = option;
            }
            
        }
        
    }
}
