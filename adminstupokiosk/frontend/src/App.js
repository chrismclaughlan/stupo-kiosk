import { useState } from "react";
import { BrowserRouter, Route, Switch, Link } from "react-router-dom";

import Categories from "./Categories/Categories";
import Products from "./Products/Products";
import Users from "./Users/Users";
import Login from "./Login";

const App = () => {
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const onLogout = () => {
    console.log("logging out...");
  };

  return (
    <BrowserRouter>
      <header>
        {error && (
          <div className="Error">
            {JSON.stringify(error)} <button onClick={() => setError(null)}>Clear</button>
          </div>
        )}
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          {isLoggedIn ? (
            <li>
              <button onClick={() => onLogout()}>Logout</button>
            </li>
          ) : (
            <li>
              <Link to="/login">Login</Link>
            </li>
          )}
        </ul>
      </header>

      <Switch>
        <Route exact path="/">
          <ul>
            <li>
              <Link to="/categories">Categories</Link>
            </li>
            <li>
              <Link to="/products">Products</Link>
            </li>
            <li>
              <Link to="/users">Users</Link>
            </li>
          </ul>
        </Route>
        <Route path="/login">
          <Login setError={setError} />
        </Route>
        <Route path="/categories">
          <Categories setError={setError} />
        </Route>
        <Route path="/products">
          <Products setError={setError} />
        </Route>
        <Route path="/users">
          <Users setError={setError} />
        </Route>
      </Switch>
    </BrowserRouter>
  );
};

export default App;
