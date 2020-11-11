# webots-cloud
Contents of https://webots.cloud and https://beta.webots.cloud

## webots.yaml

webots.cloud parses the `webots.yaml` file at the root level of a repository to determine the required version of Webots, the type of Webots repository, dependencies, etc. allowing to run the simulation in the cloud.

### Version

The version information specified in the `webots.yaml` file indicates which version of Webots is required to run the simulation.

```yaml
version: R2020b-rev1
```

### Type of Repository

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
    - file: worlds/tutorial_2.wbt
      duration: 120
```

The files specified in the `animation` section are used by the CI to generate the corresponding animation on each push.
The files specified in the `simulation` section are used by webots.cloud to list the various simulations available for interactive run sessions.

#### Competition

This type of repository should contain the scenario of a competition, including a supervisor process performing the evalution of the controller(s).

```yaml
type: competition
```

#### Competitor

This type of repository should contain an entry to a competition scenario.
It should typically contain only the source code of one robot controller.
Eventually, it may contain also more controllers, PROTO files and other files, specific to a competition scenario.

```yaml
type: competitor
competition: https://github.com/username/competition
```

### Dependencies

Dependencies can be specified in the `init` section of the `webots.yaml` file:

```yaml
init: |
  apt install -y \
    python3-numpy \
    python3-opencv
```
