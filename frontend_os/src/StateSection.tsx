import React from 'react';

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
  memory: {
    code: string[];
    pc: number;
    state: string;
  }[];
  clock: number;
  currProcess: number;
  blockedFileQ: number[];
  blockedInputQ: number[];
  blockedOutputQ: number[];
  blockedGeneralQ: number[];
  readyQ: number[];
}

interface StateSectionProps {
  progState: ProgState;
}

const StateSection: React.FC<StateSectionProps> = ({ progState }) => {
  return (
    <div className="state-section">
      <h2>Program State</h2>
      <p>Number Of Processes: {progState.id}</p>
      <p>Current process running: {progState.currProcess}</p>
      <p>Current instruction running: {progState.currProcess !== -1 ? progState.memory[progState.currProcess].code[progState.memory[progState.currProcess].pc -1] : 'None'}</p>
      <p>User Input Lock Holder: {progState.userInputLock === -1 ? 'None' : `Process ${progState.userInputLock}`}</p>
      <p>File Lock Holder: {progState.fileLock === -1 ? 'None' : `Process ${progState.fileLock}`}</p>
      <p>User Output Lock Holder: {progState.userOutputLock === -1 ? 'None' : `Process ${progState.userOutputLock}`}</p>
      <p>Quantum: {progState.quantum}</p>
      <p>Scheduling Algorithm: {progState.sched_code === 0 ? 'FIFO' : progState.sched_code === 1 ? 'RR' : progState.sched_code === 2 ? 'MLFQ' : "N/A"}</p>
      <p>Clock: <span className="clock-highlight">{progState.clock}</span></p>
      <h3>{[
        { label: "Ready Q", queue: progState.readyQ }
      ].map(({ label, queue }) => (
        <div key={label}>
          <strong>{label}: {queue.map((num, idx) => (
            <span key={idx} className="queue-card">{num}</span>
          ))}</strong>
        </div>
      ))}</h3>
      <h3>MLFQ Queues</h3>
      {Object.entries(progState.qs).map(([level, queue] : [string, number[]]) => (
        <div key={level}>
          <strong>{level}: {queue.map((num, idx) => (
            <span key={idx} className="queue-card">{num}</span>
          ))}</strong>
        </div>
      ))}

      <h3>Blocked Queues</h3>
      {[
        { label: "Blocked File Q", queue: progState.blockedFileQ },
        { label: "Blocked Input Q", queue: progState.blockedInputQ },
        { label: "Blocked Output Q", queue: progState.blockedOutputQ },
        { label: "Blocked General Q", queue: progState.blockedGeneralQ.map((val, idx) => (val === 1 ? idx : -1)).filter(v => v !== -1) },
      ].map(({ label, queue }) => (
        <div key={label}>
          <strong>{label}: {queue.map((num, idx) => (
            <span key={idx} className="queue-card">{num}</span>
          ))}</strong>
        </div>
      ))}
    </div>
  );
};

export default StateSection;
