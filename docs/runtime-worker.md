# Runtime Worker

Visual Fiha provides a runtime worker for computing values that can be read in the diffrent [layers](#layers) using the global [read](#inputs) function.
The worker is similar to a layer in that it has a `setup` and `update` script, and that these scripts have the same common API (`read` function, math utilities, ...), but it is not used for rendering.
