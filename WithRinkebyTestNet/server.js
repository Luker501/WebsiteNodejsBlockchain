const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express()
var Web3 = require('web3');
var util = require('ethereumjs-util');
var tx = require('ethereumjs-tx');
var lightwallet = require('eth-lightwallet');
var txutils = lightwallet.txutils;

const apiKey = '*****************';
//Put your account address here:
var address = '...';
//Put your key here:
var key = '...';

var interface = [{"constant":false,"inputs":[{"name":"to","type":"address"}],"name":"delegate","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"winningProposal","outputs":[{"name":"_winningProposal","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"toVoter","type":"address"}],"name":"giveRightToVote","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"toProposal","type":"uint8"}],"name":"vote","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_numProposals","type":"uint8"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"}];

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')

app.get('/', function (req, res) {
  res.render('index', {voteIs: null, error: null});
})

app.get('/getVote', function (req, res) {
	console.log('Getting vote');
var web3 = new Web3(
    	new Web3.providers.HttpProvider('https://rinkeby.infura.io/')
	);
var contract = web3.eth.contract(interface);
//Put the contract address here:
var contractAddress = '...';
var instance = contract.at(contractAddress);
instance.winningProposal.call(function(err, result) {
    if(err) {
        console.log(err);
res.render('index', {voteIs: null, error: null});
    } else {
        console.log(result.toNumber());
  let voteText = result.toNumber();
  res.render('index', {voteIs: voteText, error: null});
    }
});
})

app.post('/', function (req, res) {
  res.render('index');
  console.log('Post occurred with (voteNum): ' + req.body.voteNum);
  if (typeof req.body.voteNum != 'undefined'){
  	var web3 = new Web3(
    	new Web3.providers.HttpProvider('https://rinkeby.infura.io/')
	);
	//this is to call a function on this contract (vote)
	  console.log('Building vote transaction');	
	//Put the contract address here:
	var contractAddress = '0xC8b2501DC3E173864ce344c75D9b48202117979e';
	var txOptions = {
	    nonce: web3.toHex(web3.eth.getTransactionCount(address)),
	    gasLimit: web3.toHex(800000),
	    gasPrice: web3.toHex(20000000000),
	    to: contractAddress
	}
	var rawTx = txutils.functionTx(interface, 'vote', [req.body.voteNum], txOptions);
	  console.log('sending vote transaction');
	var privateKey = new Buffer(key, 'hex');
	    var transaction = new tx(rawTx);
	    transaction.sign(privateKey);
	    var serializedTx = transaction.serialize().toString('hex');
	    web3.eth.sendRawTransaction(
	    '0x' + serializedTx, function(err, result) {
		if(err) {
		    console.log(err);
		} else {
		    console.log(result);
			console.log("result" + result);		
		}
	    });
res.render('index', {voteIs: null, error: null});
        
  } else {
	  console.log('voteNum is not undefined');
res.render('index', {voteIs: null, error: null});	
  }
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
