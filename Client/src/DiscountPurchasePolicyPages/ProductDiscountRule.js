import React from 'react';
import Select from 'react-select';
import StaticUserInfo from "../API/StaticUserInfo";
import Connection from "../API/Connection";


class ProductDiscountRule extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            functionName: 'addDiscountRule',
            username: window.sessionStorage.getItem('username'),
            storeId: window.sessionStorage.getItem('storeID'),
            type: 'ProductDiscountRule',
            productId: '',
            discount: '',
        };
    }


    handleInputChange = (e, name) => {
        this.setState({
            [name]: e.target.value
        })
    }

    handleClick(e) {
        e.preventDefault();
        Connection.sendProductDiscountRule(this.state.functionName, this.state.username, this.state.storeId, this.state.type, this.state.productId, this.state.discount).then(this.handleAddCategoryDiscountResponse, Connection.handleReject)
    }

    handleAddCategoryDiscountResponse(result){
        if(!result.isFailure){
            alert("adding discount success");
        }
        else{
            alert(result.errMsg);
        }
    }

    render() {
        return (
            <form>
                <h1>Add Product Discount Rule Page</h1>
                <div> <label> Username : <input readOnly value = {this.state.username} className = "username" type = "text" onChange = {(e) => this.handleInputChange(e, 'username')}/> </label> </div>
                <div> <label> Store Id : <input readOnly value = {this.state.storeId} className = "storeId" type = "text" onChange = {(e) => this.handleInputChange(e, 'storeId')}/> </label> </div>
                <div> <label> Product Id : <input className = "category" type = "text" onChange = {(e) => this.handleInputChange(e, 'productId')}/> </label> </div>
                <div> <label> Discount : <input className = "discount" type = "text" onChange = {(e) => this.handleInputChange(e, 'discount')}/> </label> </div>
                <button type = "button" onClick = {(e) => this.handleClick(e)}> Add Discount </button>
            </form>
        )
    }
}


export default ProductDiscountRule;