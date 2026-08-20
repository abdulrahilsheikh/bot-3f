# bot-3f — Robot Builder Specification

**Document:** React Flow Robot Builder Requirements
**Project:** `bot-3f`
**Version:** 1.0
**Status:** MVP Specification
**Primary Technology:** React + TypeScript + React Flow (`@xyflow/react`)
**Purpose:** Define and edit the **physical/kinematic structure of a robot arm** before it is simulated in Three.js.

---

# 1. Purpose

The Robot Builder is the first major UI of `bot-3f`.

It allows users to construct a robot by connecting components such as:

```text
Base
 ↓
Joint
 ↓
Link
 ↓
Joint
 ↓
Link
 ↓
...
 ↓
Flange
 ↓
Tool
 ↓
TCP
```

The builder does **not** perform IK.

It does **not** control the Three.js robot directly.

Its responsibility is:

> **Create and edit a valid `RobotDefinition`.**

The output of the builder becomes the input to the robotics engine.

```text
React Flow
    ↓
Robot Definition
    ↓
Kinematics Engine
    ↓
Three.js
```

---

# 2. Primary User Goal

A user should be able to open `bot-3f` and visually construct something like:

```text
                    ┌──────────┐
                    │  BASE    │
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │ JOINT 1  │
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │  LINK 1  │
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │ JOINT 2  │
                    └────┬─────┘
                         │
                        ...
                         │
                    ┌────▼─────┐
                    │ JOINT 6  │
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │  FLANGE  │
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │   TOOL   │
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │   TCP    │
                    └───────────┘
```

The user should never need to manually edit JSON to create this.

---

# 3. Scope

## In scope

- React Flow canvas
- Robot component nodes
- Node connections
- Component palette
- Node selection
- Node properties
- Joint configuration
- Link configuration
- Transform editing
- TCP configuration
- Robot validation
- Undo/redo
- Copy/paste
- Delete
- Auto layout
- Import/export robot definition
- Builder → `RobotDefinition` conversion

## Out of scope

For this phase:

- IK
- FK
- trajectory generation
- animation
- collision detection
- physics
- grasping
- robot execution
- Three.js rendering

The builder should only produce the robot structure.

---

# 4. UI Layout

The initial builder should look like:

```text
┌───────────────────────────────────────────────────────────────┐
│ bot-3f   Robot Builder                    Undo Redo  Validate │
├───────────────┬────────────────────────────────┬──────────────┤
│               │                                │              │
│ COMPONENTS    │                                │ PROPERTIES   │
│               │                                │              │
│ ┌───────────┐ │                                │              │
│ │ Base      │ │                                │ Select a     │
│ └───────────┘ │                                │ component    │
│               │                                │              │
│ ┌───────────┐ │        React Flow              │              │
│ │ Joint     │ │                                │              │
│ └───────────┘ │                                │              │
│               │                                │              │
│ ┌───────────┐ │        [Base]                  │              │
│ │ Link      │ │           │                    │              │
│ └───────────┘ │        [Joint]                 │              │
│               │           │                    │              │
│ ┌───────────┐ │        [Link]                  │              │
│ │ Flange    │ │                                │              │
│ └───────────┘ │                                │              │
│               │                                │              │
│ ┌───────────┐ │                                │              │
│ │ Tool      │ │                                │              │
│ └───────────┘ │                                │              │
│               │                                │              │
│ ┌───────────┐ │                                │              │
│ │ TCP       │ │                                │              │
│ └───────────┘ │                                │              │
│               │                                │              │
└───────────────┴────────────────────────────────┴──────────────┘
```

---

# 5. Component Palette

The left panel contains the components that can be added to the graph.

Required components:

```text
BASE
JOINT
LINK
FLANGE
TOOL
TCP
GRIPPER
```

Each component should be draggable.

Example:

```text
┌─────────────────────┐
│ COMPONENTS          │
├─────────────────────┤
│                     │
│  ⬢  Base            │
│                     │
│  ⚙  Joint           │
│                     │
│  ▣  Link            │
│                     │
│  ◇  Flange          │
│                     │
│  🔧 Tool            │
│                     │
│  ⊙  TCP             │
│                     │
│  🤏 Gripper         │
│                     │
└─────────────────────┘
```

---

