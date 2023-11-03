import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import {CssBaseline} from "@mui/material";
import {configure, spy} from "mobx";
import appState from './store/AppState';
import activeDoctorOpen from './store/activeDoctorOpen';
import activeAppointment from './store/activePopup';


//!!update
const buttonSecond = document.querySelectorAll(".appointment-second-btn")
buttonSecond.forEach(button => {
    button.addEventListener('click', function(){
        const uid = String(button.getAttribute("uid"))
        appState.isDoctorActiveUid = uid
        activeDoctorOpen(uid)
    })
})

const buttonFirst = document.querySelectorAll(".appointment-first-btn")
buttonFirst.forEach(button => {
    button.addEventListener('click', function(){
        activeAppointment()
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
