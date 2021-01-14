import DBPartModify from './DBPartModify'

const API_QUERY_PRODUCTS = '/products';

class DBPartAdd extends DBPartModify { 

  async doExecute(e) {
    e.preventDefault();
    await this.execute(`${API_QUERY_PRODUCTS}/add`, 'added');
    this.setState({
      partId: '', partName: '', partQuantityAdd: '', partQuantitySubtract: '', partPrice: '',
    })
  }

  render() {
    const properties = {
      id: {
        disable: false, placeholder: 'Id'
      },
      name: {
        disable: false, placeholder: 'Name'
      },
      quantityAdd: {
        disable: false, placeholder: 'Quantity'
      },
      quantitySubtract: {
        disable: true, placeholder: 'Subtract'
      },
      price: {
        disable: false, placeholder: 'Price'
      },
    }
    return super.render('Add Product', properties);
  }
}

export default DBPartAdd;