# 6. Adding Nodes

There should be two ways to add components.

### Method 1 — Drag

User drags:

```text
Joint
```

onto the React Flow canvas.

### Method 2 — Click

Clicking `Joint` adds a new joint to the canvas at a default location.

This is useful for keyboard-heavy workflows.

---

# 7. Node IDs

Every node must have a stable unique ID.

Example:

```text
base-1
joint-1
link-1
joint-2
link-2
```

Use generated IDs internally.

Never use React Flow's position or label as identity.

---

# 8. Node Data Model

React Flow node data should be strongly typed.

```ts
type RobotNodeData =
  | BaseNodeData
  | JointNodeData
  | LinkNodeData
  | FlangeNodeData
  | ToolNodeData
  | TcpNodeData
  | GripperNodeData;
```

Example:

```ts
interface BaseNodeData {
  type: "base";

  name: string;

  transform: Transform;
}
```

---

# 9. Base Node

Visual representation:

```text
┌──────────────────────┐
│ ● BASE               │
├──────────────────────┤
│ Base                  │
└──────────────────────┘
```

Properties:

```text
Name
Position
Rotation
```

The base:

- must be unique
- cannot have a parent
- may have exactly one child in the serial-chain MVP

---

# 10. Joint Node

Visual representation:

```text
┌─────────────────────────┐
│ ⚙ JOINT 1               │
├─────────────────────────┤
│ Revolute                │
│ Axis  Y                 │
│ -180°  →  180°          │
└─────────────────────────┘
```

Properties:

```text
Name
Joint Type
Axis
Origin
Limits
Velocity
Acceleration
```

---

# 11. Joint Type

Dropdown:

```text
Joint Type

[ Revolute ▼ ]
```

Options:

```text
Revolute
Prismatic
```

MVP should primarily target revolute joints.

---

# 12. Joint Axis

UI:

```text
AXIS

X [ 0 ]
Y [ 1 ]
Z [ 0 ]

Normalize ✓
```

Axis must be a non-zero vector.

On save:

```ts
axis = normalize(axis);
```

Invalid:

```text
[0, 0, 0]
```

must produce an error.

---

# 13. Joint Limits

UI:

```text
JOINT LIMITS

Minimum
[-180°]

Maximum
[ 180°]
```

For prismatic joints:

```text
Minimum
[-0.5m]

Maximum
[ 0.5m]
```

Requirements:

```text
min < max
```

---

# 14. Joint Dynamics

Optional properties:

```text
Velocity Limit
Acceleration Limit
```

Example:

```text
Velocity
[180] deg/s

Acceleration
[360] deg/s²
```

These are stored but do not need to be used by the builder.

---

# 15. Link Node

Visual:

```text
┌─────────────────────────┐
│ ▣ LINK 1                │
├─────────────────────────┤
│ Box                     │
│ 100 × 100 × 400 mm      │
└─────────────────────────┘
```

Properties:

```text
Name
Geometry
Dimensions
Transform
Color
Collision Enabled
```

---

# 16. Link Geometry

MVP supports:

```text
Box
Cylinder
```

Dropdown:

```text
Geometry

[ Box ▼ ]
```

Box:

```text
Width
Height
Depth
```

Cylinder:

```text
Radius
Height
```

Do not add arbitrary mesh upload in the first builder release.

---

# 17. Link Transform

Every link needs a local transform.

```text
POSITION

X [0]
Y [0]
Z [0]

ROTATION

X [0]
Y [0]
Z [0]
```

UI can use Euler angles.

Internal representation should remain quaternion-based.

---

# 18. Flange Node

Visual:

```text
┌──────────────────────┐
│ ◇ FLANGE             │
├──────────────────────┤
│ Tool mounting frame  │
└──────────────────────┘
```

Properties:

```text
Name
Position
Rotation
```

---

# 19. Tool Node

Visual:

```text
┌──────────────────────┐
│ 🔧 TOOL              │
├──────────────────────┤
│ Default Tool         │
└──────────────────────┘
```

Properties:

```text
Name
Position
Rotation
Tool Type
```

V1 tool types:

```text
Generic
Gripper
```

---

# 20. TCP Node

The TCP is an important special node.

Visual:

