import React from 'react';
import LogsTable from '../DBTables/LogsTable'

class AdminPanelLogs extends React.Component{

  render() {
      return (
          <div className="AdminPanelLogs">
            <div className="container">
              <LogsTable columnsIgnore={["id", "user_id"]} columnNames={["Username", "Action", "Product ID", "Product-Name", "Product-Quantity", "Product-Price", "Date"]}/>
            </div>
          </div>
      )
  }
}

export default AdminPanelLogs;