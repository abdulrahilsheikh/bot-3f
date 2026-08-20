# PRD — bot-3f

**Project Name:** `bot-3f`
**Type:** Browser-based robotic arm builder, inverse-kinematics solver, manipulation simulator, and animation environment
**Status:** Product Requirements Document
**Primary Stack:** React + TypeScript + Three.js / React Three Fiber + React Flow
**Target Platform:** Modern web browsers
**Primary Goal:** Build, configure, simulate, and animate robotic arms directly in the browser.

---

# 1. Product Overview

`bot-3f` is a browser-based robotics environment for creating and simulating articulated robotic arms.

The core feature is a **visual robot builder** where users construct a robot's physical and kinematic structure using a node-based editor. The resulting robot is rendered and simulated in Three.js.

The system provides:

- Visual kinematic robot construction
- Forward kinematics (FK)
- Full 6D pose inverse kinematics (IK)
- Joint limits
- TCP/tool frames
- Target-pose manipulation
- Grasp points
- Gripper interaction
- Object attachment and release
- Basic collision detection
- Motion/trajectory generation
- Robot animation
- Timeline-based animation editing
- Save/load robot definitions
- Diagnostics and solver visualization

The central use case is:

> **Build a KUKA-like robotic arm → place an object → define/select a grasp → solve the required TCP pose → solve IK → move the robot → grab the object → move it → release it.**

---

# 2. Product Vision

`bot-3f` should feel like a lightweight combination of:

- a robotic kinematic model editor
- a CAD-inspired robot builder
- an IK laboratory
- a robot simulator
- an animation editor

The application should allow users to understand and experiment with robotic manipulation without requiring ROS, MATLAB, Python, or physical hardware.

---

# 3. Core Product Principle

The project must be built around the following architecture:

```text
                    ROBOT BUILDER
                         │
                         ▼
                  ROBOT DEFINITION
                         │
             ┌───────────┴───────────┐
             │                       │
             ▼                       ▼
            FK                      IK
                                     │
                              TARGET TCP POSE
                                     │
                                     ▼
                              GRASP / TOOL
                                     │
                                     ▼
                              MOTION PLANNER
                                     │
                                     ▼
                                TRAJECTORY
                                     │
                                     ▼
                                ANIMATION
                                     │
                                     ▼
                                THREE.JS
```

React Flow is the **robot structure editor**.

Three.js is the **robot visualization and simulation environment**.

The robotics engine is independent of both.

---

# 4. Goals

## Primary Goals

1. Allow users to construct articulated robots visually.
2. Represent the robot as a valid kinematic chain.
3. Render the resulting robot in 3D.
4. Implement reliable forward kinematics.
5. Implement full-pose inverse kinematics.
6. Support KUKA-like 6-DOF robotic arms.
7. Allow users to manipulate an IK target in 3D.
8. Support position + orientation targets.
9. Support TCP/tool frames.
10. Support object grasping.
11. Support pick-and-place.
12. Generate smooth robot motion.
13. Provide a foundation for a timeline editor.
14. Keep the robotics engine independent from UI frameworks.

---

# 5. Non-Goals

The initial version will **not** attempt to become a full CAD system.

Do not initially implement:

- arbitrary solid modeling
- sketch constraints
- boolean CAD operations
- NURBS
- mesh sculpting
- full URDF compatibility
- ROS integration
- physical robot control
- advanced physics simulation
- sophisticated path planning
- industrial-grade collision detection
- analytical KUKA-specific IK
- multi-robot coordination

These can be future extensions.

---

# 6. Target Users

### Primary

- Developers interested in robotics
- Three.js developers
- Robotics students
- Computer graphics developers
- Engineers experimenting with IK
- Developers building robotics interfaces

### Secondary

- Students learning forward/inverse kinematics
- People experimenting with robot manipulation
- Developers interested in browser-based simulation

---

# 7. Core User Journey

The primary user journey is:

