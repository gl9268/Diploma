// npm remove package-lock.json

const { spawn } = require('child_process');
const np = require('numjs')
const { readFile } = require('fs/promises');
const { appendFile } = require('fs/promises');
const { join } = require('path');


var input_string = "String."
const inputS = "asdasdasdasdasdsadad";
const pitchP =  null //[-0.5,0.2,0.3,0.4,0.1,0.2,0.3,0.4,0.1,0.2,0.3,0.4];
 const dursP = null // [0.1,0.2,0.3,0.4,0.1,0.2,0.3,0.4,0.1,0.2,0.3,0.4];

/* GET home page */
const index = function(req, res){
  res.render('index', { 
    title: 'Pitch adjustment'
  });
};

module.exports = {
    index,
};