```text
┌──────────────────────┐
│ ⊙ TCP                │
├──────────────────────┤
│ Tool Center Point    │
└──────────────────────┘
```

Properties:

```text
Name

Position
X
Y
Z

Rotation
X
Y
Z
```

The TCP marks the endpoint of the kinematic chain.

---

# 21. Gripper Node

Visual:

```text
┌──────────────────────┐
│ 🤏 GRIPPER           │
├──────────────────────┤
│ Parallel Gripper     │
└──────────────────────┘
```

Properties:

```text
Name
Opening
Minimum Opening
Maximum Opening
```

The actual gripper animation is outside this builder phase.

---

# 22. Connection Rules

This is one of the most important parts of the builder.

For MVP, the robot must be a **directed acyclic serial chain**.

Allowed:

```text
Base → Joint

Joint → Link

Link → Joint

Joint → Flange

Flange → Tool

Tool → TCP

Tool → Gripper
```

Depending on the chosen structure, `Gripper` can also be attached to `TCP`.

---

# 23. Invalid Connections

Reject:

```text
Joint → Joint
Base → Base
TCP → Joint
TCP → Link
TCP → TCP
Link → Link
```

unless explicitly supported by the model.

Display:

```text
Invalid connection:
Joint → Joint
```

---

# 24. Connection Validation

Before creating an edge:

```ts
canConnect(source, target);
```

must validate:

1. Component compatibility
2. Parent constraints
3. Child constraints
4. Cycle detection
5. Duplicate connection
6. Root constraints

Example:

```ts
if (wouldCreateCycle(source, target)) {
  return false;
}
```

---

# 25. Parent / Child Rules

Every node except the Base must have at most one parent.

Example:

```text
          Base
           │
         Joint
           │
         Link
```

A link cannot have:

```text
Joint A ─┐
         ├── Link
Joint B ─┘
```

in the MVP.

---

# 26. Serial Chain Validation

A valid MVP robot should look like:

```text
Base
 ↓
Joint
 ↓
Link
 ↓
Joint
 ↓
Link
 ↓
Joint
 ↓
...
 ↓
TCP
```

There should be:

- exactly one root
- exactly one base
- no cycles
- no disconnected nodes
- one TCP
- one continuous path from Base to TCP

---

# 27. Node Selection

Clicking a node:

```text
select node
      ↓
highlight node
      ↓
show properties
```

Selected node:

```text
┌══════════════════════┐
║ ⚙ JOINT 2            ║
╠══════════════════════╣
║ Revolute             ║
╚══════════════════════╝
```

---

# 28. Multi-Selection

Support:

```text
Shift + Click
```

for multiple node selection.

MVP use cases:

- delete multiple nodes
- move multiple nodes
- copy/paste multiple nodes

---

# 29. Node Deletion

When deleting a node:

```text
Select
 ↓
Delete
 ↓
Confirm if necessary
 ↓
Remove node
 ↓
Remove connected edges
 ↓
Revalidate robot
```

Deleting a node in the middle of the chain should not automatically reconnect its neighbors.

Example:

```text
J1 → Link1 → J2

delete Link1

J1      J2
```

User must reconnect them manually.

---

# 30. Keyboard Shortcuts

Required:

```text
Delete / Backspace
→ delete selected nodes

Ctrl/Cmd + Z
→ undo

Ctrl/Cmd + Shift + Z
→ redo

Ctrl/Cmd + C
→ copy

Ctrl/Cmd + V
→ paste

Ctrl/Cmd + A
→ select all

Escape
→ clear selection
```

---

# 31. Undo / Redo

Every structural modification must be undoable.

Examples:

```text
Add Joint
Delete Link
Change Joint Axis
Change Joint Limits
Move Node
Connect Nodes
Disconnect Nodes
Change Link Dimensions
```

Undo should restore the complete previous state.

---

# 32. Node Position vs Robot Transform

Important distinction:

### React Flow node position

Controls where the node appears **on the builder canvas**.

```ts
node.position;
```

### Robot transform

Controls the physical robot component.

```ts
node.data.transform;
```

These must never be confused.

Example:

```text
React Flow position:
x = 400
y = 250

Robot transform:
position = [0, 0, 0]
```

---

# 33. Auto Layout

Provide an `Auto Layout` button.

Example:

