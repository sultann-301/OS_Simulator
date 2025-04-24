const { spawn } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
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


// Define a GET route
app.post('/spawn', (req, res) => {
  console.log("HELLO")
  console.log(Object.values(req.body));
  child = spawn('./a.out', Object.values(req.body));
  child.stderr.on('data', (data) => {
    console.error(`[C Error]: ${data}`);
  });

  
  child.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    process.exit();
  });
  
  

  res.send('Program Done..?');
});

app.get('/simulate', (req, res) => {
  let flag = true;
  child.stdout.on('data', (data) => {
      flag = true;
      console.log("OUTPUT DETECTEDDDD");
      
      console.log(data.toString().trim());
      if (data.toString().trim().split(" ")[0] == "Please"){
          rl.on('line', (input) => {
              
              if(flag && data.toString().length != 0){
                  child.stdin.write(input + '\n');
                
              }
              flag = false;
            });
      }
    });
      child.stdin.write('1' + '\n');
      setTimeout(() => {
          fs.readFile('dumpster.txt', 'utf8', (err, file) => {
              if (err) {
                  console.error('Error reading file:', err);
                  return;
              }
              const cleaned = file.replace(/[\u0000-\u001F]/g, '');
              programState = JSON.parse(cleaned);
          });
      }, 200); 
  
  res.send(programState);
});

// Set the port the app will listen on
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});