import DBUserModify from './DBUserModify'

const API_QUERY_USERS = '/users';

class DBUserUpdate extends DBUserModify { 

  doExecute(e) {
    e.preventDefault()

    this.execute(`${API_QUERY_USERS}/update`, 'updated')
  }

  componentDidMount() {
    super.componentDidMount();
  }

  componentDidUpdate(prevProps, prevState) {
    const {username } = this.props

    if (prevProps.username === username) {
        return;
    }

    this.setState({
      username,
      password: '',
    })
  }

  render() {
    const properties = {
      username: {
        disable: true, placeholder: 'Username'
      },
      password: {
        disable: false, placeholder: 'New Password'
      },
      privileges: {
        disable: false, placeholder: 'Privileges'
      },
    }
    return super.render('Update User', properties);
  }
}

export default DBUserUpdate;