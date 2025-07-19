# Audio Handling in Visual-Fiha

## Overview
Visual-Fiha incorporates a robust audio handling system that supports both microphone input and audio file playback. The system processes audio data in real-time, providing frequency and time-domain visualizations, and transmits structured audio data as part of the `inputsdata` message for further use in the application.

## Audio Input Modes
The application supports two primary modes of audio input:

1. **Microphone Input**: Captures live audio from the user's microphone.
2. **Audio File Playback**: Allows users to upload and analyze audio files.

The mode can be toggled dynamically using the "Toggle mode" button in the `Inputs` component.

## Key Components

### 1. `AudioSetupContext`
This React context manages the audio setup and provides utilities for both microphone and audio file handling. It includes methods to retrieve audio elements, analyzers, and playback state. Key properties include:

- **Audio Context**: Centralized `AudioContext` for managing audio processing.
- **Analyzers**: `AnalyserNode` instances for frequency and time-domain analysis.
- **Playback State**: Tracks playback status, current time, duration, and volume.

### 2. `MicrophoneAnalyzer`
This component handles microphone input. It uses the `getMicrophoneAnalyser` method from `AudioSetupContext` to retrieve an `AnalyserNode` for real-time audio analysis. The processed data is visualized and transmitted as part of `inputsdata`.

### 3. `AudioFilesAnalyzer`
This component manages audio file playback and analysis. Users can upload multiple audio files, which are processed using `AnalyserNode` instances. Each file's data is visualized and included in `inputsdata`.

### 4. `CanvasVisualizer`
A utility component for rendering frequency and time-domain visualizations on a canvas. It supports additional custom drawing via the `drawExtras` callback.

### 5. `Inputs`
The `Inputs` component integrates microphone and audio file analyzers. It collects audio data and transmits it as part of the `inputsdata` message using the `useWriteInputValues` hook. This hook centralizes the logic for managing and transmitting input values, ensuring consistency across components like `MicrophoneAnalyzer`, `AudioFilesAnalyzer`, and `MIDIBridge`. By leveraging this hook, the application maintains a modular and efficient architecture for handling audio inputs.

## Audio Data in `inputsdata`
The `inputsdata` message is a structured object that includes real-time audio data. The data is organized hierarchically based on the input source and type. Below is an example structure:

```json
{
  "audio": {
    "0": { // Microphone Input or first audio file
      "0": { // Channel 0 of the first audio input
        "frequency": {
          "average": 128.5,
          "median": 130,
          "min": 0,
          "max": 255,
          "data": [0, 128, 255, ...]
        },
        "timeDomain": {
          "average": 127.8,
          "median": 128,
          "min": 0,
          "max": 255,
          "data": [128, 130, 127, ...]
        }
      },
      "1": { // Channel 1 of the first audio input
        "frequency": {
          "average": 130.2,
          "median": 131,
          "min": 1,
          "max": 254,
          "data": [1, 130, 254, ...]
        },
        "timeDomain": {
          "average": 126.5,
          "median": 127,
          "min": 2,
          "max": 253,
          "data": [127, 129, 126, ...]
        }
      }
    },
    "1": { // Second audio file
      "0": { // Channel 0 of the second audio input
        // Similar structure as above
      },
      "1": { // Channel 1 of the second audio input
        // Similar structure as above
      }
    },
    // Additional audio files can be added here
  }
}
```

### Fields
- **`average`**: The average value of the data array.
- **`median`**: The median value of the data array.
- **`min`**: The minimum value in the data array.
- **`max`**: The maximum value in the data array.
- **`data`**: The raw data array, representing either frequency or time-domain values.

### Sources
- **Microphone Input**: Data is stored under `audio.0.0`.
- **Audio Files**:
  - Each file is assigned a unique track index (e.g., `audio.1.0`, `audio.2.0`).
  - Each track may have several channels (e.g., `audio.1.0`, `audio.1.1`).

## Visualization
The audio data is visualized using the `CanvasVisualizer` component. It renders:

1. **Frequency Domain**: Displays the frequency spectrum of the audio.
2. **Time Domain**: Shows the waveform of the audio signal.

Additional information, such as average, median, min, and max values, is displayed on the canvas.

## Messaging
The `inputsdata` message is sent periodically from the `Inputs` component to the main application thread. This message consolidates all input data, including audio, and ensures it is available for other components and workers.
