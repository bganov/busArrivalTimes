import React from 'react';
import { useState } from 'react'
import logo from './logo.svg';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Button, Paper, TextField, useEventCallback } from '@material-ui/core';
import openSocket from 'socket.io-client';
import { spacing } from '@material-ui/system';

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
     
    },
    '& > *': {
      margin: theme.spacing(1),
    }, 
  },
  ButtonElement: {
    '& > *': {
      margin:  theme.spacing(0),
     
    },
  Paper: {
    '& > *': {
      margin:  theme.spacing(1),
    },
  } 
}
}));

function App() {

  const classes = useStyles();
  const [busStop, setBusStop] = useState(0);
  const [busTimes, setBusTimes] = useState('Enter bus stop to get arrival times...');
  const socket = openSocket('http://localhost:1337');

  const log = (data) => { console.log(data) };
  
  socket.on('message', (data) => { 
    log(data); 
  });
  
  socket.on('updatedArrivalTimes', (data) => { 
    var formatted = `Random UUID: ${data.uuid}\nBusStop: ${busStop}`
    setBusTimes(formatted);
  });

  const requestStopTimes = () => {
    socket.emit('click', busStop) 
  }
  
  const handleChange = (evt) => {
    evt.preventDefault();
    setBusStop(Number.parseInt(evt.target.value));
  }

  const selectAll = (evt) => {
    evt.preventDefault();
    evt.target.select();
  }

  return (
    <div className={classes.root}>
      <Box component="div" m={2}>
          <Box mx="auto" bgcolor="background.paper" p={0} component="div" m={1}>Bus Arrival Times for:</Box>
          <Box mx="auto" bgcolor="background.paper" p={1} component="div" m={1} >
              <TextField
                id="bus-times" 
                label="Bus Stop Number" 
                variant="outlined" 
                defaultValue="" 
                size="small" 
                onChange={handleChange } 
                onClick={selectAll} 
              />
              <Button className={classes.ButtonElement}
                variant="contained" 
                color="primary"
                onClick={() => requestStopTimes()}>Submit
              </Button>
          </Box>
          <Box width={1/2}>
            <Paper  elevation={3} width={'auto'}>
              <span>{busTimes}</span>
            </Paper>
          </Box>
      </Box>
    </div>
  );
}


export default App;
