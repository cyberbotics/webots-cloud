# beta.webots.cloud

This repository holds the contents of https://webots.cloud (master branch) and https://beta.webots.cloud (beta branch)

webots.cloud is implemented as a Single Page Application (SPA), including the following URL model:
- https://webots.cloud => home page
- https://webots.cloud/scene => scenes listing
- https://webots.cloud/animation => animations listing
- https://webots.cloud/proto => protos listing
- https://webots.cloud/simulation => demos, benchmarks and competitions listing
- https://webots.cloud/settings => user settings (private information)
- https://webots.cloud/UL6ZtOI => user page (public information, the URI starts with `/U`)

In addition, specific URLs correspond to different Webots materials.

Scenes and animantions are hosted directly on webots.cloud:

| type                        | data host    | sample URL                                                |
| --------------------------- | ------------ | --------------------------------------------------------- |
| [scene](#Scene)             | webots.cloud | `https://webots.cloud/S0_2Q8O` (the URI starts with `/S`) |
| [animation](#Animation)     | webots.cloud | `https://webots.cloud/AQnPNle` (the URI starts with `/A`) |

Protos, demos, benchmarks and competitions are hosted on GitHub repositories:

| type                        | data host    | sample URL                                                |
| --------------------------- | ------------ | --------------------------------------------------------- |
| [proto](#Proto)             | github.com   | `https://webots.cloud/run?url=https://github.com/user/my-repo/blob/master/protos/example.proto` |
| [demo](#Demo)               | github.com   | `https://webots.cloud/run?url=https://github.com/user/my-repo/blob/master/worlds/example.wbt` |
| [benchmark](#Benchmark)     | github.com   | `https://webots.cloud/run?url=https://github.com/user/my-repo/blob/master/worlds/example.wbt` |
| [competition](#Competition) | github.com   | `https://webots.cloud/run?url=https://github.com/user/my-repo/blob/master/competition` |

## Scene

A scene is a simple 3D model corresponding to a Webots world file. Scenes are static, that is nothing is moving. However, the users can change the viewpoint and zoom in to observe details in a scene.

## Animation

An animation is an animated model. It is usually the recording of a simulation that can be played back by the users.

## Proto

A proto is a Webots [proto file](https://cyberbotics.com/doc/reference/proto) including possibly textures files and other resources.
It usually represents an object such as a robot, a sensor, an actuator or any passive object, like a chair or a table.
Protos published on webots.cloud can be easily browsed and re-used in any Webots world file.

## Demo

A demo is a complete Webots simulation project including a world file and one or several robot controllers.
It may demonstrate some research achievement: a robot solving a problem or demonstrating some interesting capabilities.
It may include some robot window displaying sensor data or other data representing the internal state of the robot.
The robot window may also include the possibility for the user to interact with the simulation while it is running.
For example there could be some buttons to ask the robot to perform some speficic actions, or a slider to apply a force to the robot, or a checkbox to open or close a door, etc.
To setup a Webots repository that contains a demo, you should create it from the https://github.com/cyberbotics/webots-demo-template template repository.
Then, you should commit your specific files: worlds, controllers, protos, robot windows, etc.
Finally, you should add a new demo from the https://webots.cloud/demo page and indicate the GitHub URL of your Webots world file, including the tag (or branch) name, e.g., https://github.com/cyberbotics/webots/blob/R2021b/projects/languages/python/worlds/example.wbt.

## Benchmark

A benchmark is a simulation scenario which proposes a challenge involving a single participant.
A robot has to address a problem and its behavior is evaluated against a performance metrics.
This performance metrics is a scalar value which allows to compare the performance of different participant against the same challenge.
Several examples of benchmarks are provided on the [robotbenchmark website](https://robotbenchmark.net).

## Competition

A competition is a simulation scenario involving several participants (generally two participants).
It could be a soccer match between two teams of robots like RoboCup, or a survival game like Rat's Life, or a wrestling competition like Roboka, etc.
The performance metrics is a ranking between the competitors.
It may be implemented as a [round robin](https://en.wikipedia.org/wiki/Round-robin_tournament) tournanent, or with a series of quater finals, semi finals and finals, or using a bubble sort ranking algorithm, or with any other ranking system ([ELO](https://en.wikipedia.org/wiki/Elo_rating_system), [ATP](https://en.wikipedia.org/wiki/ATP_Rankings), etc.).

# Technical Details

## Setup

To setup a Webots repository holding a competition scenario, you should create it from the https://github.com/cyberbotics/webots-competition-template repository.

## Competitor

To setup a Webots repository aimed at participating in a competition, you should create it from the competition template repository, that is provided on the competion repository.
It may be a public or a private repository.
You should choose to create a private repository if you don't want that other competitors see your source code.

## Database

webots.cloud holds a database of GitHub repositories containing a Webots simulation:

| id | type        | url                                     | parent | title              | stars | language |
|----|-------------|-----------------------------------------|--------|--------------------|-------|----------|
|  1 | competition | https://github.com/cyberbotics/ratslife |      0 | Rat's Life contest |   943 |        C |
|  2 | competitor  | https://github.com/me/my_entry          |      1 | My Super Rat       |     3 |   Python |
|  3 | demo        | https://github.com/me/my_demo           |      0 | My Webots demo     |    12 |      C++ |

## Dockerfile

The version information specified in the Dockerfile at the root of the repository indicates which version of Webots is required to run the simulation.

For example:

```Dockerfile
FROM cyberbotics/webots:R2020b-rev1-ubuntu20.04
ARG PROJECT_PATH
RUN mkdir -p $PROJECT_PATH
COPY . $PROJECT_PATH
```

## webots.yaml

webots.cloud parses the `webots.yaml` file at the root level of a repository to determine the type of Webots repository, publishing permission, etc. allowing to run the simulation in the cloud.

### Type

Currently, we support 4 different types of repositories:

#### Demo

This is a simple simulation that can be run interactively.
The `webots.yaml` file should contain a reference to the demo type and a publish setting, for example:

```yaml
type: demo
publish: true
```

By default, `publish` is set to `true`. All worlds found in the same directory as the specified world will be be used by webots.cloud and listed as interactive run sessions. When `publish` is set to `false` the simulation will not be uploaded and can be removed from webots.cloud on resynchronization.

#### Benchmark

This type of repository should contain the scenario of a benchmark, including a supervisor process performing the evalution of the controller(s) and a publish setting.

```yaml
type: benchmark
publish: true
```

#### Competition

This type of repository should contain the scenario of a competition, including a supervisor process performing the evalution of the controller(s) and a a publish setting.

```yaml
type: competition
publish: true
```

#### Competitor

This type of repository should contain an entry to a competition or benchmark scenario.
It should typically contain only the source code of one robot controller.
Eventually, it may contain also more controllers, PROTO files and other files, specific to a competition/benchmark scenario.

```yaml
type: competitor
competition: https://github.com/username/competition
```

```yaml
type: competitor
benchmark: https://github.com/username/benchmark
```

## Behind the Scene

The template competitor repository should contain a GitHub action that performs the following:

1. Check that the competitor has all the necessary files and information in the repository.
2. Register a [deploy key](https://docs.github.com/en/free-pro-team@latest/developers/overview/managing-deploy-keys) with the public key of the competition so that the competition can clone the private repository of the competitor.
3. Register the competitor so that it is known by the competition.

# Setup of a Simulation Server Infrastructure

Follow the instructions [here](https://github.com/cyberbotics/webots-cloud/wiki).
