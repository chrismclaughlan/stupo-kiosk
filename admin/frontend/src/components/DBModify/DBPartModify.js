import React from 'react';
import {Form, Col, Button} from 'react-bootstrap'
import AlertPopup from '../AlertPopup';
import DBModify from './DBModify'
const utils = require('../../Utils');

const MAX_SEARCH_LENGTH = 64;

class DBPartModify extends DBModify{
  constructor(props) {
    super(props);

    this.state = {
      entries: null,
      isLoading: false,
      error: {
        message: '',
        variant: '',
      },
      partId: '',
      partName: '',
      partQuantityAdd: '',
      partQuantitySubtract: '',
      partPrice: '',
      maxSearchLength: MAX_SEARCH_LENGTH,
      textInput: null,

      buttonDisabled: false,
    }
  }

  async execute(url, successMessage) {
    this.setState({buttonDisabled: true});

    let quantity;
    if (! this.state.partQuantityAdd && !this.state.partQuantitySubtract) {
      quantity = undefined;
    } else {
      let qAdd, qSub;

      if (this.state.partQuantityAdd) {
        qAdd = parseInt(this.state.partQuantityAdd, 10);
        if (isNaN(qAdd)) {
          this.setState({error: {message: `Invalid quantity to add`, variant: 'warning'},buttonDisabled: false,})
          return;
        }
      }

      if (this.state.partQuantitySubtract) {
        qSub = parseInt(this.state.partQuantitySubtract, 10);
        if (isNaN(qSub)) {
          this.setState({error: {message: `Invalid quantity to subtract`, variant: 'warning'},buttonDisabled: false,})
          return;
        }
      }

      quantity = (isNaN(qAdd) ? 0 : Math.abs(qAdd)) - (isNaN(qSub) ? 0 : Math.abs(qSub));
    }

    fetch(url, {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        products: [
          {
            id: this.state.partId,
            name: this.state.partName,
            quantity,
            price: this.state.partPrice,
          }
        ]
      }),
    })
    .then(utils.handleFetchError)
    .then(res => res.json())
    .then((result) => {

      if (result && result.success) {
        this.setState({
          error: {
            message: `Successfully ${successMessage} ${this.state.partName}`, 
            variant: 'success'
          },
          buttonDisabled: false,
          
          // Reset quantity when sucessful
          partQuantityAdd: '',
          partQuantitySubtract: '',
        });
        if (this.props.onSuccess) {
          this.props.onSuccess();
        }
      }
      else if (result && result.success === false)
      {
        this.setState({
          error: {
            message: result.msg, 
            variant: 'warning'
          },
          buttonDisabled: false,
        });
        if (this.props.onFailure) {
          this.props.onFailure();
        }
      }
    })
    .catch((err) => {
      console.log(`Error trying to fetch '${url}': '${err}'`)
      if (this.props.onFailure) {
        this.props.onFailure();
      }
      this.setState({
        error: {
          message: `An error occured: ${err}`, 
          variant: 'danger'
        },
        buttonDisabled: false,
      })
    })

    this.textInput.focus();
  }

  componentDidMount() {
    const {partId, partName} = this.props
    
    this.setState({
      partId, partName
    })

    this.textInput.focus();
  }

  // {name: {disable: false, placeholder: 'Name'}, quantity: {disable: true, placeholder: 'Take'}}
  render(title, properties) {
    let isValidated = false

      return (
        <div className="DBModify">
          <AlertPopup error={this.state.error}/>
          <div className="container">
            <Form
              noValidate 
              validated={isValidated} 
              onSubmit={!this.state.buttonDisabled ? (e) => this.doExecute(e) : null}
            >
              <Form.Label className="FormLabel">{title}</Form.Label>
              <Form.Row>

                {
                (properties.id.disable) ? 
                null 
                :
                <Col xs="auto" lg="2">

                    <Form.Control 
                      readOnly={properties.id.disable}
                      placeholder={properties.id.placeholder}
                      value={this.state.partId}
                      onChange={(e) => this.setProperty('partId', e)}
                      ref={elem => (this.textInput = elem)}
                    />
                </Col>
                }

                <Col xs="auto" lg={properties.id.disable ? 5 : 3}>
                  <Form.Control
                    readOnly={properties.name.disable}
                    placeholder={properties.name.placeholder}
                    value={this.state.partName}
                    onChange={(e) => this.setProperty('partName', e)}
                  />
                </Col>
                  {
                    (properties.quantityAdd.disable) ? 
                    null 
                    :
                    <Col xs="auto" lg="2">
                    <Form.Control 
                      readOnly={this.state.partQuantitySubtract !== '' ? true : false}
                      placeholder={properties.quantityAdd.placeholder}
                      value={(this.state.partQuantityAdd)}
                      onChange={(e) => this.setProperty('partQuantityAdd', e)}
                    />
                  </Col>
                  }
                  {
                  (properties.quantitySubtract.disable) ? 
                  null 
                  :
                  <Col xs="auto" lg={2 + (properties.quantityAdd.disable ? 2 : 0) + (properties.price.disable ? 2 : 0)}>
                    <Form.Control 
                      readOnly={this.state.partQuantityAdd !== '' ? true : false}
                      placeholder={properties.quantitySubtract.placeholder}
                      value={(this.state.partQuantitySubtract)}
                      onChange={(e) => this.setProperty('partQuantitySubtract', e)}
                      ref={elem => (this.textInput = elem)}
                    />
                  </Col>
                  }

                  {
                  (properties.price.disable) ? 
                  null 
                  :
                  <Col xs="auto" lg="2">
 
                      <Form.Control 
                        readOnly={properties.price.disable}
                        placeholder={properties.price.placeholder}
                        value={this.state.partPrice}
                        onChange={(e) => this.setProperty('partPrice', e)}
                      />
                  </Col>
                    }

                <Col xs="auto" lg="1">
                  <Button 
                    variant="primary" 
                    type="submit"
                    className="AppButton"
                    onClick={!this.state.buttonDisabled ? (e) => this.doExecute(e) : null}
                  >
                    Confirm
                  </Button>
                </Col>

              </Form.Row>
            </Form>
          </div>
        </div>
      )
  }
}

export default DBPartModify;