```text
Create Project
      ↓
Build Robot
      ↓
Configure Joints
      ↓
Configure Links
      ↓
Add Tool/TCP
      ↓
Validate Robot
      ↓
Enter Simulation
      ↓
Place Object
      ↓
Create Grasp Point
      ↓
Select Grasp
      ↓
Generate TCP Target
      ↓
Solve IK
      ↓
Move Robot
      ↓
Close Gripper
      ↓
Grab Object
      ↓
Move to Destination
      ↓
Release Object
      ↓
Create / Edit Animation
```

---

# 8. Application Layout

The main interface should be divided into three primary areas.

```text
┌───────────────────────────────────────────────────────────────┐
│ bot-3f                              Save   Run   Reset       │
├───────────────┬────────────────────────────┬──────────────────┤
│               │                            │                  │
│ COMPONENTS    │       ROBOT GRAPH          │    3D VIEW       │
│               │                            │                  │
│ Base          │                            │                  │
│ Joint         │       [Base]               │                  │
│ Link          │          │                 │        🤖        │
│ Flange        │       [Joint]              │         │        │
│ Tool          │          │                 │       [Box]      │
│ TCP           │       [Link]               │                  │
│ Gripper       │          │                 │                  │
│               │       [Joint]              │                  │
│               │          │                 │                  │
│               │       [Link]               │                  │
│               │                            │                  │
├───────────────┴────────────────────────────┴──────────────────┤
│ Properties / IK Diagnostics / Objects / Timeline              │
└───────────────────────────────────────────────────────────────┘
```

---

# 9. Application Modes

The application should eventually have four modes.

## 9.1 Build

Construct the robot.

```text
React Flow
+
Properties
+
Robot validation
```

## 9.2 Simulate

Interact with the robot and objects.

```text
Three.js
+
IK
+
FK
+
Gripper
+
Collision
```

## 9.3 Animate

Edit robot motion.

```text
Timeline
+
Keyframes
+
Trajectories
```

## 9.4 Program

Future feature.

```text
React Flow program graph
+
Robot execution
```

The program builder is **not part of the initial core**.

---

# 10. Robot Model

The robot is represented as a kinematic tree.

For the MVP, support a single serial chain.

Example:

```text
Base
 │
 ▼
Joint 1
 │
 ▼
Link 1
 │
 ▼
Joint 2
 │
 ▼
Link 2
 │
 ▼
Joint 3
 │
 ▼
Link 3
 │
 ▼
Joint 4
 │
 ▼
Link 4
 │
 ▼
Joint 5
 │
 ▼
Link 5
 │
 ▼
Joint 6
 │
 ▼
Flange
 │
 ▼
Tool
 │
 ▼
TCP
```

---

# 11. Robot Components

The builder supports the following components.

```text
BASE
JOINT
LINK
FLANGE
TOOL
TCP
GRIPPER
```

---

# 12. Base

The base represents the fixed root of the robot.

Properties:

```ts
interface BaseDefinition {
  id: string;
  type: "base";

  transform: Transform;

  geometry?: GeometryDefinition;
}
```

The base cannot have a parent.

There must be exactly one base in a valid robot.

---

# 13. Joint

Two joint types should be supported.

### Revolute

Rotational joint.

### Prismatic

Linear joint.

MVP priority:

> Revolute joints.

Definition:

```ts
interface JointDefinition {
  id: string;
  type: "joint";

  jointType: "revolute" | "prismatic";

  axis: Vector3;

  origin: Transform;

  limits: {
    min: number;
    max: number;
  };

  velocityLimit?: number;
  accelerationLimit?: number;
}
```

---

# 14. Joint Requirements

Every joint must have:

- unique ID
- valid parent
- joint type
- valid axis
- minimum limit
- maximum limit

Validation:

```text
✓ Axis normalized
✓ Min < Max
✓ Valid parent
✓ No cycles
```

---

# 15. Link

