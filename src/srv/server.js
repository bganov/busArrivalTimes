const io = require("socket.io")(httpServer, {
     origins: ["https://localhost", "http://localhost", "http://localhost:1337", "ws://localhost:1337"]
});
const PORT = 1337
const DISTANCE_BETWEEN_STOPS = 2
const BUS_LINE_NEXT_CAR = 15;

const log = (data) => {console.log(data)}

// Used in calculation of arrival times.
const busLineMinutesOffset = [ -2, 0, 2 ];


const calculateArrivalTimes = (socket, request) => {
    
    var minutes = (new Date(request.requestedTimestamp)).getMinutes();
    var { busStops } = request;
    var allStopsTimes = [];
    
    busStops.forEach( (busStop, idx, arry) => {
        var linesNextStopTimes = [];
        busLineMinutesOffset.forEach( (offset, idx, arry) => {        
            var startingStopMinutes  = (offset + (busStop * DISTANCE_BETWEEN_STOPS))
            while(startingStopMinutes < minutes) {
                startingStopMinutes  +=  BUS_LINE_NEXT_CAR;
            }
            var incoming =  startingStopMinutes  - minutes;
            linesNextStopTimes.push({incoming: incoming, following: incoming + BUS_LINE_NEXT_CAR})    
        });
        allStopsTimes.push(linesNextStopTimes)
    });
    socket.emit("updatedArrivalTimes", allStopsTimes)
}


io.on('connection', (socket) => {
    
    socket.on('disconnect', (data) => { 
    })
  
    socket.on('requestTimes', (request) => { 
        calculateArrivalTimes(socket, request);
    });
});
  
io.listen(PORT);
console.log('Listening on port ' + PORT + '...')
  
