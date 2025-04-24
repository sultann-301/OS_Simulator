import React, { useState } from 'react';

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
  }
  
  const [progState, setProgState] = useState<ProgState>({
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
  });

  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3000/spawn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      setMessage(data.message); // Assuming the server sends a response with a message
    } catch (error) {
      setError('Failed to submit the form');
    }
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3000/simulate', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setProgState(data);
      console.log({progState});
      setMessage(data.message); // Assuming the server sends a response with a message
    } catch (error) {
      setError('Failed to submit the form');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="sched_code">Input 1:</label>
          <input
            type="text"
            id="sched_code"
            name="sched_code"
            value={formData.sched_code}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="arrival1">Input 2:</label>
          <input
            type="text"
            id="arrival1"
            name="arrival1"
            value={formData.arrival1}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="arrival2">Input 3:</label>
          <input
            type="text"
            id="arrival2"
            name="arrival2"
            value={formData.arrival2}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="arrival3">Input 4:</label>
          <input
            type="text"
            id="arrival3"
            name="arrival3"
            value={formData.arrival3}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="quantum">Input 5:</label>
          <input
            type="text"
            id="quantum"
            name="quantum"
            value={formData.quantum}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="path1">Input 6:</label>
          <input
            type="text"
            id="path1"
            name="path1"
            value={formData.path1}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="path2">Input 7:</label>
          <input
            type="text"
            id="path2"
            name="path2"
            value={formData.path2}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="path3">Input 8:</label>
          <input
            type="text"
            id="path3"
            name="path3"
            value={formData.path3}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Submit</button>
      </form>
      {message && <p>{message}</p>}
      {error && <p>{error}</p>}

      <form action="" onSubmit={handleNext}>
      <button type='submit'>NEXT</button>

      </form>
      <div>
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
  {progState.memory.map(proc => (
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
    </div>
  );
};

export default FormComponent;