A link represents a physical robot segment.

V1 geometry types:

```text
Box
Cylinder
```

Definition:

```ts
interface LinkDefinition {
  id: string;
  type: "link";

  geometry: {
    type: "box" | "cylinder";
    dimensions: Vector3;
  };

  transform: Transform;

  visual: {
    color: string;
  };

  collision?: {
    enabled: boolean;
  };

  mass?: number;
}
```

---

# 16. Flange

The flange represents the robot's final mechanical interface.

```ts
interface FlangeDefinition {
  id: string;
  type: "flange";

  transform: Transform;
}
```

---

# 17. Tool

A tool is mounted to the flange.

Examples:

- gripper
- suction cup
- welding tool
- custom tool

V1 only requires a generic tool and gripper.

---

# 18. TCP

The Tool Center Point is the frame used by IK.

Hierarchy:

```text
Flange
   ↓
Tool
   ↓
TCP
```

Definition:

```ts
interface TCPDefinition {
  id: string;
  type: "tcp";

  transform: Transform;
}
```

The solver operates on the TCP rather than directly on the robot flange.

---

# 19. Coordinate System

Use a consistent world coordinate system throughout the application.

Recommended:

```text
X → right
Y → up
Z → forward
```

All transformations must use the same coordinate convention.

---

# 20. Transform Representation

Use:

```ts
interface Transform {
  position: Vector3;
  rotation: Quaternion;
  scale?: Vector3;
}
```

Quaternions should be the internal representation of orientation.

Euler angles may be exposed in the UI for convenience.

---

# 21. Robot Definition

The entire robot should be represented by a serializable definition.

```ts
interface RobotDefinition {
  id: string;
  name: string;

  root: string;

  nodes: RobotComponent[];

  connections: RobotConnection[];

  tcp: string;
}
```

Connections:

```ts
interface RobotConnection {
  parent: string;
  child: string;
}
```

This becomes the **single source of truth**.

---

# 22. React Flow Kinematic Builder

React Flow is used to edit the robot definition.

Each physical component is represented as a node.

Example:

```text
[BASE]
   │
   ▼
[JOINT 1]
   │
   ▼
[LINK 1]
   │
   ▼
[JOINT 2]
   │
   ▼
[LINK 2]
   │
   ▼
[JOINT 3]
```

---

# 23. React Flow Nodes

Required nodes:

```text
BaseNode
JointNode
LinkNode
FlangeNode
ToolNode
TCPNode
GripperNode
```

Each node displays its primary properties.

Example:

```text
┌──────────────────────┐
│ ⚙ JOINT 2            │
├──────────────────────┤
│ Revolute              │
│ Axis: Y               │
│ -120° → 120°          │
└──────────────────────┘
```

---

# 24. Node Connections

Nodes are connected through React Flow edges.

Only valid physical relationships should be allowed.

For example:

```text
Base → Joint
Joint → Link
Link → Joint
Joint → Link
...
Joint → Flange
Flange → Tool
Tool → TCP
```

Invalid relationships should be rejected.

---

# 25. Robot Builder Properties Panel

Selecting a node opens its properties.

Example joint:

```text
JOINT 2

Type
[ Revolute ]

Axis

X [0]
Y [1]
Z [0]

Limits

Min [-120°]
Max [120°]

Velocity
[180°/s]

Acceleration
[360°/s²]
```

Changes must immediately update the robot definition.

---

# 26. Three.js Synchronization

The architecture must be:

```text
React Flow
     ↓
RobotDefinition
     ↓
KinematicModel
     ↓
Three.js Scene
```

Never make the Three.js scene the source of truth.

---

# 27. Kinematic Model

Create an independent robotics engine.

Example:

```ts
class RobotModel {
  definition: RobotDefinition;

  forwardKinematics(joints: number[]): Pose;

  getChain(endEffector: string): KinematicChain;
}
```

The model should not import React, React Flow, or React Three Fiber.

