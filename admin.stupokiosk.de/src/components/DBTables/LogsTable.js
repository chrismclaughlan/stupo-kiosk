import React from 'react';
import DBTable from './DBTable'
const utils = require('../../Utils');

const API = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_API_URL : '';

const API_LOGS_REMOVE   = API + '/logs/remove';
const API_QUERY_ALL     = API + '/logs';
const QUERY_STRING      = 'username=';
const QUERY_SIMILAR     = 'similar=';

class LogsTable extends DBTable{

  search() {
    super.searchAPI(this.state.search, this.state.searchSimilar, API_QUERY_ALL, QUERY_STRING, QUERY_SIMILAR);
  }

  searchLast() {
    const searchString = (this.state.searchLast.string !== undefined) ? this.state.searchLast.string : '';
    this.searchAPI(searchString, this.state.searchLast.similar, API_QUERY_ALL, QUERY_STRING, QUERY_SIMILAR);
  }

  async callRemove() {
    const data = {
      logs: [
        {id: this.state.nameToDelete, },
      ]
    };
    super.callRemove(API_LOGS_REMOVE, data);
  }

  callRemove() {
    return;
  }

  renderHelpText() {
    return (
      <ul>
        {this.renderHelpTextSearch()}

        <br></br>

        <li>part_quantity: Quantity of parts removed</li>
        <li>part_bookcase: Bookcase changed to <i>some value</i></li>
        <li>part_shelf: Shelf changed to <i>some value</i></li>
      </ul>
    )
  }

  render() {    
    return (
      <div className="LogsTable">
        {this.renderSearchBar("Search Usernames")}
        {this.renderTable()}
      </div>
    );
  }
}

export default LogsTable;