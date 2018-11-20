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
//You may need to modify the following, depending on whether you have deployed the Quorum blockchain.
web3 = new Web3(new Web3.providers.HttpProvider("http://0.0.0.0:22000"));
//Note that in this example we are only connecting to one blockchain node. In deployment you need to make sure that you connect to multiple nodes, otherwise your deployment will represent a centralised system!
web3.eth.defaultAccount = web3.eth.accounts[0];
//replace this address:
var contractAddress = '0x1349f3e1b8d71effb47b840594ff27da7e603d17';

var interface = [{"constant":true,"inputs":[],"name":"storedData","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"x","type":"uint256"}],"name":"set","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"get","outputs":[{"name":"retVal","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"initVal","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"}];


app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
  res.render('index', {voteIs: null, error: null});
})

app.get('/getVote', function (req, res) {
	console.log('Inside GET');
	getProposal(req	, res);
})


function getProposal(req, res){

	console.log('Getting vote');
	var contract = web3.eth.contract(interface);
	  console.log('contractAddress: ' + contractAddress);
	var instance = contract.at(contractAddress);
	 instance.get.call(function(err, result) {
	    if(err) {
		console.log(err);
	res.render('index', {voteIs: null, error: null});
	    } else {
		console.log("Winning proposal is: " + result.toNumber());
	  let voteText = result.toNumber();
	  res.render('index', {voteIs: voteText, error: null});

	    }
	})
}

app.post('/', function (req, res) {
  console.log('Inside SET');
  //res.render('index');
  if (typeof req.body.voteNum != 'undefined'){
	//this is to call a function on this contract (vote)
	console.log('Post occurred with (voteNum): ' + req.body.voteNum);	
	console.log('Building vote transaction');	
	var contract = web3.eth.contract(interface);
	console.log('contract: ' + contract);
	console.log('contractAddress: ' + contractAddress);
	var instance = contract.at(contractAddress);
	console.log('instance: ' + instance);	
	instance.set(req.body.voteNum, {gas: 6000000}, function(error, result){
					if (!error) {
						var num = result;
						console.log('sent the change, response: ' + num);
getProposal(req, res);
				} else {
						console.log('ERROR when sending the vote: ' + error);
	res.render('index', {voteIs: "error getting vote", error: null});

				}
	});


        
  } else {
	  console.log('voteNum is not undefined');
	res.render('index', {voteIs: "you must vote", error: null});	
  }
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
