const { spawn } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const child = spawn('./a.out', ['2', '1', '1', '1', '1', 'Program_1.txt', 'Program_2.txt', 'Program_3.txt']);
let programState;


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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

rl.on("line",(data) => { // next cycle button (stop button is same but will write 2 instead)
    if (data.toString().length == 0){
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
    }
});






child.stderr.on('data', (data) => {
  console.error(`[C Error]: ${data}`);
});

child.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
  process.exit();
});


// fs.close(data, (err) => {
//     if (err) throw err;
//     console.log('File closed successfully.');
//   });