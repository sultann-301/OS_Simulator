const { spawn } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const child = spawn('./a.out', ['2', '1', '1', '1', '1', 'Program_1.txt', 'Program_2.txt', 'Program_3.txt']);
// const child = spawn('./a.out');
let programState;


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


child.stdout.on('data', (data) => {
    console.log(`[C Output]: ${data.toString().trim()}`);

    if (data.toString().trim().split(" ")[0] == "Please"){
        rl.on('line', (input) => {
            console.log(`You typed: ${input}`);
            child.stdin.write(input + '\n');
          });
    }
  });

rl.on("line",(data) => { // next cycle button (stop button is same but will write 2 instead)
    console.log(`length: ${data.toString().length}`)
    if (data.toString().length == 0){
        child.stdin.write('1' + '\n');
        fs.readFile('dumpster.txt', 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                return;
            }
            programState = JSON.parse(data);
        });
    }
 
    
});






child.stderr.on('data', (data) => {
  console.error(`[C Error]: ${data}`);
});

child.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
  process.exit();
});


