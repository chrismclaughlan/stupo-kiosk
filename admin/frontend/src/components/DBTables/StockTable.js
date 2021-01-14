import React from 'react';
import DBTable from './DBTable'
import DBPartUpdate from '../DBModify/DBPartUpdate';
const utils = require('../../Utils');

const API_QUERY_PRODUCTS = '/products';
const QUERY_STRING = 'id=';
const QUERY_SIMILAR = 'similar=';

class StockTable extends DBTable{

  search() {
    super.searchAPI(this.state.search, this.state.searchSimilar, API_QUERY_PRODUCTS, QUERY_STRING, QUERY_SIMILAR);
  }

  searchLast() {
    const searchString = (this.state.searchLast.string !== undefined) ? this.state.searchLast.string : '';
    this.searchAPI(searchString, this.state.searchLast.similar, API_QUERY_PRODUCTS, QUERY_STRING, QUERY_SIMILAR);
  }

  async callRemove() {
    const data = {
      products: [
        {id: this.state.nameToDelete, },
      ]
    };
    super.callRemove(`${API_QUERY_PRODUCTS}/remove`, data);
  }

  renderEdit() {
    let column = this.state.editColumn
    let row = this.state.editRow

    if (!row || !column) {
      return null
    }

    return (
      <div>
        <DBPartUpdate 
          editColumn={column}
          partId={row.id}
          partName={row.name} 
          partQuantity={row.quantity}
          partPrice={row.price}
          onSuccess={() => this.onUpdateSuccess()}
          onFailure={() => this.onUpdateFailure()}
        />
      </div>
    )
  }

  renderHelpText() {
    return (
      <ul>
        {this.renderHelpTextSearch()}

        <br></br>

        Update:
        <li>quantity: Enter quantity to remove from database</li>
        <li>bookcase: Enter new bookcase</li>
        <li>shelf: Enter new shelf</li>

        <br></br>

        Table:
        <li>Delete: Clicking delete will remove this part from the database entirely</li>
        <li>quantity: Quantity of parts removed</li>
        <li>bookcase: Current bookcase where part is located</li>
        <li>shelf: Current shelf where part is located</li>
      </ul>
    )
  }

  render() {    
    return (
      <div ref={this.state.insideRef} className="StockTable">
        {this.renderSearchBar('Search Product ID\'s')}
        {this.renderEdit()}
        {this.renderTable()}
      </div>
    );
  }
}

export default StockTable;