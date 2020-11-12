# webots.cloud

Contents of https://webots.cloud and https://beta.webots.cloud

The main purpose of webots.cloud is to maintain a listing of GitHub repositories corresponding to various online Webots simulations.

## Setup of a Online Webots Simulation

To setup an online Webots simulation, you will have to choose what kind of simulation you want to create:

### Demo

A demo is a simulation demonstrating some research achievement: a robot solving a problem or demonstrating some interesting capabilities.
It may include some robot window displaying sensor data or other data representing the internal state of the robot.
The robot window may also include the possibility for the user to interact with the simulation while it is running.
For example there could be some buttons to ask the robot to perform some speficic actions, or a slider to apply a force to the robot, or a checkbox to open or close a door, etc.
To setup a Webots repository that contains a demo, you should create it from the https://github.com/cyberbotics/webots-demo-template template repository.
Then, you should commit your specific files: worlds, controllers, protos, robot windows, etc.

### Competition

A competition is a simulation scenario which defines the rules of a challenge. There are basically two kinds of competitions: benchmarks and contests.

#### Benchmark

A benchmark is a simulation scenario which proposes a challenge involving a single participant.
A robot has to address a problem and its behavior is evaluated against a performance metrics.
This performance metrics is a scalar value which allows to compare the performance of different participant against the same challenge.
Several examples of benchmarks are provided on the [robotbenchmark website](https://robotbenchmark.net).

#### Contest

A contest is a simulation scenario involving several participants (generally two participants).
It could be a soccer match between two teams of robots like RoboCup, or a survival game like Rat's Life, or a wrestling competition like Roboka, etc.
The performance metrics is a ranking between the competitors.
It may be implemented as a [round robin](https://en.wikipedia.org/wiki/Round-robin_tournament) tournanent, or with a series of quater finals, semi finals and finals, or using a bubble sort ranking algorithm, or with any other ranking system ([ELO](https://en.wikipedia.org/wiki/Elo_rating_system), [ATP](https://en.wikipedia.org/wiki/ATP_Rankings), etc.).

To setup a Webots repository holding a competition scenario, you should create it from the https://github.com/cyberbotics/webots-competition-template repository.

### Competitor

To setup a Webots repository aimed at participating in a competition, you should create it from the competition template repository, that is provided on the competion repository

## database

webots.cloud holds a database of GitHub repositories containing a Webots simulation:

| id | type        | url                                     | parent | title              | stars | language |
|----|-------------|-----------------------------------------|--------|--------------------|-------|----------|
|  1 | competition | https://github.com/cyberbotics/ratslife |      0 | Rat's Life contest |   943 |        C |
|  2 | competitor  | https://github.com/me/my_entry          |      1 | My Super Rat       |     3 |   Python |
|  3 | demo        | https://github.com/me/my_demo           |      0 | My Webots demo     |    12 |      C++ |

## webots.yaml

webots.cloud parses the `webots.yaml` file at the root level of a repository to determine the required host, the type of Webots repository, dependencies, etc. allowing to run the simulation in the cloud.

### Uses

The version information specified in the `webots.yaml` file indicates which version of Webots is required to run the simulation.
The format is inherited from the GitHub action format: `uses: docker://{host}/{image}:{tag}`.

For example:

```yaml
uses: docker://cyberbotics/webots:R2020b-rev1-ubuntu20.04
```

### Type

Currently, we support 3 different types of repositories:

#### Demo

This is a simple demonstration that can be run as an interactive simulation or viewed as an animation.
The `webots.yaml` file should contain references to the animations and simulations, for example:

```yaml
type: demo
animation:
  worlds:
    - file: worlds/tutorial_6.wbt
      duration: 5
    - file: worlds/tutorial_1.wbt
      duration: 10
simulation:
  worlds:
    - file: worlds/tutorial_2.wbt
      duration: 120
```

The files specified in the `animation` section are used by the CI to generate the corresponding animation on each push.
The files specified in the `simulation` section are used by webots.cloud to list the various simulations available for interactive run sessions.

#### Competition

This type of repository should contain the scenario of a competition, including a supervisor process performing the evalution of the controller(s).

```yaml
type: competition
world: worlds/tutorial_2.wbt
```

#### Competitor

This type of repository should contain an entry to a competition scenario.
It should typically contain only the source code of one robot controller.
Eventually, it may contain also more controllers, PROTO files and other files, specific to a competition scenario.

```yaml
type: competitor
competition: https://github.com/username/competition
```

### Init

Dependencies can be specified in the `init` section of the `webots.yaml` file:

```yaml
init: |
  apt install -y \
    python3-numpy \
    python3-opencv
```

Specifying dependencies may not be allowed for competitor repositories (depending on the corresponding competition repository).
In such a case, the init section will be simply ignored.