---

# 28. Forward Kinematics

FK takes joint values and calculates the position/orientation of every link and the TCP.

Input:

```ts
q = [q1, q2, q3, q4, q5, q6];
```

Output:

```ts
{
  tcp: Pose;

  joints: Pose[];

  links: Pose[];
}
```

---

# 29. FK Requirements

For a valid robot:

```text
joint values
      ↓
FK
      ↓
joint transforms
      ↓
link transforms
      ↓
TCP transform
```

The Three.js robot must match the calculated transforms.

---

# 30. Inverse Kinematics

IK is the core algorithm.

Input:

```ts
targetPose: Pose;
```

Output:

```ts
jointValues: number[]
```

The target pose contains:

```text
Position
X
Y
Z

Orientation
Rx
Ry
Rz
```

Internally orientation should be represented using a quaternion or rotation matrix.

---

# 31. IK Algorithm

Initial implementation:

> Damped Least Squares numerical IK.

Algorithm:

```text
Current Joint Values
        ↓
Forward Kinematics
        ↓
Current TCP Pose
        ↓
Pose Error
        ↓
Jacobian
        ↓
Damped Least Squares
        ↓
Joint Delta
        ↓
Apply Joint Limits
        ↓
Repeat
```

---

# 32. Pose Error

The error vector is:

```text
[dx]
[dy]
[dz]
[rx]
[ry]
[rz]
```

The first three values represent positional error.

The last three represent rotational error.

---

# 33. IK Solver API

```ts
interface IKSolverOptions {
  maxIterations: number;
  tolerance: number;
  damping: number;

  positionWeight: number;
  orientationWeight: number;
}

interface IKRequest {
  robot: RobotModel;

  target: Pose;

  initialGuess: number[];

  options: IKSolverOptions;
}

interface IKResult {
  success: boolean;

  joints: number[];

  iterations: number;

  positionError: number;

  orientationError: number;

  totalError: number;
}
```

API:

```ts
solveIK(request: IKRequest): IKResult;
```

---

# 34. IK Initial Guess

The current robot configuration should normally be used as the initial guess.

```text
current robot
     ↓
current joints
     ↓
IK initial guess
     ↓
target
     ↓
solution
```

This helps maintain continuity when dragging a target.

---

# 35. Joint Limits

IK must respect joint limits.

Example:

```text
J1  -170° → +170°
J2  -120° → +120°
J3  -170° → +170°
J4  -180° → +180°
J5  -120° → +120°
J6  -360° → +360°
```

A solution violating limits must not be accepted.

---

# 36. IK Target

The 3D scene contains an independent IK target.

```text
Robot
Object
IKTarget
```

The target has:

```ts
interface IKTarget {
  position: Vector3;
  orientation: Quaternion;
}
```

---

# 37. Target Gizmo

Users can manipulate the target using translation and rotation controls.

Required interactions:

```text
Translate X
Translate Y
Translate Z

Rotate X
Rotate Y
Rotate Z
```

Dragging the target should continuously update IK.

---

# 38. IK Target Visualization

Show:

```text
        Z
        ↑
        │
        ●──────→ X
       /
      /
     Y
```

The target should clearly display orientation.

---

# 39. IK Feedback

The UI should show:

```text
IK STATUS

✓ SOLUTION FOUND

Position Error
0.32 mm

Orientation Error
0.06°

Iterations
18

Solve Time
1.7 ms
```

Failure:

```text
✕ NO SOLUTION

Possible reasons:

• Target unreachable
• Joint limits
• Singular configuration
• Invalid robot
```

---

# 40. Graspable Objects

The scene supports objects that can be manipulated.

V1:

```text
Box
Cylinder
Sphere
```

Object definition:

```ts
interface SceneObject {
  id: string;

  type: "box" | "cylinder" | "sphere";

  transform: Transform;

  dimensions: Vector3;

  grabbable: boolean;

  grasps: GraspPoint[];
}
```