```text
[ Auto Layout ]
```

Result:

```text
Base
 │
Joint 1
 │
Link 1
 │
Joint 2
 │
Link 2
 │
Joint 3
```

For the MVP, a simple vertical/hierarchical layout is sufficient.

---

# 34. Minimap

React Flow minimap should be enabled.

Useful for large robots/programs.

---

# 35. Canvas Controls

Required:

```text
Zoom In
Zoom Out
Fit View
Lock View
Grid
```

Optional:

```text
Snap to Grid
```

---

# 36. Grid

The builder should display a subtle graph grid.

Recommended:

```text
Grid size: 20px
```

Nodes should optionally snap to the grid.

---

# 37. Properties Panel

The right-side panel changes based on selection.

No selection:

```text
ROBOT

Name
[ KUKA-like Robot ]

Status
✓ Valid

Components
8

Joints
6

TCP
Configured
```

Joint selected:

```text
JOINT 3

Name
[Joint 3]

Type
[Revolute]

Axis
X [0]
Y [1]
Z [0]

Limits
Min [-180°]
Max [180°]
```

---

# 38. Robot-Level Properties

When nothing is selected:

```text
ROBOT

Name
[KUKA-like Arm]

Description
[6 DOF industrial robot]

Units
[mm / degrees]

Coordinate System
[World]
```

---

# 39. Units

The builder should expose a unit setting.

MVP:

```text
Length:
mm

Angle:
degrees
```

Internal calculations should use:

```text
meters
radians
```

The UI performs conversion.

---

# 40. Naming

Automatically generate names:

```text
Base
Joint 1
Link 1
Joint 2
Link 2
TCP
```

Users can rename them.

Names do not need to be unique, but IDs must be unique.

---

# 41. Duplicate Components

Provide:

```text
Ctrl/Cmd + D
```

to duplicate selected nodes.

Duplicated nodes receive new IDs.

Example:

```text
Joint 2
```

becomes:

```text
Joint 3
```

Connections between duplicated nodes should be preserved when copying a group.

---

# 42. Copy / Paste

When copying:

```text
selected nodes
+
internal edges
```

must be copied.

External connections should not be copied.

Example:

```text
J1 → Link1 → J2
```

Copying `Link1 → J2` should produce:

```text
Link3 → Joint3
```

without automatically reconnecting `J1`.

---

# 43. Context Menu

Right-click a node:

```text
┌─────────────────────┐
│ Rename              │
│ Duplicate           │
│ Copy                │
│ Delete              │
│ ─────────────────── │
│ Add Child           │
│ Set as TCP           │
└─────────────────────┘
```

---

# 44. Add Child

A useful shortcut.

Right-click:

```text
Joint 3
```

→

```text
Add Child
```

Options:

```text
Link
Flange
```

Right-click:

```text
Link 3
```

→

```text
Add Child
```

Options:

```text
Joint
```

This makes building a robot much faster than repeatedly dragging from the palette.

---

# 45. Robot Templates

The builder should support templates.

MVP templates:

```text
Empty Robot

6-DOF Industrial Arm

3-DOF Arm
```

Selecting:

```text
6-DOF Industrial Arm
```

creates:

```text
Base
 ↓
J1
 ↓
L1
 ↓
J2
 ↓
L2
 ↓
J3
 ↓
L3
 ↓
J4
 ↓
L4
 ↓
J5
 ↓
L5
 ↓
J6
 ↓
Flange
 ↓
Tool
 ↓
TCP
```

This is particularly useful for quickly getting to the IK part of the project.

---

# 46. Robot Validation System

Validation runs whenever the graph changes.

```ts
interface ValidationResult {
  valid: boolean;

  errors: ValidationError[];

  warnings: ValidationWarning[];
}
```

Example:

```ts
interface ValidationError {
  nodeId?: string;

  code: string;

  message: string;
}
```

---

# 47. Validation Rules

### R001 — Missing Base

```text
✕ Robot has no Base.
```

### R002 — Multiple Bases

```text
✕ Robot contains multiple Base nodes.
```

### R003 — Missing TCP

```text
✕ Robot has no TCP.
```

### R004 — Disconnected Node

```text
✕ Link 3 is disconnected.
```

### R005 — Cycle

```text
✕ Robot contains a cycle.
```

