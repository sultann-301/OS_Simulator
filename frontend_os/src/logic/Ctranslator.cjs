const { spawn } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const { log } = require('console');




let programState;
let child;


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
              fileName: "",
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
              fileName: "",
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
              fileName:"",
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
  const {formData, mode} = req.body
  console.log(formData)
  console.log(mode)
  child = spawn('./a.out', [mode,...Object.values(formData).map(value => value.trim() === "" ? "$" : value)]);
  if (child.stdout.listenerCount('data') === 0) {
    child.stdout.on('data', (data) => {
      output = ""
      console.log(data.toString().trim())
      // output += "OUTPUT DETECTEDDDD\n";
      output += data.toString().trim() + "\n";
    });
  }
  childExited = false;
  child.stderr.on('data', (data) => {
    console.error(`[C Error]: ${data}`);
  });
  child.on('close', (code) => {
    if (code == 1) res.send({stdout : "ERROR FILE NOT FOUND", data :programState});
    childExited = true
    empty_dumpster("dumpster.txt")
    child.kill();
    return;
  });
  setTimeout(() => {
    if (!childExited) res.send({stdout: output});
  }, 1500);
});


app.post('/getoutput', (req, res) => {
    if (childExited){
      res.send({stdout: `PLEASE SUBMIT AGAIN MAN .. ITS OVER`, data :programState});
      return
    }
    res.send({stdout : output});

})



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

  if (input){
      
    if(flag){
      child.stdin.write(input + '\n');
      flag = false;
    }
    
        
  }
  if (!input) {
    child.stdin.write('1' + '\n');
  }
  
  setTimeout(() => {
      res.send({stdout: output, data : programState});
      
  }, 200);
});

// Set the port the app will listen on
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});