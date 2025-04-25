const { spawn } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const { log } = require('console');
// import spawn from 'child_process';
// import readline from 'readline';
// import fs from 'fs'; 
// import cors from 'cors';
// import express from 'express';


let programState;
let child;
// get values for params






const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});



// rl.on("line",(data) => { // next cycle button (stop button is same but will write 2 instead)
//     if (data.toString().length == 0){
//         child.stdin.write('1' + '\n');
//         setTimeout(() => {
//             fs.readFile('dumpster.txt', 'utf8', (err, file) => {
//                 if (err) {
//                     console.error('Error reading file:', err);
//                     return;
//                 }
//                 const cleaned = file.replace(/[\u0000-\u001F]/g, '');
//                 programState = JSON.parse(cleaned);
//             });
//         }, 200); 
//     }
// });







// fs.close(data, (err) => {
//     if (err) throw err;
//     console.log('File closed successfully.');
//   });


const app = express();
app.use(cors());
app.use(express.json());
let childExited = false;

// Define a GET route
app.post('/spawn', (req, res) => {
  console.log("HELLO")
  console.log(Object.values(req.body));
  child = spawn('./a.out', Object.values(req.body));
  childExited = false;
  child.stderr.on('data', (data) => {
    console.error(`[C Error]: ${data}`);
  });
  child.on('close', (code) => {
    console.log("im boutaa pull out")
    res.send({stdout: `child process exited with code ${code}`, data :programState});
    childExited = true
    child.kill();
    
  });
  

});


app.post('/input', (req, res) => {
  let input = req.body
  if(data.toString().length != 0){
    child.stdin.write(input + '\n');
  }

});

let output = "";
app.post('/simulate', (req, res) => {
  if (childExited){

    return
  }
  let flag1 = true;
  let flag2 = true;

  let input = req.body.input
  console.log(input)
  let dadata = ""
  
  child.stdout.on('data', (data) => {
    console.log("i have penetrated the childstdout")
      dadata = data.toString().trim()
      if (flag1 && !input){
        console.log(data.toString().trim())
        output += "OUTPUT DETECTEDDDD\n";

        
        output += data.toString().trim() + "\n";
        flag1 = false;
      }
      
    });

      if (input){
          
        if(flag2){

          console.log(`the input ${input} has been gobbled"`)
          child.stdin.write(input + '\n');
          flag2 = false;
        }
        
            
      }
      if (!input) {
        console.log("boutaa one all over")
        child.stdin.write('1' + '\n');
      }
      
      setTimeout(() => {
          fs.readFile('dumpster.txt', 'utf8', (err, file) => {
              if (err) {
                  console.error('Error reading file:', err);
                  return;
              }
              const cleaned = file.replace(/[\u0000-\u001F]/g, '');
              programState = JSON.parse(cleaned);
          });
          
          res.send({stdout: output, data : programState});
          output = ""
      }, 200); 
     
 
});

// Set the port the app will listen on
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});