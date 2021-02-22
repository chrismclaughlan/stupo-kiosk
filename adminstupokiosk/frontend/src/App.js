import { useState } from "react";
import { BrowserRouter, Route, Switch, Link } from "react-router-dom";

import Categories from "./Categories/Categories";
import Products from "./Products/Products";
import Users from "./Users/Users";

const App = () => {
  return (
    <BrowserRouter>
      <header>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
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
        <Route exact path="/categories">
          <Categories />
        </Route>
        <Route exact path="/products">
          <Products />
        </Route>
        <Route exact path="/users">
          <Users />
        </Route>
      </Switch>
    </BrowserRouter>
  );
};

export default App;
