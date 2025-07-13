# Inputs

```js
const someVariable = read('variableName', 'some default value');
```

## Available Inputs

- 'midi': MIDI input values.
- 'audio': Audio input values.
- 'time': Time input values.
- 'bpm': Beats per minute input values.

## MIDI Input

The `read` function can be used to access the current state of MIDI inputs.

```js
const midiValue = read('midi.deviceName.knob1', 127); // Reads the value of knob1 on the MIDI device named 'deviceName'
```

## Audio Input

By default, the audio input is based on the microphone, but other audio sources can be used (in he controls).
The `read` function can be used to access audio input values.

```js
// Reads the average value of the time domain of the first channel of the first audio input
const audioValue = read('audio.0.0.timeDomain.average', 0);
// Reads the median value of the time domain of the first channel of the first audio input
const audioValue = read('audio.0.0.timeDomain.median', 0);
// Reads the minimum value of the time domain of the first channel of the first audio input
const audioValue = read('audio.0.0.timeDomain.min', 0);
// Reads the maximum value of the time domain of the first channel of the first audio input
const audioValue = read('audio.0.0.timeDomain.max', 0);
// Reads the raw data of the time domain of the first channel of the first audio input
const audioValue = read('audio.0.0.timeDomain.data', []);

// Reads the average value of the frequency domain of the first channel of the first audio input
const audioValue = read('audio.0.0.frequency.average', 0);
// Reads the median value of the frequency domain of the first channel of the first audio input
const audioValue = read('audio.0.0.frequency.median', 0);
// Reads the minimum value of the frequency domain of the first channel of the first audio input
const audioValue = read('audio.0.0.frequency.min', 0);
// Reads the maximum value of the frequency domain of the first channel of the first audio input
const audioValue = read('audio.0.0.frequency.max', 0);
// Reads the raw data of the frequency domain of the first channel of the first audio input
const audioValue = read('audio.0.0.frequency.data', []);

// reads the median value of the frequency domain of the second (1!) channel of the third (2!) audio input
const audioValue = read('audio.2.1.frequency.median', 0);

// etc.
```

## Time Input

The `read` function can be used to access time input values.

```js
// Reads the current time in milliseconds
const timeValue = read('time.elapsed', 0);

// Reads the duration time in milliseconds
const durationValue = read('time.duration', 0);

// Reads the elapsed percentage of the current time, if a duration is set
const elapsedPercentage = read('time.percent', 0);

// Reads the current running state of the time input
const timeState = read('time.isRunning', false); // true if running, false if paused
```

## BPM Input

The `read` function can be used to access beats per minute (BPM) input values.

```js
// Reads the current BPM value
const bpmValue = read('bpm.bpm', 120);

// Reads the completion percentage of the current BPM cycle
const bpmCompletion = read('bpm.percent', 0);

// Reads the current BPM cycle time in milliseconds
const bpmCycleTime = read('bpm.elapsed', 0);

// Reads the starting time (based on the time input) of the BPM counting in milliseconds
const bpmStartTime = read('bpm.started', 0);

// Reads the current BPM state
```