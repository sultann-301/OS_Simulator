# OS Process Simulator

An operating system simulator that demonstrates the execution of three concurrent processes using **C** for backend logic and **ReactJS** for the frontend interface.

## Features

- 🔧 **Multiple Scheduling Algorithms**  
  Supports:
  - FIFO (First In, First Out)
  - Round Robin (RR)
  - Multi-Level Feedback Queue (MLFQ)

- ⏱️ **Simulation Modes**  
  - Step-by-step process execution  
  - Continuous (automated) simulation

- 🔒 **Mutex Locks**  
  Ensures synchronized access to:
  - Input and output operations  
  - File read/write operations

- 🧠 **Simulated Memory**  
  - Displays Process Control Block (PCB) content  
  - Mimics memory allocation and process states

- 📄 **Custom Process Code Parser**  
  - Parses and executes specially formatted text files for each process

- 🌐 **Custom Backend API**  
  - Backend built in C
  - Exposes APIs for frontend to control and monitor simulation

## Tech Stack

- **Frontend:** ReactJS  
- **Backend:** C + ExpressJS 
- **Communication:** Custom API over REST 
