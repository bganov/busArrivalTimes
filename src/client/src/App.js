import React from 'react';
import { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import { 
  Box, 
  Button, 
  TextField, 
  ButtonGroup
} from '@material-ui/core';
import openSocket from 'socket.io-client';

// For single host origin use 'localhost'
// Make sure that is mapped inside your hostnames
var HOST  = 'localhost'

// For WS host other than locallhost use appropriate value
//var HOST = '192.168.86.29'

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    }
  },
  ButtonElement: {
    '& > *': {
      margin:  theme.spacing(1),
    },
}
}));

function App() {

  const REQUEST_INTERVAL = 1000 * 12; //can be exported to an ENV VAR (in milliseconds)
  const classes = useStyles();
  const [ busStop, setBusStop ] = useState(Number)
  const [ busTimes, setBusTimes ] = useState(String)
  const [ stopOne, setStopOne ] = useState(String)
  const [ stopTwo, setStopTwo ] = useState(String)
  const [ intervalId, setIntervalId ] = useState(Number);
  let socket = openSocket.connect('ws://' + HOST + ':1337/');
  
  socket.on('updatedArrivalTimes', (response) => { 
    
    if(Array.isArray(response)){
        response.forEach(  (val, idx, arry) => {
          if(idx < 2){
            if(Array.isArray(val)){
              var times = `Stop ${idx+1}:` 
              times += '\n' 
              times += `Route 1 in ${val[0].incoming} mins and ${val[0].following} mins`
              times += '\n'
              times += `Route 2 in ${val[1].incoming} mins and ${val[1].following} mins`
              times += '\n'
              times += `Route 3 in ${val[2].incoming} mins and ${val[2].following} mins`
            }
            if(idx === 0) 
              setStopOne(times)
            else
              setStopTwo(times)
          } 

          if(idx === 2){
            times = `Stop ${busStop}:` 
            times += '\n' 
            times += `Route 1 in ${val[0].incoming} mins and ${val[0].following} mins`
            times += '\n'
            times += `Route 2 in ${val[1].incoming} mins and ${val[1].following} mins`
            times += '\n'
            times += `Route 3 in ${val[2].incoming} mins and ${val[2].following} mins`

            setBusTimes(times);
          }
        })
    }
  });
  
  const requestStopTimes = () => {

    if(socket && socket.disconnected){
      socket = openSocket.connect('ws://' + HOST + ':1337/')
    }

    cancelRequest(); // Clear an existing/running interval
    var data = [1,2];
    var requested = Number.parseInt(busStop);
    
    if(!isNaN(requested) && requested > 0)
     data.push(requested);
    
    // Initial times request...
    socket.emit('requestTimes', {busStops: data, requestedTimestamp: new Date()})  
    console.log('Interval callback executing...'+ new Date(Date.now()).toLocaleString())

    // Schedule minutely request and save it's Id
    let id =  setInterval((data) => {
      socket.emit('requestTimes', {busStops: data, requestedTimestamp: new Date()})
      var dateTime = new Date();
      dateTime.setTime(Date.now())
      console.log('Interval callback executing...'+ new Date(Date.now()).toLocaleString())
    }, REQUEST_INTERVAL, data)
     
    setIntervalId(id || -1);

  }

  const cancelRequest = () => {
    // Cancel currently running request/interval and remove the prior arrival times 
    if(intervalId){
        clearInterval(intervalId);
        document.getElementById('stopNumber').value = '';
        setBusStop(''); 
        // Clear the hooks' data
        setBusTimes('')
        setStopOne('')
        setStopTwo('')
        setIntervalId(-1)
      
    }
     
  }
  
  const handleChange = (evt) =>  {
    evt.preventDefault();
    var value = Number.parseInt(evt.target.value)
    if( !isNaN(value) && value < 11 ) {
      if( value >= 3)
        setBusStop(evt.target.value);
    } else {
      setBusStop(NaN);
      return evt.target.value = '';
    }
  }
 
  const selectAll = (evt) => {
    evt.preventDefault();
    evt.target.select();
  }

  return (
    <div className={classes.root}>
      <Box component="div" m={2}>
          <Box mx="auto" bgcolor="background.paper" p={0} component="div" m={1}>Bus Arrival Times for:</Box>
          <Box mx="auto" bgcolor="background.paper" p={1} component="div" m={1} width={1}>
                <TextField
                  id='stopNumber'
                  autoFocus={true}
                  color={'primary'}
                  required={true}
                  label="Bus Stop Number [3-10]" 
                  variant="outlined" 
                  size="small"
                  onChange={ (evt) => handleChange(evt)} 
                  onClick={  (evt) => selectAll(evt) }
                />
              <br/><br/>
              <ButtonGroup  width={1/6}  padding={100}>
               <Button className={classes.ButtonElement}
                name="submit"
                variant="contained" 
                color="primary"
                size="small" 
                onClick={() => requestStopTimes()}>Get Arrival Times
              </Button>
              <Button className={classes.ButtonElement}
                name="cancel"
                variant="contained" 
                color="primary"
                size="small" 
                onClick={() => cancelRequest()}>Cancel
              </Button>
              </ButtonGroup>
          </Box>
          <Box width={1/4}>  
             <pre>
               {stopOne}<br/><br/>
               {stopTwo}<br/><br/>
               {busTimes}
             </pre>
          </Box>
      </Box>
    </div>
  );
}


export default App;