---

# 41. Grasp Point

A grasp point represents a valid tool pose relative to an object.

```ts
interface GraspPoint {
  id: string;

  name: string;

  transform: Transform;

  approachDirection?: Vector3;
}
```

Example:

```text
        BOX

     ┌─────────┐
     │    ↓    │
     │    ●    │
     │         │
     └─────────┘

          ●
       grasp frame
```

---

# 42. Grasp Workflow

User:

1. Selects object.
2. Selects grasp point.
3. System calculates grasp pose.
4. Grasp pose becomes TCP target.
5. IK solves for joint configuration.
6. Robot moves to target.
7. Gripper closes.
8. Object attaches to TCP.

---

# 43. Grasp Pose

The system must align:

```text
TCP transform
        ==
Grasp transform
```

Not simply:

```text
TCP position
        ==
Object position
```

Orientation is part of the grasp.

---

# 44. Multiple Grasp Points

Objects may expose multiple grasp candidates.

Example:

```text
Box

● top
● front
● side
```

The system can evaluate candidates.

```text
candidate grasp
      ↓
IK
      ↓
joint limits
      ↓
collision
      ↓
valid?
```

The first valid solution can be selected in V1.

---

# 45. Gripper

The gripper has states:

```text
OPEN
CLOSING
CLOSED
HOLDING
```

Example:

```ts
interface GripperState {
  state: "open" | "closing" | "closed" | "holding";

  opening: number;
}
```

---

# 46. Grab

When the robot reaches a valid grasp:

```text
Move to grasp
      ↓
Close gripper
      ↓
Validate grasp
      ↓
Attach object
```

The object's world transform should be preserved when attaching.

---

# 47. Object Attachment

Before grabbing:

```text
Scene
├── Robot
└── Box
```

After grabbing:

```text
Scene
└── Robot
    └── TCP
        └── Box
```

The box should follow the TCP.

---

# 48. Release

Release:

```text
Open gripper
      ↓
Detach object
      ↓
Object remains in world
```

The object's world transform should remain unchanged.

---

# 49. Collision Detection

V1 uses simple collision primitives.

Supported:

```text
Box
Sphere
Capsule
```

Robot links and objects can have collision geometry.

Collision pipeline:

```text
IK solution
     ↓
Joint limits
     ↓
Collision check
     ↓
Accept / Reject
```

---

# 50. Motion Planning

IK only produces a target joint configuration.

It does not produce a safe path.

The motion system takes:

```text
current joints
target joints
```

and generates:

```text
trajectory
```

V1:

> Linear interpolation in joint space.

---

# 51. Trajectory

```ts
interface TrajectoryPoint {
  time: number;
  joints: number[];
}

interface Trajectory {
  duration: number;
  points: TrajectoryPoint[];
}
```

Example:

```text
0.0s → [q1, q2, q3, q4, q5, q6]
0.1s → [...]
0.2s → [...]
...
2.0s → target
```

---

# 52. Animation Engine

The animation engine consumes trajectories.

```text
Trajectory
    ↓
time
    ↓
interpolate
    ↓
joint values
    ↓
FK
    ↓
Three.js
```

---

# 53. Timeline Editor

Timeline is a later layer on top of the trajectory system.

Example:

```text
0s       1s       2s       3s       4s
│        │        │        │        │
◆────────────◆
         Move

                   ◆───────◆
                   Grab

                             ◆────────◆
                             Move
```

Tracks:

```text
Joint 1
Joint 2
Joint 3
Joint 4
Joint 5
Joint 6
TCP
Gripper
Events
```

---

# 54. Timeline Events

Support:

```text
MOVE
GRAB
RELEASE
GRIPPER_OPEN
GRIPPER_CLOSE
WAIT
MARKER
```

---

# 55. Save / Load

The entire project must be serializable to JSON.

Example:

