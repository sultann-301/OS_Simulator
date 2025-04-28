import React from 'react';

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

interface ProgState {
  memory: Process[];
}

interface MemorySectionProps {
  progState: ProgState;
}

const MemorySection: React.FC<MemorySectionProps> = ({ progState }) => {
  return (
    <div className="memory-section">
      <h2>Memory</h2>
      {progState.memory.map((proc, index) => (
        proc.state !== "" && (
          <div key={index} className="process-card">
            <p><strong>Program Name:</strong> {proc.fileName}</p>
            <p><strong>PID:</strong> {proc.pid}</p>
            <p><strong>State:</strong> {proc.state}</p>
            <p><strong>Priority:</strong> {proc.priority}</p>
            <p><strong>PC:</strong> {proc.pc}</p>
            <p><strong>Bounds:</strong> {proc.lowerBound} - {proc.upperBound}</p>
            <p><strong>Code:</strong> {proc.code.join(', ')}</p>
            <p><strong>Vars:</strong> {proc.vars.join(', ')}</p>
          </div>
        )
      ))}
    </div>
  );
};

export default MemorySection;
