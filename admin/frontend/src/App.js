import React from 'react';
import {observer} from 'mobx-react';
import UserStore from './store/UserStore';
import LoginForm from './components/LoginForm';
import AlertPopup from './components/AlertPopup';
import Loading from './components/Loading'
import './App.css';

import 'bootstrap/dist/css/bootstrap.min.css'
import StockTable from './components/DBTables/StockTable';
import MyLogsTable from './components/DBTables/MyLogsTable'

import Header from './components/Header'
import Account from './components/Account'
import AdminPanel from './components/AdminPanel/AdminPanel'

import {BrowserRouter, Switch, Route} from 'react-router-dom'

import {Container} from 'react-bootstrap'
import Dashboard from './components/Dashboard'
import Cashier from './components/Cashier'

const utils = require('./Utils');

class App extends React.Component{

  constructor(props) {
    super(props);

    this.state = {
      connectionError: {
        message: null,
        variant: null,
      }
    };
  }

  async componentDidMount() {
    fetch('/isLoggedIn', {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    .then(utils.handleFetchError)
    .then(res => res.json())
    .then((result) => {
      if (result && result.success) {
        UserStore.loading = false;
        UserStore.isLoggedIn = true;
        UserStore.username = result.username;
        UserStore.privileges = result.privileges;
      } else {
        UserStore.loading = false;
        UserStore.isLoggedIn = false;
        UserStore.username = '';
        UserStore.privileges = 0;
      }
    })
    .catch((err) => {

      console.log(`Error trying to fetch '/isLoggedIn': '${err}'`)

      UserStore.loading = false;
      UserStore.isLoggedIn = false;
      UserStore.username = '';
      UserStore.privileges = 0;

      this.setState({
        connectionError: {
          message: `Error checking login status: ${err}`, 
          variant: 'danger'
        }
      })
    })
  }

  async doLogout() {
    fetch('/logout', {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    .then(utils.handleFetchError)
    .then(res => res.json())
    .then((result) => {
      if (result && result.success) {
        UserStore.isLoggedIn = false;
        UserStore.username = '';
        UserStore.privileges = 0;
      }
    })
    .catch((err) => {
      console.log(`Error trying to fetch '/logout': '${err}'`)
      this.setState({
        connectionError: {
          message: `Error trying to logout: ${err}`, 
          variant: 'danger'
        }
      })
    })
  }

  render() {
    const {connectionError} = this.state;

    if (UserStore.loading) {
      return (
        <div className="App">
          <Loading message="Loading ..."/>
        </div>
      )
    }

    if (!UserStore.isLoggedIn) {
      return (
        <div className="app">
          <Container>
            <AlertPopup error={connectionError} />

            <div className="center-screen">
              <LoginForm />
            </div>
          </Container>
        </div>
      )
    }

    return (
      <div className="App">
        <BrowserRouter>
          <Header
            onLogout={() => this.doLogout()}
          />

          <Switch>

            <Route exact path="/">
              <p>Page not constructed yet</p>
            </Route>

            <Route path="/dashboard">
              <Dashboard />
            </Route>

            <Route path="/cashier">
              <Cashier />
            </Route>

            <Route path="/cashier-history">
              <p>Page not constructed yet</p>
            </Route>

            <Route path="/manage-stock">
              <Container>
                <StockTable enableDelete columnsIgnore={[]/*["id"]*/} columnNames={["Id", "Name", "Quantity", "Price"]}/>
              </Container>
            </Route>

            <Route path="/mylogs">
              <Container>
                <MyLogsTable columnsIgnore={["id", "user_id"]}  columnNames={["Username", "Action", "Product-Id", "Product-Name", "Product-Quantity", "Product-Price", "Date"]}/>
              </Container>
            </Route>

            <Route path="/account">
              <Account />
            </Route>
            
            <Route path="/admin-panel">
              <AdminPanel />
            </Route>

          </Switch>

        </BrowserRouter>
      </div>
    )
  }
}

export default observer(App);
