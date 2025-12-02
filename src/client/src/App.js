import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { 
  Box, 
  Button, 
  TextField, 
  ButtonGroup
} from '@material-ui/core';
import openSocket from 'socket.io-client';

const REQUEST_INTERVAL = 1000 * 10; // can be exported to an ENV VAR or configuration
const BACKEND_HOST_SOCKET = "localhost:3131";// can be exported to an ENV VAR or configuration
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
  },
  TextField: {
    '& > *': {
      margin:  theme.spacing(1),
    },
    width: 'calc(20% - 50px)',
  },
}));

// Consider passing the URL/hostname/IP of server via env var or settings...
const socket = openSocket.connect(BACKEND_HOST_SOCKET, {
      extraHeaders: ["Access-Control-Allow-Origin: 'localhost:3000'"],
      });

function App() {

  const classes = useStyles();
  var [ busStop, setBusStop ] = useState();
  const [ busTimes, setBusTimes ] = useState();
  const [ stopOne, setStopOne ] = useState();
  const [ stopTwo, setStopTwo ] = useState();
  const [ intervalId, setIntervalId ] = useState();
  const [ currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [ lastUpdated, setLastUpdated] = useState();

  setInterval(() => {
    setCurrentTime(new Date().toLocaleTimeString());
  }, 1000);

  useEffect(() => {
    setBusStop(busStop);
    setCurrentTime(new Date().toLocaleTimeString());

    socket.on('updatedArrivalTimes', (response) => { 
    
    if(Array.isArray(response)){
        response.forEach(  (val, idx, arry) => {
       
          if(idx < 2){
            if(Array.isArray(val)){
              var times = `Stop ${idx+1}:` 
              times += '\n' 
              times += `Route 1 in under ${val[0].incoming} mins and under ${val[0].following} mins`
              times += '\n'
              times += `Route 2 in under ${val[1].incoming} mins and under ${val[1].following} mins`
              times += '\n'
              times += `Route 3 in under ${val[2].incoming} mins and under ${val[2].following} mins`
            }
            if(idx === 0) 
              setStopOne(times)
            else
              setStopTwo(times)
          } 

          if(idx === 2){
            times = `Stop ${busStop ? busStop : 3}:` 
            times += '\n' 
            times += `Route 1 in under ${val[0].incoming} mins and under ${val[0].following} mins`
            times += '\n'
            times += `Route 2 in under ${val[1].incoming} mins and under ${val[1].following} mins`
            times += '\n'
            times += `Route 3 in under ${val[2].incoming} mins and under ${val[2].following} mins`

           setBusTimes(times);
          }
        })
        setLastUpdated(new Date().toLocaleTimeString());
      }
      else{
        setBusTimes();
      }
    });
  }, [busStop]);

  
  const requestStopTimes = () => {

    cancelRequest(); // Clear an existing/running interval 
    
    var userChoice = Number.parseInt(busStop);
    if (Number.isNaN(userChoice)) {
      // Initial times request...
      socket.emit('requestTimes', {busStops: [1, 2], requestedTimestamp: new Date()})
      setIntervalId(
        setInterval((data) => {
        socket.emit('requestTimes', {busStops: data, requestedTimestamp: new Date()}) 
      }, REQUEST_INTERVAL, [1, 2])
      );

      return;
    }

    if (!Number.isNaN(userChoice)) {  
      setBusStop(userChoice);
      socket.emit('requestTimes', {busStops: [1, 2, busStop], requestedTimestamp: new Date()}) 
      // Schedule minutely request and save it's Id
      setIntervalId(
        setInterval((data) => {
          socket.emit('requestTimes', {busStops: data, requestedTimestamp: new Date()}) 
        }, REQUEST_INTERVAL, [1, 2, Number.parseInt(busStop)])
      );
    }    
  }

  const cancelRequest = () => {
    // Cancel currently running request/interval and remove the prior arrival times 
    if(intervalId){
      clearInterval(intervalId);
      setIntervalId(undefined);  
    }
    // Clear the hooks' data 
    setBusTimes()
    setStopOne()
    setStopTwo()
  }
  
  const handleChange = (evt) =>  {
    //evt.preventDefault();
    let value = Number.parseInt(evt.target.value)
    if(!isNaN(value)) {
      if(value >= 3 && value <= 10){
        setBusStop(value);
      }
      else{
        setBusStop();
      }
    }
  }
 
  const selectAll = (evt) => {
    //evt.preventDefault();
    evt.target.select();
  }

  const printLastUpdated = () => {
    if(intervalId){
      var suffix = lastUpdated || "No data requested yet";
      return "Last updated at: " + suffix;
    }
    return '';
  }

  return (
    <div className={classes.root}>
      <Box component="div" m={2}>
          <Box mx="auto" bgcolor="background.paper" p={0} component="div" m={1}>Bus Arrival Times for:</Box>
          <Box mx="auto" bgcolor="background.paper" p={1} component="div" m={1} width={1}>
                <TextField className={classes.TextField}
                  id='userInput'
                  autoFocus={true}
                  color={'primary'}
                  required={true}
                  label="Bus Stop Number [3-10]" 
                  variant="outlined" 
                  size="small"
                  onChange = { (evt) => handleChange(evt)}
                  onBlur = { (evt) => handleChange(evt)}
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
               Current local time: {currentTime}<br/><br/>
               {stopOne}<br/><br/>
               {stopTwo}<br/><br/>
               {busTimes}<br/><br/>
               {printLastUpdated()}
             </pre>
          </Box>
      </Box>
    </div>
  );
}


export default App;