```json
{
  "version": 1,
  "robot": {},
  "objects": [],
  "timeline": {},
  "settings": {}
}
```

The project must be loadable without losing:

- robot structure
- joint settings
- geometry
- object transforms
- grasp points
- animation
- timeline
- configuration

---

# 56. Project State

Separate state into:

```text
ProjectState
│
├── RobotDefinition
│
├── RobotState
│
├── SceneObjects
│
├── IKState
│
├── TrajectoryState
│
└── TimelineState
```

---

# 57. Important Architecture Rule

Do not allow React Flow nodes to directly manipulate Three.js objects.

Instead:

```text
React Flow
      ↓
RobotDefinition
      ↓
Robotics Engine
      ↓
Three.js Adapter
      ↓
Scene
```

This keeps the project maintainable.

---

# 58. Robotics Engine

Create a framework-independent package/module:

```text
src/core/
├── math/
├── robot/
├── kinematics/
│   ├── forward.ts
│   ├── jacobian.ts
│   └── inverse.ts
├── collision/
├── motion/
├── grasp/
└── trajectory/
```

This code should not depend on React.

---

# 59. UI Architecture

```text
src/
├── app/
├── components/
├── builder/
├── simulator/
├── timeline/
├── scene/
└── core/
```

---

# 60. Suggested Project Structure

```text
bot-3f/
│
├── src/
│   │
│   ├── app/
│   │   ├── App.tsx
│   │   └── routes.ts
│   │
│   ├── core/
│   │   ├── math/
│   │   │   ├── vector.ts
│   │   │   ├── quaternion.ts
│   │   │   └── transform.ts
│   │   │
│   │   ├── robot/
│   │   │   ├── RobotModel.ts
│   │   │   ├── RobotDefinition.ts
│   │   │   ├── Joint.ts
│   │   │   └── Link.ts
│   │   │
│   │   ├── kinematics/
│   │   │   ├── forward.ts
│   │   │   ├── jacobian.ts
│   │   │   ├── poseError.ts
│   │   │   └── inverse.ts
│   │   │
│   │   ├── grasp/
│   │   │   ├── GraspPoint.ts
│   │   │   └── graspSolver.ts
│   │   │
│   │   ├── collision/
│   │   │   └── collision.ts
│   │   │
│   │   └── motion/
│   │       ├── trajectory.ts
│   │       └── planner.ts
│   │
│   ├── builder/
│   │   ├── RobotBuilder.tsx
│   │   ├── nodes/
│   │   │   ├── BaseNode.tsx
│   │   │   ├── JointNode.tsx
│   │   │   ├── LinkNode.tsx
│   │   │   ├── ToolNode.tsx
│   │   │   └── TCPNode.tsx
│   │   ├── NodePalette.tsx
│   │   └── PropertiesPanel.tsx
│   │
│   ├── simulator/
│   │   ├── Simulator.tsx
│   │   ├── IKTarget.tsx
│   │   ├── GraspGizmo.tsx
│   │   └── Diagnostics.tsx
│   │
│   ├── scene/
│   │   ├── RobotScene.tsx
│   │   ├── RobotRenderer.tsx
│   │   ├── ObjectRenderer.tsx
│   │   └── Controls.tsx
│   │
│   └── timeline/
│       ├── Timeline.tsx
│       ├── Track.tsx
│       ├── Keyframe.tsx
│       └── Playhead.tsx
│
├── public/
│
├── package.json
└── README.md
```

---

# 61. Performance

IK solving should eventually run inside a Web Worker.

```text
Main Thread
│
├── React
├── React Flow
└── Three.js

Worker
│
└── IK Solver
```

Main thread sends:

```text
robot definition
joint state
target pose
```

Worker returns:

```text
IK result
joint values
diagnostics
```

The solver should remain deterministic and framework-independent.

---

# 62. UX Requirements

The application should feel like a professional technical tool.

Use:

