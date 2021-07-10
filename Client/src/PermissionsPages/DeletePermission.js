import React from "react";
import StaticUserInfo from "../API/StaticUserInfo";
import Connection from "../API/Connection";

class DeletePermission extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            functionName: 'removePermission',
            permitting: window.sessionStorage.getItem('username'),
            storeId: window.sessionStorage.getItem('storeID'),
            permitted: '',
            permissions: '',
        };
    }

    handleClick(e) {
        e.preventDefault();
        Connection.sendPermission(this.state.functionName, this.state.permitting, this.state.storeId, this.state.permitted, this.state.permissions).then(this.handleResponse, Connection.handleReject);
    }

    handleInputChange = (e, name) => {
        this.setState({
            [name]: e.target.value
        })
    }

    handleResponse(result) {
        alert(result.result);
    }

    render() {
        return (
            <form>
                <h1>Remove Permission Page </h1>
                <div> <label> Permitting : <input readOnly value = {this.state.permitting} className = "permitting" type = "text" onChange = {(e) => this.handleInputChange(e, 'permitting')}/> </label> </div>
                <div> <label> Store Id : <input readOnly value = {this.state.storeId} className = "storeId" type = "text" onChange = {(e) => this.handleInputChange(e, 'storeId')}/> </label> </div>
                <div> <label> Permitted : <input className = "permitted" type = "text" onChange = {(e) => this.handleInputChange(e, 'permitted')}/> </label> </div>
                <div> <label> Permissions* : <input className = "permissions" type = "text" placeholder='OPEN_STORE, REVIEW_PRODUCT,...' style={{width: "370px"}} onChange = {(e) => this.handleInputChange(e, 'permissions')}/> </label> </div>
                <button type = "button" onClick = {(e) => this.handleClick(e)}> Remove Permission </button>
            </form>
        )
    }
}

export default DeletePermission;