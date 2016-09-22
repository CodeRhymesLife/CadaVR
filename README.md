# CadaVR
A virtual reality medical educational environment that leverages structural models of anatomy, natural input, and mathematical models of physiology to help students learn.

### Live Demo
[![CadaVR Promotional Video](https://img.youtube.com/vi/eYyuEjhD-k8/0.jpg)](https://www.youtube.com/watch?v=eYyuEjhD-k8 "CadaVR")

## Local Development and Production Server Instructions

1. Install [Node.js](https://nodejs.org/en/download/).
2. Install [Meteor](https://www.meteor.com/install).
3. Clone this repo:
    ```
    git@github.com:drryanjames/CadaVR.git
    ```

4. Deploy to a local server on your machine:

    1. Open the directory of your Git checkout of the CadaVR project.
    2. Open the [`site`](site/) directory, and run this command:
        ```
        cd site
        ```

    3. To deploy to your local server, run this command:
        ```
        meteor
        ```

5. Deploy to [meteor.com](https://www.meteor.com/):
    1. Open the directory of your Git checkout of the CadaVR project.
    2. Open the [`site`](site/) directory, and run this command:
        ```
        cd site
        ```

    3. To deploy to your local server, run this command:
        ```
        meteor deploy ryancadavr.meteor.com
        ```

        Or replace the URL with a custom one, such as `<yourname>-cadavr.meteor.com`.
        
## Running the [Leap Motion](https://www.leapmotion.com/) Service
To run the Leap Motion service so that other machines can access the Leap device, run the following command:

### Windows
```
LeapSvc --websockets_allow_remote=true --websockets_enabled=true --run
```

### Mac & Linux
```
leapd --websockets_allow_remote=true --websockets_enabled=true --run
```
