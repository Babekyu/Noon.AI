import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
} from 'react-router-dom';

import SearchScreen from './components/search-screen/search-screen';
import SymbolScreen from './components/details-screen/details-screen';
import './App.css';

const App = () => (
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

export default App;
