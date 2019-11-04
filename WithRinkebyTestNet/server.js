//generic imports for the server:
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express()
//Ethereum specific imports
var Web3 = require('web3');
var util = require('ethereumjs-util');
var tx = require('ethereumjs-tx');
var lightwallet = require('eth-lightwallet');
var txutils = lightwallet.txutils;

//Put your Ethereum account address here:
var address = '...';
//Put your Ethereum account private key here:
var key = '...'; //NOTE IF YOU SHARE THIS CODE WITH ANYONE YOUR ACCOUNT IS VUNERABLE - PLEASE ONLY USE A TEST ACCOUNT
//The Ethereum contract address to interact with (deployed on the Ropsten testnet):
var contractAddress = '0x3aD4D07942d924a247b6e1c09cfE0a0D0e18AB27';

//The Solidity contract interface
var interface = [{"constant":false,"inputs":[{"name":"to","type":"address"}],"name":"delegate","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"winningProposal","outputs":[{"name":"_winningProposal","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"toVoter","type":"address"}],"name":"giveRightToVote","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"toProposal","type":"uint8"}],"name":"vote","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_numProposals","type":"uint8"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"}];

//setting up the server:
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')

//server is listening at http://localhost:3000/
app.listen(3000, function () {

	console.log('Example app listening on port 3000!')

})

//loading webpage http://localhost:3000/ will give the generic webpage index.ejs:
app.get('/', function (req, res) {

	console.log('Loading generic webpage');
	res.render('index', {voteIs: null, info: null});

})

//loading webpage http://localhost:3000/getVote will return the webpage with information on the vote stored in the smart contract
app.get('/getVote', function (req, res) {

	console.log('Getting vote to display on webpage');
	//now lets nominate our provider for the blockchain interaction functionality:	
	const web3 = new Web3(
		//we will use the infura servers connected to the Ropsten Ethereum testnet
    		new Web3.providers.HttpProvider('https://ropsten.infura.io/')
	);

	//now lets load the interface of the smart contract	
	const contract = web3.eth.contract(interface);
	//and create an instantiation of this contract, pointing to the one deployed at the address you provided
	const instance = contract.at(contractAddress);
	
	//lets call this a getter function from this contract
	instance.winningProposal.call(function(err, result) {
		if(err) {
			//there was an error when calling the function...
			console.log("error when calling the winningProposal function: " + err);
			//so lets inform the user via the user interface
			res.render('index', {voteIs: null, info: err});
	    	} else {
			//the function call proceeded correctly
			console.log("the winning proposal function returned: " + result.toNumber());
			//so lets inform the user of this via the user interface	  		
			const voteText = result.toNumber();
	  		res.render('index', {voteIs: 'The winning option is: ' + voteText, info: null});
	    	}
	});
})

//posting to http://localhost:3000 will add the user's new vote to the website. 
//NOTE THAT I INSTANTIATED THE PROVIDED CONTRACT ADDRESS WITH ONLY 10 OPTIONS
app.post('/', function (req, res) {
		
	console.log('Post occurred with (voteNum): ' + req.body.voteNum);
	
	if (typeof req.body.voteNum != 'undefined'){
		//again we nominate our provider for the blockchain interaction functionality:
		var web3 = new Web3(
			//again we will use the infura servers connected to the Ropsten Ethereum testnet
  			new Web3.providers.HttpProvider('https://ropsten.infura.io/')
		);	
		//now we build the Ethereum transaction options:
		var txOptions = {
			//Each address has an associated nonce value. It must increment after a new tx is included in the blockchain from this address
			nonce: web3.toHex(web3.eth.getTransactionCount(address)),
			//Gas Limit - a limit on the total gas you can spend for this transaction
			gasLimit: web3.toHex(800000),
			//Gas Price - Cost of executing each piece of code.
			//NOTE THAT GAS LIMIT IS USING GWEI AND GAS PRICE IS USING WEI DENOMINATION
			gasPrice: web3.toHex(20000000000),
			//of course the transaction is being sent to your address
			to: contractAddress
		}
		//now lets build the transaction. We have the contract interface, followed by the function name, an array of the function arguments and the transaction options
		var rawTx = txutils.functionTx(interface, 'vote', [req.body.voteNum], txOptions);
		//its time to sign the transaction. Note that this is occuring before the transaction has been sent to the blockchain interaction provider.		
		console.log('signing transaction');
		var privateKey = new Buffer(key, 'hex');
		var transaction = new tx(rawTx);
		transaction.sign(privateKey);
		
		//ok we have the signed transaction, so lets send it
		console.log('signing transaction');
		var serializedTx = transaction.serialize().toString('hex');
		web3.eth.sendRawTransaction('0x' + serializedTx, function(err, result) {
			if(err) {
				//there was an error when sending the transaction...
				console.log("error when sending the transaction: " + err);
				//so lets inform the user via the user interface
				res.render('index', {voteIs: null, info: err});
			} else {
				//the function call proceeded correctly
				//you will be given the transaction hash, now to wait for the transaction to be mined
				console.log("transaction hash: " + result);
				//load the page back for the user -> remember you will have to wait for this transaction to be mined, why not check the transaction hash on Etherscan?
				res.render('index', {voteIs: null, info: "transaction hash: " + result});	
			}
		});
        
	} else {
		console.log('voteNum is not undefined');
		res.render('index', {voteIs: null, error: 'voteNumber is not undefined'});	
	}
})
