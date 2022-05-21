import { createServer } from "http";
import { Server } from "socket.io";

const PORT = 1337;
const HOST = 'localhost';
const DISTANCE_BETWEEN_STOPS = 2
const BUS_LINE_NEXT_CAR = 15;
const log = (data) => {console.log(data)}

const http_options = {
        cors: {
          origin: true
        }
}
var server = createServer(http_options);
const io = new Server(server, http_options);

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
    socket.on('disconnect', (data) => { 
        /* NOOP */
    })
    socket.on('requestTimes', (request) => { 
        calculateArrivalTimes(socket, request);
    });
});

server.listen(PORT, HOST, () => {
    console.log('Listening on  ' + HOST+':'+ PORT + '...')
})

  


