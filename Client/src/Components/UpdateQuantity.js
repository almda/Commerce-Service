import React from "react";
import Connection from "../API/Connection";
import {Form, FormControl} from "react-bootstrap";


class UpdateQuantity extends React.Component{
    constructor(props) {
        super(props);

        this.state = {
            quantity: ''
        }

        this.handleQuantityChange = this.handleQuantityChange.bind(this);
        this.handleQuantityUpdate = this.handleQuantityUpdate.bind(this);
        this.handleResponse = this.handleResponse.bind(this);
    }

    handleQuantityChange(event){
        this.setState({quantity: event.target.value});
    }

    handleResponse(result){
        if(!result.isFailure){
            alert("quantity updated successfully");
            this.props.handler();
        }
        else{
            alert(result.errMsg);
        }
        this.setState({quantity: ''})
    }

    handleQuantityUpdate(){
        Connection.sendUpdateProductQuantity(this.props.storeID, this.props.productID, this.state.quantity).then(this.handleResponse, Connection.handleReject);
    }

    render() {
        return (
            <div id="update_quantity_block">
                <Form>
                    <FormControl style={{width: '80%'}} type="text" name="quantity" placeholder="New quantity" value={this.state.quantity}
                              onChange={this.handleQuantityChange}/>
                </Form>
                <button onClick={this.handleQuantityUpdate}>Update quantity</button>
            </div>
        );
    }
}

export default UpdateQuantity;