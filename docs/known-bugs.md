# Known Bugs

## Displays

- Sometime, the resolution of the display is not correctly set, leading to a stretched image.

## Controls

### Canvas and misc API types

- The types are correctly set, but they are missing the documentation for the parameters and return values.

### AI Assistant

- If tools are used in a conversation, subsequent messages attempts will fail.
- Conversations are lost if switching scripts.
- While generating a response (and using tools), the AI Assistant triggers a lot of re-renders.
- The getScript tool does not always return the latest version of the scripts.

### Timeline

- If no duration is set (like when using the microphone), the first 30 seconds in the timeline are not correctly handled.