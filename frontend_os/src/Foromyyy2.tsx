/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import FormSection from './FormSection';
import MemorySection from './MemorySection';
import StateSection from './StateSection';
import { useState, useEffect } from 'react';
// all your previous hooks, useState, useEffect logic here
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

const Foromyyy2: React.FC = () => {
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
    fileName: string;
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
        
      
      
    } catch (e) { /* empty */ }
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
      
    
    } catch { /* empty */ }
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
      
    } catch  { /* empty */ }
  };


return (
  <div className="container">
    <div className="main-sections">
      <FormSection
        formData={formData}
        handleChange={handleChange}
        handleChange2={handleChange2}
        handleSubmit={handleSubmit}
        handleNext={handleNext}
        handleAuto={handleAuto}
        output={output}
        handleInputChange={handleInputChange}
        handleInputNext={handleInputNext}
        progState={progState}
        input={input}
      />
      <MemorySection progState={progState} />
      <StateSection progState={progState} />
    </div>
  </div>
);
}
export default Foromyyy2;
