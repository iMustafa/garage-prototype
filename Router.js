import React from 'react';
import { Scene, Router } from 'react-native-router-flux'
import Login from './screens/AuthScreen'
import Map from './screens/MapScreen'

const RouterComponent = () => {
  return (
    <Router>
      <Scene key="root">
        <Scene 
          component={Login}
          key="auth"
          title="Login"
          initial
          hideNavBar={true}
        />
        <Scene 
          component={Map}
          key="map"
          title="Map"
          hideNavBar={true}
        />
      </Scene>
    </Router>
  )
}
export default RouterComponent