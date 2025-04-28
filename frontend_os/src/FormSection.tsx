import React from 'react';

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

interface FormSectionProps {
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleChange2: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleNext: (e: React.FormEvent) => void;
  handleAuto: (e: React.FormEvent) => void;
  output: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleInputNext: (e: React.FormEvent) => void;
  progState: ProgState;
  input: string;
}

interface ProgState {
  memory: {
    state: string;
  }[];
}

const FormSection: React.FC<FormSectionProps> = ({
  formData,
  handleChange,
  handleChange2,
  handleSubmit,
  handleNext,
  handleAuto,
  output,
  handleInputChange,
  handleInputNext,
  progState,
  input
}) => {
  return (
    <div className="form-section">
      <h2>Dashboard</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="sched_code">Scheduling Algorithm:</label>
          <select id="sched_code" name="sched_code" value={formData.sched_code} onChange={handleChange2}>
            <option value="" disabled>Select Scheduling Algorithm</option>
            <option value={0}>FIFO</option>
            <option value={1}>RR</option>
            <option value={2}>MLFQ</option>
          </select>
        </div>

        {formData.sched_code === '1' && (
          <div>
            <label htmlFor="quantum">Quantum (RR):</label>
            <input type="text" id="quantum" name="quantum" value={formData.quantum} onChange={handleChange} />
          </div>
        )}

        {[1, 2, 3].map(i => (
          <div key={i}>
            <div>
              <label htmlFor={`path${i}`}>Program {i} Name:</label>
              <input type="text" id={`path${i}`} name={`path${i}`} value={formData[`path${i}` as keyof FormData]} onChange={handleChange} />
            </div>
            <label htmlFor={`arrival${i}`}>Arrival Time {i}:</label>
            <input type="text" id={`arrival${i}`} name={`arrival${i}`} value={formData[`arrival${i}` as keyof FormData]} onChange={handleChange} placeholder="0 if not specified" />
          </div>
        ))}

        <button name="steps" type="submit">Start step by step</button>
        <button name="reset" type="submit">Reset</button>
      </form>

      <form onSubmit={handleNext}>
        <button type="submit">NEXT</button>
      </form>

      <form onSubmit={handleAuto}>
        <button name="continuous" type="submit">Start auto</button>
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
  );
};

export default FormSection;
