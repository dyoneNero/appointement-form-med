import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import {CssBaseline} from "@mui/material";
import {configure, spy} from "mobx";
import appState from './store/AppState';


//!!update
const btnAppointmentFirst = document.querySelectorAll(".appointment-first-btn")
btnAppointmentFirst.forEach(btn => {
    btn.addEventListener('click', function(){
        if (btn.getAttribute('uid')) {
            const buttonUid = String(btn.getAttribute("uid"))
            appState.isActivePopupUid = buttonUid
        }
        else {
            appState.isActivePopupUid = "null"
        }
    })
})

const btnAppointmentSecond = document.querySelectorAll(".appointment-second-btn")
btnAppointmentSecond.forEach(btn => {
    btn.addEventListener('click', function(){
        if (btn.getAttribute('uid')) {
            const buttonUid = String(btn.getAttribute("uid"))
            appState.isActivePopupUid = buttonUid
        }
        else {
            appState.isActivePopupUid = "null"
        }
    })
})

const btnAppointmentThird = document.querySelectorAll(".appointment-third-btn")
btnAppointmentThird.forEach(btn => {
    btn.addEventListener('click', function(){
        if (btn.getAttribute('uid')) {
            const buttonUid = String(btn.getAttribute("uid"))
            appState.isActivePopupUid = buttonUid
        }
        else {
            appState.isActivePopupUid = "null"
        }
    })
})


configure({
    reactionScheduler: (f) => {
        setTimeout(f)
    }
})

if (process.env.NODE_ENV !== 'production'){
    spy((event) => {
        event.type === "action" ? console.log(event) : void(0)
    })
}


ReactDOM.render(
  <React.StrictMode>
      <CssBaseline />
      <App />
  </React.StrictMode>,
  document.getElementById('appointment-widget-root')
);
