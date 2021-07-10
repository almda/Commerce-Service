import React from 'react';
import StaticUserInfo from "../API/StaticUserInfo";
import Connection from "../API/Connection";


class ProductPurchase extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            functionName: 'addPurchaseRule',
            username: window.sessionStorage.getItem('username'),
            storeId: window.sessionStorage.getItem('storeID'),
            type: 'ProductPurchaseRule',
            productId: '',
            minUnits: '',
            maxUnits: '',
        };
    }


    handleInputChange = (e, name) => {
        this.setState({
            [name]: e.target.value
        })
    }

    handleClick(e) {
        e.preventDefault();
        Connection.sendProductPurchaseRule(this.state.functionName, this.state.username, this.state.storeId, this.state.type, this.state.productId, this.state.minUnits, this.state.maxUnits).then(this.handleAddCategoryDiscountResponse, Connection.handleReject)
    }

    handleAddCategoryDiscountResponse(result){
        if(!result.isFailure){
            alert("adding purchase success");
        }
        else{
            alert(result.errMsg);
        }
    }

    render() {
        return (
            <form>
                <h1>Add Product Purchase Rule Page</h1>
                <div> <label> Username : <input readOnly value = {this.state.username} className = "username" type = "text" onChange = {(e) => this.handleInputChange(e, 'username')}/> </label> </div>
                <div> <label> Store Id : <input readOnly value = {this.state.storeId} className = "storeId" type = "text" onChange = {(e) => this.handleInputChange(e, 'storeId')}/> </label> </div>
                <div> <label> Product Id : <input className = "productId" type = "text" onChange = {(e) => this.handleInputChange(e, 'productId')}/> </label> </div>
                <div> <label> Minimum Units : <input className = "minUnits" type = "text" onChange = {(e) => this.handleInputChange(e, 'minUnits')}/> </label> </div>
                <div> <label> Maximum Units : <input className = "maxUnits" type = "text" onChange = {(e) => this.handleInputChange(e, 'maxUnits')}/> </label> </div>
                <button type = "button" onClick = {(e) => this.handleClick(e)}> Add Purchase </button>
            </form>
        )
    }
}


export default ProductPurchase;