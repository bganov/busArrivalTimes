import { createServer } from "http";
import { Server } from "socket.io";

const PORT = 1337
const DISTANCE_BETWEEN_STOPS = 2
const BUS_LINE_NEXT_CAR = 15;
const httpServer = createServer();
const io = new Server(httpServer, {
    headers: {
        "Access-Control-Allow-Origin":"*"
    },
    cors: {
        origin: ["http://localhost:3000", "http://192.168.86.29:3000"]
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
    socket.on("disconnect", (reason) => {
        console.log('Connection Disconnected with ' + socket.client.id + " Reason: "+ reason.toString());
      });
});

httpServer.listen(PORT);
console.log('Listening on port ' + PORT + '...')
  
