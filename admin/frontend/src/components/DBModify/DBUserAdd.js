import DBUserModify from './DBUserModify'

const API_QUERY_USERS = '/api/users';

class DBUserAdd extends DBUserModify { 

  async doExecute(e) {
    e.preventDefault()
    await this.execute(`${API_QUERY_USERS}/add`, 'added')
    this.setState({
      username: '', password: '', privileges: '',
    })
  }

  componentDidMount() {
    super.componentDidMount();
  }

  render() {
    const properties = {
      username: {
        disable: false, placeholder: 'Username'
      },
      password: {
        disable: false, placeholder: 'Password'
      },
      privileges: {
        disable: false, placeholder: 'Privileges'
      },
    }
    return super.render('Add User', properties);
  }
}

export default DBUserAdd;