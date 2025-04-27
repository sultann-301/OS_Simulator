const { spawn } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const { log } = require('console');



let programState;
let child;
let listener;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


function empty_dumpster(filename) {
  const emptyState = {
      id: 0,
      userInputLock: -1,
      fileLock: -1,
      userOutputLock: -1,
      quantum: 0,
      sched_code: -1,
      currProcess: -1,
      qs: {
          level1: [],
          level2: [],
          level3: [],
          level4: []
      },
      quantumLefts: [0, 0, 0],
      memory: [
          {
              pid: 0,
              state: "",
              priority: 0,
              pc: 0,
              lowerBound: 0,
              upperBound: 0,
              code: Array(11).fill(""),
              vars: Array(3).fill("")
          },
          {
              pid: 0,
              state: "",
              priority: 0,
              pc: 0,
              lowerBound: 0,
              upperBound: 0,
              code: Array(11).fill(""),
              vars: Array(3).fill("")
          },
          {
              pid: 0,
              state: "",
              priority: 0,
              pc: 0,
              lowerBound: 0,
              upperBound: 0,
              code: Array(11).fill(""),
              vars: Array(3).fill("")
          }
      ],
      blockedFileQ: [],
      blockedInputQ: [],
      blockedOutputQ: [],
      blockedGeneralQ: [],
      readyQ: [],
      clock: 0
  };

  fs.writeFile(filename, JSON.stringify(emptyState, null, 2), (err) => {
      if (err) {
          console.error("Failed to write to file", err);
      } else {
          console.log(`File ${filename} successfully written with empty state.`);
      }
  });
}



const app = express();
app.use(cors());
app.use(express.json());
let childExited = false;

// Define a GET route
app.post('/spawn', (req, res) => {
  console.log("HELLO")
  console.log(Object.values(req.body));
  child = spawn('./a.out', Object.values(req.body).map(value => value.trim() === "" ? "$" : value));
  child.stdout.setMaxListeners(1);
  childExited = false;
  child.stderr.on('data', (data) => {
    console.error(`[C Error]: ${data}`);
  });
  child.on('close', (code) => {
    res.send({stdout: code == 1 ? "ERROR FILE NOT FOUND":``, data :programState});
    childExited = true
    empty_dumpster("dumpster.txt")
    child.kill();
    
  });
  

});


app.post('/kill', (req, res) => {
  if (childExited){
    res.send({stdout: `PLEASE SUBMIT AGAIN MAN .. ITS OVER`, data :programState});
    return
  }
  empty_dumpster("dumpster.txt")
  child.kill();
  childExited = true;



})

app.post('/input', (req, res) => {
  let input = req.body
  if(data.toString().length != 0){
    child.stdin.write(input + '\n');
  }

});

let output = "";
app.post('/simulate', (req, res) => {
  if (childExited){
    res.send({stdout: `PLEASE SUBMIT AGAIN MAN .. ITS OVER`, data :programState});
    return
  }
  let flag = true;

  let input = req.body.input
  
  if (child.stdout.listenerCount('data') === 0) {
    child.stdout.on('data', (data) => {
        if (!input){
          console.log(data.toString().trim())
          output += "OUTPUT DETECTEDDDD\n";
          output += data.toString().trim() + "\n";
        }
      });
  }

      if (input){
          
        if(flag){

          console.log(`the input ${input} has been gobbled"`)
          child.stdin.write(input + '\n');
          flag = false;
        }
        
            
      }
      if (!input) {
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