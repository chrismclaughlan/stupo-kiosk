import DBPartModify from './DBPartModify'
import UserStore from '../../store/UserStore'

const API_QUERY_PRODUCTS = '/api/products';

class DBPartUpdate extends DBPartModify { 

  async doExecute(e) {
    e.preventDefault()
    await this.execute(`${API_QUERY_PRODUCTS}/update`, 'updated');
  }

  componentDidMount() {
    //super.componentDidMount();

    const {partId, partName, partQuantity, partBookcase, partShelf} = this.props
    this.setState({
      partId,
      partName, 
      //partQuantity, 
      //partBookcase, 
      //partShelf,
    })
  
    this.textInput.focus();
  }

  componentDidUpdate(prevProps, prevState) {
    const {partId, partName} = this.props

    if (prevProps.partName === partName) {
        return;
    }

    this.setState({
        partId,
        partName, 
        partQuantityAdd: '',
        partQuantitySubtract: '',
        partPrice: '', 
    })

    this.textInput.focus();
  }

  render() {
    const isAdmin = (UserStore.privileges > 0);
    const properties = {
      id: {
        disable: true, placeholder: 'Id'
      },
      name: {
        disable: true, placeholder: 'Name'
      },
      quantityAdd: {
        disable: !isAdmin, placeholder: 'Quantity to add'
      },
      quantitySubtract: {
        disable: false, placeholder: 'Quantity to subtract'
      },
      price: {
        disable: !isAdmin, placeholder: 'Change price'
      },
    }
    return super.render('', properties);
  }
}

export default DBPartUpdate;