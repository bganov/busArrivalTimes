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

  const REQUEST_INTERVAL = 1000 * 60; //can be exported to an ENV VAR
  const classes = useStyles();
  const [ busStop, setBusStop ] = useState();
  const [ busTimes, setBusTimes ] = useState('');
  const [ stopOne, setStopOne ] = useState('')
  const [ stopTwo, setStopTwo ] = useState('')
  const [ intervalId, setIntervalId ] = useState();
  const socket = openSocket('ws://localhost:1337');
  
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

    cancelRequest(); // Clear an existing/running interval
    // Initial times request...
    socket.emit('requestTimes', {busStops: [1, 2, Number.parseInt(busStop)], requestedTimestamp: new Date()}) 
    
    // Schedule minutely request and save it's Id
    let id =  setInterval((data) => {
      socket.emit('requestTimes', {busStops: data, requestedTimestamp: new Date()}) 
    }, REQUEST_INTERVAL, [1, 2, Number.parseInt(busStop)])
    setIntervalId(id);
  }

  const cancelRequest = () => {
    // Cancel currently running request/interval and remove the prior arrival times 
    if(intervalId){
        clearInterval(intervalId);
        setIntervalId(undefined);
      }
      // Clear the hooks' data
      setBusTimes('')
      setStopOne('')
      setStopTwo('')
  }
  
  const handleChange = (evt) =>  {
    evt.preventDefault();
    var value = Number.parseInt(evt.target.value)
    if(!isNaN(value) && value >= 3 && value <=10) {
        setBusStop(evt.target.value);
    } else {
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