### R006 — Missing Parent

```text
✕ Joint 3 has no parent.
```

### R007 — Invalid Joint Axis

```text
✕ Joint 2 has an invalid axis.
```

### R008 — Invalid Limits

```text
✕ Joint 2 minimum limit must be less than maximum.
```

### R009 — Invalid Chain

```text
✕ No valid path exists from Base to TCP.
```

---

# 48. Validation UI

Top-right:

```text
┌───────────────────────┐
│ ● Robot Valid         │
└───────────────────────┘
```

Invalid:

```text
┌───────────────────────┐
│ ● 2 Errors             │
└───────────────────────┘
```

Clicking it opens:

```text
VALIDATION

Errors

✕ Joint 3 has no parent
✕ TCP is disconnected

Warnings

⚠ Joint 4 has no velocity limit
```

Clicking an error should select/focus the relevant node.

---

# 49. Robot Definition Output

The builder converts React Flow state into:

```ts
RobotDefinition;
```

Example:

```ts
const robot: RobotDefinition = {
  id: "robot-1",
  name: "My Robot",

  root: "base-1",

  nodes: [
    {
      id: "base-1",
      type: "base",
      name: "Base",
      transform: ...
    },

    {
      id: "joint-1",
      type: "joint",
      name: "Joint 1",
      jointType: "revolute",
      axis: [0, 1, 0],
      limits: {
        min: -Math.PI,
        max: Math.PI
      },
      origin: ...
    }
  ],

  connections: [
    {
      parent: "base-1",
      child: "joint-1"
    }
  ],

  tcp: "tcp-1"
};
```

---

# 50. React Flow State

React Flow state should be considered an **editor representation**, not the final robotics representation.

```text
React Flow Nodes
        +
React Flow Edges
        ↓
   Adapter
        ↓
RobotDefinition
```

Create explicit functions:

```ts
robotDefinitionToFlow();
```

and:

```ts
flowToRobotDefinition();
```

---

# 51. Recommended Types

```ts
type RobotComponentType =
  | "base"
  | "joint"
  | "link"
  | "flange"
  | "tool"
  | "tcp"
  | "gripper";
```

React Flow:

```ts
type RobotNode = Node<RobotNodeData>;
```

---

# 52. Builder Store

Use a dedicated store for builder state.

Example responsibilities:

```text
robot definition
flow nodes
flow edges
selection
history
validation
builder mode
```

Avoid scattering robot state across individual components.

Conceptually:

```ts
interface BuilderState {
  nodes: RobotNode[];
  edges: RobotEdge[];

  selectedNodeIds: string[];

  validation: ValidationResult;

  addNode(): void;
  deleteNodes(): void;
  connectNodes(): void;
  updateNode(): void;

  undo(): void;
  redo(): void;

  validate(): ValidationResult;

  exportRobot(): RobotDefinition;
}
```

---

# 53. Important Separation

There should be three distinct representations:

```text
                 ┌──────────────────┐
                 │ RobotDefinition  │
                 └────────┬─────────┘
                          │
             ┌────────────┴────────────┐
             ▼                         ▼
      React Flow                    3D Scene
       representation               representation
```

Do not store Three.js `Object3D` references inside `RobotDefinition`.

Do not store React Flow nodes inside the robotics engine.

---

# 54. Builder → Simulator Contract

When the user clicks:

```text
[ Simulate ]
```

the application should:

```text
React Flow
    ↓
Validate
    ↓
flowToRobotDefinition()
    ↓
RobotModel
    ↓
Three.js
```

If validation fails:

```text
Cannot simulate.

Fix:
• Joint 4 is disconnected.
• TCP is missing.
```

---

# 55. Save Format

The builder must be exportable independently.

Example:

```json
{
  "version": 1,
  "type": "bot-3f-robot",
  "robot": {
    "id": "robot-1",
    "name": "My Robot",
    "root": "base-1",
    "nodes": [],
    "connections": [],
    "tcp": "tcp-1"
  }
}
```

---

# 56. Import

User can:

```text
Import Robot
```

and load a JSON definition.

The application must:

1. Parse JSON.
2. Validate schema.
3. Validate robot structure.
4. Convert to React Flow.
5. Render the graph.

Invalid files should not crash the application.

