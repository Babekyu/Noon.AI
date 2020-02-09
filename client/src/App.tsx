import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';

import SearchScreen from './components/search-screen/search-screen';
import SymbolScreen from './components/details-screen/details-screen';
import messaging from './helpers/messaging';

import './App.css';

const App = () => {
  const [connected, setConnected] = useState(false);
  const handleConnection = () => {
    async function doAsync() {
      const res = await messaging.connectWithPromise();
      console.log(res);
      setConnected(true);
      messaging.subscribe('sendSentiment');
    }
    if (!connected) {
      doAsync();
    }
  };

  handleConnection();
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route exact path="/">
            <SearchScreen />
          </Route>
          <Route path="/symbol/:symbol">
            <SymbolScreen />
          </Route>
        </Switch>
      </Router>
    </div>
  );
};

export default App;
