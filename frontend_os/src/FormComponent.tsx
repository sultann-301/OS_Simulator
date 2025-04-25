import React, { useState, useEffect } from 'react';
import programState from './logic/dumpster.txt?raw';

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

  const [progState, setProgState] = useState<ProgState>(() => JSON.parse(programState));
  const [output, setOutput] = useState<string>('');
  const [input, setInput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  // ✅ React to updates of the raw file in dev
  useEffect(() => {
    setProgState(JSON.parse(programState));
  }, [programState]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/spawn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await response.json();
      const { stdout, data } = json;
      
      setOutput(stdout);
      setMessage(data.message);
    } catch {
      setError('Failed to submit the form');
    }
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });
      const json = await response.json();
      const { stdout, data } = json;
      // const updatedProgState = JSON.parse(programState);
      // setProgState(updatedProgState);
      setOutput(stdout);
      setMessage(data.message);
    } catch {
      setError('Failed to submit the form');
    }
  };

  const handleInputNext = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });
      const json = await response.json();
      const { stdout, data } = json;
      // const updatedProgState = JSON.parse(programState);
      // setProgState(updatedProgState);
      setOutput(stdout);
      setMessage(data.message);
    } catch (e) {
      console.log(e);
      setError('Failed to submit the form');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {['sched_code', 'arrival1', 'arrival2', 'arrival3', 'quantum', 'path1', 'path2', 'path3'].map((field, idx) => (
          <div key={field}>
            <label htmlFor={field}>Input {idx + 1}:</label>
            <input
              type="text"
              id={field}
              name={field}
              value={(formData as any)[field]}
              onChange={handleChange}
            />
          </div>
        ))}
        <button type="submit">Submit</button>
      </form>

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}

      <form onSubmit={handleNext}>
        <button type="submit">NEXT</button>
      </form>

      <div style={{ whiteSpace: 'pre-line' }}>
        {output}
        {output.includes('Please') && (
          <form onSubmit={handleInputNext}>
            <label>
              Input: <input type="text" value={input} onChange={handleInputChange} />
            </label>
            <button type="submit">Submit</button>
          </form>
        )}
      </div>

      <div>
        <h2>Program State</h2>
        <p>ID: {progState.id}</p>
        <p>User Input Lock: {progState.userInputLock}</p>
        <p>File Lock: {progState.fileLock}</p>
        <p>User Output Lock: {progState.userOutputLock}</p>
        <p>Quantum: {progState.quantum}</p>
        <p>Schedule Code: {progState.sched_code}</p>
        <p>Quantum Lefts: {progState.quantumLefts.join(', ')}</p>
        <p>Clock: {progState.clock}</p>

        <h3>Queues</h3>
        {Object.entries(progState.qs).map(([level, queue]) => (
          <div key={level}>
            <strong>{level}:</strong> {queue.join(', ')}
          </div>
        ))}

        <h3>Memory</h3>
        {progState.memory.map((proc) => (
          <div key={proc.pid} style={{ border: '1px solid #ccc', margin: '8px 0', padding: '8px' }}>
            <p><strong>PID:</strong> {proc.pid}</p>
            <p><strong>State:</strong> {proc.state}</p>
            <p><strong>Priority:</strong> {proc.priority}</p>
            <p><strong>PC:</strong> {proc.pc}</p>
            <p><strong>Bounds:</strong> {proc.lowerBound} - {proc.upperBound}</p>
            <p><strong>Code:</strong> {proc.code.join(', ')}</p>
            <p><strong>Vars:</strong> {proc.vars.join(', ')}</p>
          </div>
        ))}

        <h3>Other Queues</h3>
        <p>Blocked File Q: {progState.blockedFileQ.join(', ')}</p>
        <p>Blocked Input Q: {progState.blockedInputQ.join(', ')}</p>
        <p>Blocked Output Q: {progState.blockedOutputQ.join(', ')}</p>
        <p>Blocked General Q: {progState.blockedGeneralQ.join(', ')}</p>
        <p>Ready Q: {progState.readyQ.join(', ')}</p>
      </div>
    </div>
  );
};

export default FormComponent;