---

# 57. Builder State Machine

The builder can be modeled as:

```text
EMPTY
  ↓
BUILDING
  ↓
INVALID
  ↓
VALID
  ↓
SIMULATION_READY
```

More precisely:

```text
Empty
  ↓
User adds Base
  ↓
Building
  ↓
User adds components
  ↓
Validation
  ├── Errors → Invalid
  │
  └── Valid → Ready
                  ↓
              Simulate
```

---

# 58. MVP Acceptance Test

A user must be able to perform this exact workflow:

### Step 1

Open `bot-3f`.

### Step 2

Select:

```text
6-DOF Industrial Arm
```

### Step 3

The graph appears:

```text
Base
 ↓
J1
 ↓
L1
 ↓
J2
 ↓
L2
 ↓
J3
 ↓
L3
 ↓
J4
 ↓
L4
 ↓
J5
 ↓
L5
 ↓
J6
 ↓
Flange
 ↓
Tool
 ↓
TCP
```

### Step 4

Select `Joint 2`.

Change:

```text
Axis = [0, 1, 0]
Min = -120°
Max = 120°
```

### Step 5

Select `Link 2`.

Change:

```text
Length = 400mm
```

### Step 6

Select `TCP`.

Change:

```text
Z = 150mm
```

### Step 7

Click:

```text
Validate
```

Result:

```text
✓ Robot Valid
```

### Step 8

Click:

```text
Simulate
```

The robot definition is passed to the robotics engine.

---

# 59. Phase 1 Implementation Order

Build the React Flow system in this order:

```text
1. React Flow canvas
       ↓
2. Node types
       ↓
3. Palette
       ↓
4. Drag/drop
       ↓
5. Connections
       ↓
6. Connection validation
       ↓
7. Selection
       ↓
8. Properties panel
       ↓
9. Node editing
       ↓
10. Robot validation
       ↓
11. Undo/redo
       ↓
12. Copy/paste
       ↓
13. Templates
       ↓
14. Auto layout
       ↓
15. Export
       ↓
16. Import
       ↓
17. RobotDefinition adapter
```

---

# 60. Definition of Done

The React Flow portion of `bot-3f` is complete when:

- [ ] React Flow canvas exists.
- [ ] Component palette exists.
- [ ] Base node works.
- [ ] Joint node works.
- [ ] Link node works.
- [ ] Flange node works.
- [ ] Tool node works.
- [ ] TCP node works.
- [ ] Gripper node works.
- [ ] Nodes can be added.
- [ ] Nodes can be deleted.
- [ ] Nodes can be renamed.
- [ ] Nodes can be moved.
- [ ] Nodes can be connected.
- [ ] Invalid connections are rejected.
- [ ] Cycles are prevented.
- [ ] Node properties can be edited.
- [ ] Joint axes can be configured.
- [ ] Joint limits can be configured.
- [ ] Link dimensions can be configured.
- [ ] TCP transform can be configured.
- [ ] Robot validation works.
- [ ] Validation errors identify nodes.
- [ ] Undo works.
- [ ] Redo works.
- [ ] Copy/paste works.
- [ ] Robot templates work.
- [ ] Auto-layout works.
- [ ] Robot can be exported.
- [ ] Robot can be imported.
- [ ] React Flow state converts to `RobotDefinition`.
- [ ] A valid robot can be passed to the simulator.

---

# 61. Most Important Architectural Decision

**Do not think of React Flow as a generic flowchart in `bot-3f`.**

It is a **kinematic structure editor**.

The graph has semantic meaning:

```text
[Joint]
    │
    │ physically connected to
    ▼
[Link]
```

The edge isn't just:

> "These two nodes are connected."

It means:

> "This component is the parent in the robot's kinematic hierarchy."

That distinction is what will allow the same graph to eventually drive:

```text
React Flow
     ↓
RobotDefinition
     ↓
Forward Kinematics
     ↓
Inverse Kinematics
     ↓
Grasping
     ↓
Trajectory
     ↓
Three.js simulation
     ↓
Timeline
```

So for the first implementation, **don't touch IK yet**. Build the React Flow editor until it can reliably produce a clean, validated `RobotDefinition`. Once that contract is solid, the FK/IK engine becomes a separate, much easier problem.
