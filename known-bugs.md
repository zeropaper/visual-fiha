# Known Bugs

- When clicking the "On/Off" button of a layer (in [src/controls/Layers.tsx](src/controls/Layers.tsx)), the layer is removed.
- Changing code in the ScriptEditor will correctly trigger the code transpilation, but the changes are not applied to the layer. When switching scripts in the editor, the changes are lost.
