import React from 'react';
import DBTable from './DBTable'
const utils = require('../../Utils');

const API = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_API_URL : '';

const API_QUERY_ALL = API + '/mylogs';

class MyLogsTable extends DBTable{

  search() {
    this.query(API_QUERY_ALL);
  }

  searchLast() {
    this.query(API_QUERY_ALL);
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
      <div className="MyLogsTable">
        <h1 className="display-4">Logs</h1>
        {this.renderTable()}
      </div>
    );
  }
}

export default MyLogsTable;