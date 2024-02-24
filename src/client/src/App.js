import React from 'react';
import { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import { 
  Box, 
  Button, 
  TextField, 
  ButtonGroup
} from '@material-ui/core';

//import openSocket from 'socket.io-client';
import { io } from "socket.io-client";


// For single host origin use 'localhost'
// Make sure that is mapped inside your hostnames
//var HOST  = 'localhost'

// For WS host other than local host use appropriate value 
// update according the WS server IP and update the Server origins if needed
var HOST = '192.168.86.29'

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
  const [ busStop, setBusStop ] = useState('')
  const [ busTimes, setBusTimes ] = useState(String)
  const [ stopOne, setStopOne ] = useState(String)
  const [ stopTwo, setStopTwo ] = useState(String)
  const [ intervalId, setIntervalId ] = useState(-1)

  const socket = io('http://' + HOST + ':1337/');

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

    cancelRequest(false); // Clear an existing/running interval
    var data = [1,2]; // Default stops always requested
    
    var requested = Number.parseInt(busStop);
    if( !isNaN(requested) && requested < 11 && requested >= 3) {
        setBusStop(requested);
        data.push(requested);
    } else {
      setBusStop('');
    }
    // Initial times request...
    socket.emit('requestTimes', {busStops: data, requestedTimestamp: new Date()})  

    // Schedule request per REQUEST_INTERVAL and save it's Id
    setIntervalId(setInterval((data) => {
      var dateTime = new Date();
      dateTime.setTime(Date.now())
      socket.emit('requestTimes', {busStops: data, requestedTimestamp: dateTime})
    }, REQUEST_INTERVAL, data) || -1);
     
    document.getElementById('stopNumber').dispatchEvent(new Event("onClick"))
  }

  const cancelRequest = (clearInputField) => {
    // Cancel currently running request/interval and remove the prior arrival times 
    if(intervalId){
        clearInterval(intervalId);
        setIntervalId('');
        setBusStop(''); 
        // Clear the hooks' data
        setBusTimes('')
        setStopOne('')
        setStopTwo('')
        
    }
    if(clearInputField){
      setBusStop('');
    }
  }
  
  const handleChange = (evt) =>  {
    evt.preventDefault();
    setBusStop(evt.target.value);
  }

  const handleEnterKey = (evt) => {
    if(evt.key === 'Enter'){
      requestStopTimes(false)
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
                  value={busStop}
                  onClick={ (evt) => selectAll(evt) }
                  onKeyPress={ (evt) => handleEnterKey(evt) }
                  onChange={ (evt) => handleChange(evt) }
                />
              <br/><br/>
              <ButtonGroup  width={1/6}  padding={100}>
               <Button className={classes.ButtonElement}
                name="submit"
                variant="contained" 
                color="primary"
                size="small" 
                onClick={() => requestStopTimes(false)}>Get Arrival Times
              </Button>
              <Button className={classes.ButtonElement}
                name="cancel"
                variant="contained" 
                color="primary"
                size="small" 
                onClick={() => cancelRequest(true)}>Cancel
              </Button>
              </ButtonGroup>
          </Box>
          <Box width={1/4}>  
             <pre>As of {new Date(Date.now()).toLocaleString()}</pre>
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