- dark UI
- compact controls
- clear numeric values
- keyboard shortcuts
- snapping
- gizmos
- hover states
- status indicators
- error diagnostics

Avoid overly decorative UI.

The 3D viewport should remain the primary visual focus.

---

# 63. Robot Builder UX

The user should be able to:

### Add

Drag:

```text
Joint
Link
Tool
TCP
```

onto the canvas.

### Connect

Drag handles between nodes.

### Configure

Click a node.

### Delete

Delete selected node.

### Reorder

Change chain relationships.

### Preview

Every graph change updates the 3D robot.

---

# 64. Robot Validation

The application should continuously validate the robot.

Validation states:

```text
VALID
WARNING
ERROR
```

Example:

```text
✓ Robot valid
✓ 6 joints
✓ TCP configured
✓ All limits valid
```

---

# 65. Simulation Controls

Required:

```text
▶ Play
⏸ Pause
⏹ Stop
↶ Reset
```

Joint controls:

```text
J1 [────────●────]
J2 [────●────────]
J3 [──────────●──]
...
```

These controls are useful for debugging FK and IK.

---

# 66. Workspace

The 3D scene should contain:

```text
Floor
Grid
Robot
Objects
IK Target
Grasp Points
Coordinate Gizmos
```

The floor should use a clean white/light material with a subtle grid.

---

# 67. Camera

Support:

- orbit
- pan
- zoom
- focus selected object
- focus robot
- reset camera

---

# 68. Robot Visualization

Display:

- links
- joints
- joint axes
- TCP
- tool
- collision geometry optionally

Debug mode:

```text
J1 axis
J2 axis
J3 axis
...
TCP frame
```

---

# 69. Error Handling

The application must gracefully handle:

### Unreachable target

```text
Target is outside the robot's reachable workspace.
```

### Joint limit

```text
IK solution violates Joint 3 limits.
```

### Singular configuration

```text
Robot is near a singular configuration.
```

### Invalid robot

```text
Robot definition is incomplete.
```

### Collision

```text
Candidate configuration causes a collision.
```

---

# 70. Acceptance Criteria — Core

The MVP is complete when all of the following work.

### Robot Builder

- [ ] Create base
- [ ] Add joints
- [ ] Add links
- [ ] Connect components
- [ ] Configure joint axes
- [ ] Configure joint limits
- [ ] Add flange
- [ ] Add tool
- [ ] Add TCP
- [ ] Validate robot
- [ ] Render robot in Three.js

### Kinematics

- [ ] Forward kinematics works
- [ ] TCP pose is correct
- [ ] Joint limits are respected
- [ ] Jacobian calculation works
- [ ] Numerical IK works
- [ ] Position error is calculated
- [ ] Orientation error is calculated
- [ ] Full pose IK works

### Simulation

- [ ] IK target can be moved
- [ ] Robot follows target
- [ ] Target orientation can be changed
- [ ] Joint values update in real time
- [ ] Solver diagnostics are visible

### Manipulation

- [ ] Create object
- [ ] Create grasp point
- [ ] Select grasp point
- [ ] Solve grasp pose
- [ ] Move to grasp
- [ ] Close gripper
- [ ] Attach object
- [ ] Move object
- [ ] Release object

---

# 71. MVP Milestones

## Milestone 1 — Robot Model

**Goal:** Create a robot definition.

Deliver:

```text
Base
 ↓
J1
 ↓
Link
 ↓
J2
 ↓
Link
 ↓
J3
 ↓
...
```

---

## Milestone 2 — Three.js Renderer

**Goal:** Render the robot.

Deliver:

- joints
- links
- transforms
- joint controls
- floor
- grid

---

## Milestone 3 — Forward Kinematics

**Goal:** Make the robot mathematically correct.

Deliver:

```text
joint angles
 ↓
FK
 ↓
TCP
```

---

## Milestone 4 — IK

**Goal:** Make the robot solve target poses.

Deliver:

