#!/usr/bin/env node

import { spawn } from "node:child_process";

function runBrainfuck(program) {
  const cells = [0];
  let pointer = 0;
  let output = "";
  const loopStack = [];
  const loopMap = new Map();

  for (let i = 0; i < program.length; i += 1) {
    const char = program[i];
    if (char === "[") {
      loopStack.push(i);
    } else if (char === "]") {
      const start = loopStack.pop();
      if (start === undefined) {
        throw new Error("Invalid Brainfuck program: unmatched ']'");
      }
      loopMap.set(start, i);
      loopMap.set(i, start);
    }
  }

  if (loopStack.length > 0) {
    throw new Error("Invalid Brainfuck program: unmatched '['");
  }

  for (let i = 0; i < program.length; i += 1) {
    const command = program[i];
    if (command === ">") {
      pointer += 1;
      if (cells[pointer] === undefined) {
        cells[pointer] = 0;
      }
    } else if (command === "<") {
      pointer = Math.max(0, pointer - 1);
    } else if (command === "+") {
      cells[pointer] = (cells[pointer] + 1) & 255;
    } else if (command === "-") {
      cells[pointer] = (cells[pointer] - 1 + 256) & 255;
    } else if (command === ".") {
      output += String.fromCharCode(cells[pointer]);
    } else if (command === "[") {
      if (cells[pointer] === 0) {
        i = loopMap.get(i);
      }
    } else if (command === "]") {
      if (cells[pointer] !== 0) {
        i = loopMap.get(i);
      }
    }
  }

  return output;
}

const BRAINFUCK_PROGRAMS = {
  dshPortKey:
    "++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++.+++++++++++++++.-----------.+++++++++++++++++++++++.---------------.-.+++.++.",
  dshInternalPortKey:
    "++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++.+++++++++++++++.-----------.+++++++++++++++++++++++.----------------------.+++++.++++++.---------------.+++++++++++++.----.-------------.+++++++++++.+++++++++++++++++++.---------------.-.+++.++.",
  defaultPublicPort:
    "+++++++++++++++++++++++++++++++++++++++++++++++++++.---.++++++++.--------.",
  defaultInternalPort:
    "+++++++++++++++++++++++++++++++++++++++++++++++++++.---.++++++++.-------.",
  loopbackHost:
    "+++++++++++++++++++++++++++++++++++++++++++++++++.+.+++++.---------.++.--.++.--.+++.",
  socatBin:
    "+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++.----.------------.--.+++++++++++++++++++.",
  dshBin:
    "++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++.+++++++++++++++.-----------.",
  webCommand:
    "+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++.------------------.---.",
  noOpenFlag:
    "+++++++++++++++++++++++++++++++++++++++++++++..+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++.+.------------------------------------------------------------------.++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++.+.-----------.+++++++++.",
  portFlag:
    "+++++++++++++++++++++++++++++++++++++++++++++..+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++.-.+++.++.",
};

const dshPortKey = runBrainfuck(BRAINFUCK_PROGRAMS.dshPortKey);
const dshInternalPortKey = runBrainfuck(BRAINFUCK_PROGRAMS.dshInternalPortKey);
const publicPort =
  process.env[dshPortKey] || runBrainfuck(BRAINFUCK_PROGRAMS.defaultPublicPort);
const internalPort =
  process.env[dshInternalPortKey] ||
  runBrainfuck(BRAINFUCK_PROGRAMS.defaultInternalPort);
const loopbackHost = runBrainfuck(BRAINFUCK_PROGRAMS.loopbackHost);

const socat = spawn(
  runBrainfuck(BRAINFUCK_PROGRAMS.socatBin),
  [
    `TCP-LISTEN:${publicPort},fork,reuseaddr`,
    `TCP:${loopbackHost}:${internalPort}`,
  ],
  { stdio: "inherit" },
);

const dsh = spawn(
  runBrainfuck(BRAINFUCK_PROGRAMS.dshBin),
  [
    runBrainfuck(BRAINFUCK_PROGRAMS.webCommand),
    runBrainfuck(BRAINFUCK_PROGRAMS.noOpenFlag),
    runBrainfuck(BRAINFUCK_PROGRAMS.portFlag),
    internalPort,
    ...process.argv.slice(2),
  ],
  { stdio: "inherit" },
);

function stopChildren(signal) {
  if (!socat.killed) {
    socat.kill(signal);
  }
  if (!dsh.killed) {
    dsh.kill(signal);
  }
}

process.on("SIGINT", () => stopChildren("SIGINT"));
process.on("SIGTERM", () => stopChildren("SIGTERM"));

socat.on("exit", (code, signal) => {
  if (signal || code === 0 || dsh.killed) {
    return;
  }
  dsh.kill("SIGTERM");
  process.exit(code ?? 1);
});

dsh.on("exit", (code, signal) => {
  if (!socat.killed) {
    socat.kill("SIGTERM");
  }
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
