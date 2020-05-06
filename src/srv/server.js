const io = require('socket.io')()
const uuid =  require('uuid')

const PORT = 1337
const log = (data) => {console.log(data)}



io.on('connection', (socket) => {
    
    socket.on('message', (data) =>  { log(data) })
    
    socket.on('disconnect', (data) => { log(data) })
  
    socket.on('click', (data) => { 
        log(data);  
        var message = {
            uuid:  uuid.v4(),
            busStop: data
        }


        socket.emit('updatedArrivalTimes',  message); 
    });
});
  
  
  
io.listen(PORT);
console.log('Listening on port ' + PORT + '...')
  