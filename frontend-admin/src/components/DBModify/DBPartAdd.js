import DBPartModify from './DBPartModify'

class DBPartAdd extends DBPartModify { 

  async doExecute(e) {
    e.preventDefault();
    await this.execute('/api/products/add', 'added');
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