```text
TCP target
 ↓
6D IK
 ↓
joint angles
```

This is the **first major technical milestone**.

---

## Milestone 5 — Grasping

**Goal:** Manipulate objects.

Deliver:

```text
Object
 ↓
Grasp point
 ↓
TCP target
 ↓
IK
 ↓
Gripper
 ↓
Grab
```

---

## Milestone 6 — Motion

**Goal:** Smooth movement.

Deliver:

```text
start joints
 ↓
trajectory
 ↓
target joints
```

---

## Milestone 7 — Timeline

**Goal:** Author robot animations.

Deliver:

```text
Joint tracks
TCP tracks
Gripper tracks
Events
Playhead
Scrubbing
```

---

# 72. Future Roadmap

After MVP:

### Advanced IK

- multiple solutions
- null-space optimization
- joint-center optimization
- singularity avoidance
- weighted joints
- position/orientation constraints

### Motion Planning

- Cartesian paths
- RRT
- RRT\*
- collision-aware trajectories
- velocity/acceleration constraints

### Manipulation

- automatic grasp selection
- approach/retract poses
- grasp scoring
- object orientation constraints

### Robot Formats

Potential future support:

```text
URDF
DH parameters
custom JSON
```

### Simulation

Potential future support:

```text
rigid-body physics
gravity
contact
friction
```

### Program Builder

Eventually:

```text
[Move]
   ↓
[Grab]
   ↓
[Move]
   ↓
[Release]
```

---

# 73. Definition of Done

`bot-3f` reaches its first complete release when a user can:

1. Open the browser application.
2. Build a six-axis robot using the kinematic builder.
3. Configure joint axes and limits.
4. Add a TCP.
5. See the robot rendered in Three.js.
6. Move joints manually.
7. Verify forward kinematics.
8. Create an IK target.
9. Move and rotate the target.
10. Have the robot solve the complete 6D pose.
11. See IK diagnostics.
12. Add a box.
13. Add a grasp point.
14. Select the grasp point.
15. Automatically generate the required TCP pose.
16. Solve IK.
17. Move the robot to the object.
18. Close the gripper.
19. Attach the object.
20. Move the robot to another pose.
21. Release the object.
22. See the complete pick-and-place operation.
23. Save the project.
24. Reload the project without losing the robot or scene.

---

# 74. Final Core Architecture

```text
                              bot-3f
                                │
              ┌─────────────────┴─────────────────┐
              │                                   │
        ROBOT BUILDER                         3D WORKSPACE
        React Flow                            Three.js/R3F
              │                                   │
              └─────────────────┬─────────────────┘
                                │
                                ▼
                       ROBOT DEFINITION
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    ▼                       ▼
                   FK                      IK
                                            │
                                    ┌───────┴───────┐
                                    │               │
                               TARGET POSE      JOINT LIMITS
                                    │               │
                                    └───────┬───────┘
                                            │
                                            ▼
                                     IK SOLUTION
                                            │
                                            ▼
                                     COLLISION CHECK
                                            │
                                            ▼
                                    MOTION PLANNER
                                            │
                                            ▼
                                      TRAJECTORY
                                            │
                          ┌─────────────────┴─────────────────┐
                          │                                   │
                          ▼                                   ▼
                     ANIMATION                            GRASPING
                          │                                   │
                          ▼                                   ▼
                      TIMELINE                           GRIPPER
                                                              │
                                                              ▼
                                                            OBJECT
```

## The core loop

```text
BUILD
  ↓
MODEL
  ↓
FK
  ↓
TARGET
  ↓
6D IK
  ↓
GRASP
  ↓
MOTION
  ↓
SIMULATE
  ↓
ANIMATE
```

**The most important implementation decision:** keep `core/` completely independent of React and Three.js. `bot-3f` should have a real robotics engine underneath the UI. That way the React Flow builder, Three.js simulator, and future timeline are all clients of the same mathematical model rather than three systems fighting over robot state.
