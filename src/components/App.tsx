import React from 'react';
import AppointmentForm from "./AppointmentForm/AppointmentForm";
import {observer} from "mobx-react-lite";
import './App.css';

const App = () => {
    return (
          <>
              <AppointmentForm/>
          </>
    );
}

export default observer(App);