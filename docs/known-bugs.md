# Known Bugs

## Controls

### Timeline and Audio Playback

- When clicking the play/pause button above the timeline's canvas while the audio is playing, the runtime data is properly updated but audio continues to play. This is likely due to the `AudioSetupContext` not properly handling the state change for audio playback.

### Layers Visibility

- In some case, when switching a layer visibility and then, afterwards, making changes in the script editor, the layer visibility switches back to the previous state.
