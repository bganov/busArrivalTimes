
const PORT = 1337
const DISTANCE_BETWEEN_STOPS = 2
const BUS_LINE_NEXT_CAR = 15;

var http  = require("http");
var Server =  require("socket.io");

const httpServer = http.createServer();
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
  
// Used in calculation of arrival times.
const busLineMinutesOffset = [ -2, 0, 2 ];


const calculateArrivalTimes = (socket, request) => {
    
    var minutes = (new Date(request.requestedTimestamp)).getMinutes();
    var { busStops } = request;
    var allStopsTimes = [];
    
    busStops.forEach( (busStop, idx, arry) => {
        var linesNextStopTimes = [];
        if(arry[idx] != null) {
         
            busLineMinutesOffset.forEach( (offset, idx, arry) => {        
                var startingStopMinutes  = (offset + (busStop * DISTANCE_BETWEEN_STOPS))
                while(startingStopMinutes < minutes) {
                    startingStopMinutes  +=  BUS_LINE_NEXT_CAR;
                }
                var incoming =  startingStopMinutes  - minutes;
                linesNextStopTimes.push({incoming: incoming, following: incoming + BUS_LINE_NEXT_CAR})    
            });
            allStopsTimes.push(linesNextStopTimes);
        }
    });
    socket.emit("updatedArrivalTimes", allStopsTimes)
    
}

io.on('connection', (socket) => {
    socket.on('requestTimes', (request) => { 
        calculateArrivalTimes(socket, request);
    });
});

// io.origins(["http://localhost:1337", "ws://localhost:3000", "http://localhost:3000", "ws://::1337", "http://::1337", "*"]);
io.origins([ "http://192.168.86.23:3000", "http://localhost:3000",  "http://192.168.86.23:1337", "http://localhost:1337"]);

io.listen(PORT);
console.log('Listening on port ' + PORT + '...')
  
