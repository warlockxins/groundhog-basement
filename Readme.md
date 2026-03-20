# Mission

-   Create a web based game.
-   The project should have minimal setup requirements.
-   The final product will be deployed to Fasebook.

# How to start

## Prerequisites

1. [Nodejs](https://nodejs.org/en/) latest stable version (later than v8.9.3). Once it is installed, you can check if it works by writing in terminal:
    ```
    node -v
    ```
    this should give output similar to:
    > v8.9.3
2. Text editor, prefered [Visual Studio Code](https://code.visualstudio.com/)

## Setup

Once Node.js is installed, open terminal.
In the command line you should navigate to the root of this folder:

```
cd FULL_PATH_TO_FOLDER_WHERE_THIS_FILE_IS
```

To install all needed dependencies (listed in package.json) run command:

```
npm install
```

Next, to stard developing with live update, perform:

```
npm run watch
```

you will be able to code and see live changes in the browser.
If you wish to `stop dev server`, just press `Ctrl+C` key combination

## Publish

Once the game is done perform:

```
npm run build
```

This will create `dist` folder in root of this project, which is ready to publish on any website
