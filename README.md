This project was bootstrapped with [Create React App]

The Client application provides Stop 1 and  Stop 2 line times and the input allows for selection of times for stop of choice 3 to 10 as
the first and second stops are provided by default.

## Essential Script
Upon repo checkout you will need to run the initUpdate to populate 'node_modules'  
### `yarn initUpdate`
###  Press Enter to complete once output appears to have finished.
##### Note: There is separate package.json that goes with the React SPA, you need not interact with it, its scripts are exploited within the root folder 'package.json' scripts...
<br >

## Available Scripts
### `yarn runClient`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn runServer`

Runs the WebSocket server.  This is also the main business logic for calculating the arrival times 

### `yarn runBoth`

Runs the WebSocket server and kickstarts the ReactSPA. This the expected method of running both on a local host and inspect functionality. 
