/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState , useEffect } from 'react';
import program from './logic/dumpster.txt?raw';
import './FormComponent.css';

interface FormData {
  sched_code: string;
  arrival1: string;
  arrival2: string;
  arrival3: string;
  quantum: string;
  path1: string;
  path2: string;
  path3: string;
}

const FormComponent: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    sched_code: '',
    arrival1: '',
    arrival2: '',
    arrival3: '',
    quantum: '',
    path1: '',
    path2: '',
    path3: '',
  });
  interface Process {
    pid: number;
    state: string;
    priority: number;
    pc: number;
    lowerBound: number;
    upperBound: number;
    code: string[];
    vars: string[];
  }
  
  interface Queues {
    level1: number[];
    level2: number[];
    level3: number[];
    level4: number[];
  }
  
  interface ProgState {
    id: number;
    userInputLock: number;
    fileLock: number;
    userOutputLock: number;
    quantum: number;
    sched_code: number;
    qs: Queues;
    quantumLefts: number[];
    memory: Process[];
    blockedFileQ: number[];
    blockedInputQ: number[];
    blockedOutputQ: number[];
    blockedGeneralQ: number[];
    readyQ: number[];
    clock: number;
    currProcess: number;
  }
  
  const [programState, setProgramState] = useState<ProgState>({
    id: 0,
    userInputLock: 0,
    fileLock: 0,
    userOutputLock: 0,
    quantum: 0,
    sched_code: 0,
    qs: { level1: [], level2: [], level3: [], level4: [] },
    quantumLefts: [],
    memory: [],
    blockedFileQ: [],
    blockedInputQ: [],
    blockedOutputQ: [],
    blockedGeneralQ: [],
    readyQ: [],
    clock: 0,
    currProcess: 0
  });

  const [output, setOutput] = useState<string>('');
  const [input, setInput] = useState<string>('');
  

  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const [progState, setProgState] = useState<ProgState>(() => JSON.parse(program) as ProgState);

  useEffect(() => {
    setProgState(JSON.parse(program) as ProgState);
  }, [program]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleChange2 = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleInputChange = (e : React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };
  let exited = false;
  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nativeEven  = e.nativeEvent as SubmitEvent
    const button = nativeEven.submitter as HTMLButtonElement
    try {
      if (button.name == "reset"){
        setFormData({
          sched_code: '',
          arrival1: '',
          arrival2: '',
          arrival3: '',
          quantum: '',
          path1: '',
          path2: '',
          path3: '',
        })
        setOutput("Killed child")
        await fetch('http://localhost:3000/kill', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });  
      }
      else{
        const response = await fetch('http://localhost:3000/spawn', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({formData, mode : button.name == 'steps' ? '1' : '2'}),
        });
      
          const json = await response.json();
          const { stdout } = json;
          setOutput(stdout)
          exited = true;
        }
        
      
      
    } catch (e) {
    }
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3000/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const json = await response.json();

      const { stdout, data } = json;

      if (!exited) setOutput(stdout)
      
      setMessage(data.message); // Assuming the server sends a response with a message
    } catch {
    }
  };



  const handleAuto = async (e: React.FormEvent) => {
    e.preventDefault();
    let interval;
    try {

      
        await fetch('http://localhost:3000/spawn', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({formData, mode : 2}),
          });
          console.log("im in the auto");
      
          // const json = await response.json();
          // const { stdout, data } = json;
          // setOutput(stdout)
          exited = true;
      console.log("im in button");
              
      interval = setInterval(async () => {
        const response = await fetch('http://localhost:3000/getoutput', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const json = await response.json();
        const {stdout} = json;
        setOutput(stdout)
        
      }, 500); // 1000ms = 1 second

    } 
    catch (e) {
      clearInterval(interval);
    }
  };



  const handleInputNext = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("IM BOUTA POSTT")

    try {
      const response = await fetch('http://localhost:3000/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: input }),
      });
      const json = await response.json();

      const { stdout, data } = json;

      
      
      // setProgState(data);
      if (!exited) setOutput(stdout)
      
      setMessage(data.message); // Assuming the server sends a response with a message
    } catch  {
    }
  };

  return (
    <div className="container">
      <div className="main-sections">
        
        {/* COLUMN 1: Form + Console */}
        <div className="form-section">
          <h2>Dashboard</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="sched_code">Scheduling Algorithm:</label>
              <select id="sched_code" name="sched_code" value={formData.sched_code} onChange={handleChange2}>
                <option value="" disabled selected>Select Scheduling Algorithm</option>
                <option value={0}>FIFO</option>
                <option value={1}>RR</option>
                <option value={2}>MLFQ</option>
              </select>
            </div>
            {formData.sched_code == '1' && (<div>
              <label htmlFor="quantum">Quantum (RR):</label>
              <input type="text" id="quantum" name="quantum" value={formData.quantum} onChange={handleChange} />
            </div>)}
            <div>
            <div>
              <label htmlFor="path1">Program 1 Name:</label>
              <input type="text" id="path1" name="path1" value={formData.path1} onChange={handleChange} />
            </div>
              <label htmlFor="arrival1">Arrival Time 1:</label>
              <input type="text" id="arrival1" name="arrival1" value={formData.arrival1} onChange={handleChange} placeholder='0 if not specified' />
            </div>
            <div>
            <div>
              <label htmlFor="path2">Program 2 Name:</label>
              <input type="text" id="path2" name="path2" value={formData.path2} onChange={handleChange} />
            </div>
              <label htmlFor="arrival2">Arrival Time 2:</label>
              <input type="text" id="arrival2" name="arrival2" value={formData.arrival2} onChange={handleChange} placeholder='0 if not specified'/>
            </div>
            <div>
              <label htmlFor="path3">Program 3 Name:</label>
              <input type="text" id="path3" name="path3" value={formData.path3} onChange={handleChange} />
            </div>
            <div>
              <label htmlFor="arrival3">Arrival Time 3:</label>
              <input type="text" id="arrival3" name="arrival3" value={formData.arrival3} onChange={handleChange} placeholder='0 if not specified'/>
            </div>

            <button name = "steps" type="submit">Start step by step</button>
            
            <button name = "reset" type="submit">Reset</button>
          </form>

          <form onSubmit={handleNext}>
            <button type="submit">NEXT</button>
          </form>

          <form onSubmit={handleAuto}>
            <button name = "continuous" type="submit">Start auto</button>
          </form>
  
  
          <div className="console-output" style={{ whiteSpace: 'pre-line' }}>
            {output}
            {progState.memory.every(proc => proc.state === "Terminated") && ("Its finished now...you can go home")}
            {output.includes("Please") && (
              <form onSubmit={handleInputNext}>
                <label>
                  Input:
                  <input type="text" id="input" name="input" value={input} onChange={handleInputChange} />
                </label>
                <button type="submit">Submit</button>
              </form>
            )}
          </div>
        </div>
  
        {/* COLUMN 2: Memory Cards */}
        <div className="memory-section">
          <h2>Memory</h2>
          {progState.memory.map((proc, index) => (
            (proc.state != "" && (<div key={index} className="process-card">
              <p><strong>PID:</strong> {proc.pid}</p>
              <p><strong>State:</strong> {proc.state}</p>
              <p><strong>Priority:</strong> {proc.priority}</p>
              <p><strong>PC:</strong> {proc.pc}</p>
              <p><strong>Bounds:</strong> {proc.lowerBound} - {proc.upperBound}</p>
              <p><strong>Code:</strong> {proc.code.join(', ')}</p>
              <p><strong>Vars:</strong> {proc.vars.join(', ')}</p>
            </div>))
          ))}
        </div>
  
        {/* COLUMN 3: Program State */}
        <div className="state-section">
          <h2>Program State</h2>
          <p>Number Of Processes: {progState.id}</p>
          <p>Current process running: {progState.currProcess}</p>
          <p>Current instruction running: {progState.currProcess != -1 ? progState.memory[progState.currProcess].code[progState.memory[progState.currProcess].pc] : 'None'}</p>
          <p>User Input Lock Holder: {progState.userInputLock == -1 ? 'None' : 'Process ' + progState.userInputLock}</p>
          <p>File Lock Holder: {progState.fileLock == -1 ? 'None' : 'Process ' + progState.fileLock}</p>
          <p>User Output Lock Holder: {progState.userOutputLock == -1 ? 'None' : 'Process ' + progState.userOutputLock}</p>
          <p>Quantum: {progState.quantum}</p>
          <p>Scheduling Algorithm: {progState.sched_code == 0 ? 'FIFO' : progState.sched_code == 1 ? 'RR' : progState.sched_code == 2 ? 'MLFQ' : "N/A"}</p>
          <p>
            Clock: <span className="clock-highlight">{progState.clock}</span>
          </p>
  
          <h3>Queues</h3>
            {Object.entries(progState.qs).map(([level, queue] : [string, number[]]) => (
              <div  key={level}>
                <strong>{level}: {queue.map((num, idx) => (
                    <span key={idx} className="queue-card">
                      {num}
                    </span>
                  ))}</strong>
                
              </div>
            ))}

            <h3>Other Queues</h3>
            <div>
              <strong>Blocked File Q:{progState.blockedFileQ.map((num, idx) => (
                  <span key={idx} className="queue-card">
                    {num}
                  </span>
                ))}
              </strong>
            </div>

            <div>
              <strong>Blocked Input Q:{progState.blockedInputQ.map((num, idx) => (
                  <span key={idx} className="queue-card">
                    {num}
                  </span>
                ))}
              </strong>  
            </div>

            <div>
              <strong>Blocked Output Q:{progState.blockedOutputQ.map((num, idx) => (
                  <span key={idx} className="queue-card">
                    {num}
                  </span>
                ))}
              </strong>
            </div>

            <div>
              <strong>Blocked General Q:{progState.blockedGeneralQ.map((num, idx) => (
                  (num == 1 && <span key={idx} className="queue-card">
                    {idx}
                  </span>)
                ))}
              </strong>
                
            </div>

            <div>
              <strong>Ready Q:{progState.readyQ.map((num, idx) => (
                  <span key={idx} className="queue-card">
                    {num}
                  </span>
                ))}
              </strong>
            </div>
          </div>
              
        </div>
      </div>
  );
  
};

export default FormComponent;
