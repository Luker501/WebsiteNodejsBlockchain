#Walk through

Firstly, you will need to be familiar with the Quorum 7 node example [here](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet). 

You will need to startup the Quorum blockchain and deploy the SimpleStorage.sol contract.

Find the address of the deployed contract and add it to the following part of the server.js code:

```javascript
var contractAddress = '0x1349f3e1b8d71effb47b840594ff27da7e603d17';
```

Then, assuming you have the node binary installed, move to the command line and run:

```
node server.js
```

You will then be able to browse to [http://localhost:3000/](http://localhost:3000/) to interact with the Qourum blockchain
