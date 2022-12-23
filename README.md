# webots.cloud

This repository holds the contents of https://webots.cloud

For more information, refer to the webots.cloud [documentation page](https://cyberbotics.com/doc/guide/webots-cloud).

webots.cloud is implemented as a Single Page Application (SPA), including the following URL model:
- https://webots.cloud => home page
- https://webots.cloud/scene => scenes listing
- https://webots.cloud/animation => animations listing
- https://webots.cloud/simulation => demos listing
- https://webots.cloud/settings => user settings (private information)
- https://webots.cloud/UL6ZtOI => user page (public information, the URI starts with `/U`)

In addition, specific URLs correspond to different Webots materials.

Scenes and animantions are hosted directly on webots.cloud:

| type                        | data host    | sample URL                                                |
| --------------------------- | ------------ | --------------------------------------------------------- |
| [scene](#Scene)             | webots.cloud | `https://webots.cloud/S0_2Q8O` (the URI starts with `/S`) |
| [animation](#Animation)     | webots.cloud | `https://webots.cloud/AQnPNle` (the URI starts with `/A`) |

Demos and competitions are hosted on GitHub repositories:

| type                        | data host    | sample URL                                                                                    |
| --------------------------- | ------------ | --------------------------------------------------------------------------------------------- |
| [demo](#Demo)               | github.com   | `https://webots.cloud/run?url=https://github.com/user/my-repo/blob/master/worlds/example.wbt` |
| [competition](#Competition) | github.com   | `https://webots.cloud/run?url=https://github.com/user/my-repo/blob/master/worlds/example.wbt` |

## Scene

A scene is a simple 3D model corresponding to a Webots world file. Scenes are static, that is nothing is moving. However, the users can change the viewpoint and zoom in to observe details in a scene.

## Animation

An animation is an animated model. It is usually the recording of a simulation that can be played back by the users.

## Simulaton
### Demo

A demo is a complete Webots simulation project including a world file and one or several robot controllers.
It may demonstrate some research achievement: a robot solving a problem or demonstrating some interesting capabilities.
It may include some robot window displaying sensor data or other data representing the internal state of the robot.
The robot window may also include the possibility for the user to interact with the simulation while it is running.
For example there could be some buttons to ask the robot to perform some speficic actions, or a slider to apply a force to the robot, or a checkbox to open or close a door, etc.
To setup a Webots repository that contains a demo, you should create it from the https://github.com/cyberbotics/webots-demo-template template repository.
Then, you should commit your specific files: worlds, controllers, protos, robot windows, etc.
Finally, you should add a new demo from the https://webots.cloud/demo page and indicate the GitHub URL of your Webots world file, including the tag (or branch) name, e.g., https://github.com/cyberbotics/webots/blob/R2021b/projects/languages/python/worlds/example.wbt.

### Competition

A competition is a simulation scenario which proposes a challenge involving one or two participants.
A robot has to address a problem and its behavior is evaluated against a performance metric.
Several examples of competitions are provided on the [robotbenchmark website](https://robotbenchmark.net).

# Technical Details

## Database

webots.cloud holds a database of GitHub repositories containing a Webots simulation:

| id | type        | url                                     | title                          | stars |
|----|-------------|-----------------------------------------|--------------------------------|-------|
|  1 | competition | https://github.com/me/my_competition    | Obstacle Avoidance Competition |    94 |
|  3 | demo        | https://github.com/me/my_demo           | My Webots demo                 |    12 |

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

Currently, we support 2 different types of repositories:

#### Demo

This is a simple simulation that can be run interactively.
The `webots.yaml` file should contain a reference to the demo type and a publish setting, for example:

```yaml
type: demo
publish: true
```

By default, `publish` is set to `true`. All worlds found in the same directory as the specified world will be be used by webots.cloud and listed as interactive run sessions. When `publish` is set to `false` the simulation will not be uploaded and can be removed from webots.cloud on resynchronization.

#### Competition

This type of repository should contain the scenario of a competition, including a supervisor process performing the evalution of the controller(s) and a publish setting.

```yaml
type: competition
publish: true
```

# Setup of a Simulation Server Infrastructure

Follow the instructions [here](https://cyberbotics.com/doc/guide/web-server).
