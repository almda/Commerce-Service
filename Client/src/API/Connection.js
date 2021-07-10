import StaticUserInfo from "./StaticUserInfo";
import {getMessage} from "@testing-library/jest-dom/dist/utils";
import ProductDTO from "../JsonClasses/ProductDTO";
import Cookies from 'js-cookie'

class Connection{
    static connection;
    static dataFromServer = [];
    static gotNotification = 0;
    static dailyStatisticsLiveUpdate = null;

    static setConnection(connection) {
        this.connection = connection;

        this.connection.onopen = () => {
            let split_url = window.location.href.split('/');
            if(split_url[split_url.length-1] === 'Disconnected'){ //TODO: maybe remember on what page i was and then get back to it
                window.location.href = '/';
            }

            console.log("connected to the server");
            console.log("saved cookie: " + window.sessionStorage.getItem('username'));
            if(window.sessionStorage.getItem('username') === null || window.sessionStorage.getItem('username') === '') {
                console.log("doesn't have a cookie");
                connection.send(JSON.stringify({
                    action: "startup",
                }))
            }
            else{
                StaticUserInfo.setUsername(window.sessionStorage.getItem('username'));
                connection.send(JSON.stringify({
                    action: "reconnection",
                    username: window.sessionStorage.getItem('username'),
                }))
            }
        }

        this.connection.onerror = (err) =>{
            console.log(err);
        }

        this.connection.onmessage = (message) => {
            let receivedData = JSON.parse(message.data);

            console.log("just got from server");
            console.log(receivedData);

            if(receivedData.type === "startup"){
                //console.log(receivedData.message().result);
                const inner_parse = JSON.parse(receivedData.message);
                window.sessionStorage.setItem('username', inner_parse.result);
                console.log("new cookie: " + inner_parse.result);
                StaticUserInfo.setUsername(inner_parse.result);
            }
            else if(receivedData.type === "notification" || receivedData.type === "reactiveNotification"){
                this.addNotification(receivedData);

                // alert(receivedData.message);
            }
            else if(receivedData.type === "liveUpdate"){
                this.dailyStatisticsLiveUpdate = receivedData;
                //this.addLiveUpdate(receivedData);
            }
            else if(receivedData.type === "response"){
                Connection.dataFromServer.push(receivedData);
            }
        }

        this.connection.onclose = (event) => {

            setTimeout(this.disconnect, 3000);

        }
    }

    static disconnect(){
        window.sessionStorage.setItem('username', ''); //TODO: change this once the db works
        window.location.href = "/Disconnected";
    }

    static addNotification(notification){
        let notificationsCookie = window.sessionStorage.getItem('notifications');

        if(notificationsCookie === null){
            notificationsCookie = [];
            notificationsCookie.push(notification);
            window.sessionStorage.setItem('notifications', JSON.stringify(notificationsCookie));
        }
        else{
            let parsed = JSON.parse(notificationsCookie);
            parsed.push(notification);
            window.sessionStorage.setItem('notifications', JSON.stringify(parsed));
        }

        this.gotNotification = 1;
    }

    static addLiveUpdate(update){
        this.dailyStatisticsLiveUpdate = update;
    }

    static waitForOpenConnection = (socket) => {
        return new Promise((resolve, reject) => {
            const maxNumberOfAttempts = 10
            const intervalTime = 200 //ms

            let currentAttempt = 0
            const interval = setInterval(() => {
                if (currentAttempt > maxNumberOfAttempts - 1) {
                    clearInterval(interval)
                    reject(new Error('Maximum number of attempts exceeded'))
                } else if (socket.readyState === socket.OPEN) {
                    clearInterval(interval)
                    resolve()
                }
                currentAttempt++
            }, intervalTime)
        })
    }

    static sendMessage = async (socket, msg) => {
        if (socket.readyState !== socket.OPEN) {
            try {
                await Connection.waitForOpenConnection(socket)
                socket.send(msg)
            } catch (err) { console.error(err) }
        } else {
            socket.send(msg)
        }
    }

    static catchNotification() {

        function sleep(ms){
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        return new Promise(async (resolve, reject) => {
            while(true){
                if(this.gotNotification === 1){
                    console.log("got a notification");
                    this.gotNotification = 0;
                    resolve(true);
                    break;
                }
                await sleep(5000);
            }
        });
    }

    static async getNotification(){
        console.log("waiting for a notification");
        return await Connection.catchNotification();
    }

    static catchLiveUpdate(){
        function sleep(ms){
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        this.dailyStatisticsLiveUpdate = null;
        return new Promise(async (resolve, reject) => {
            while(true){
                if(this.dailyStatisticsLiveUpdate !== null){
                    console.log("got a live update");
                    resolve(this.dailyStatisticsLiveUpdate);
                    break;
                }
                await sleep(5000);
            }
        });
    }

    static async getLiveUpdate(){
        console.log("waiting for live update");
        return await Connection.catchLiveUpdate();
    }


    static searchAndReturn(action){
        for(let i=0; i < Connection.dataFromServer.length; i++){
            if(Connection.dataFromServer[i] !== undefined && Connection.dataFromServer[i].action === action){
                return i;
            }
        }

        return -1;
    }

    static catchResponse(action) {

        function sleep(ms){
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        return new Promise(async (resolve, reject) => {

            let i = 0

            while(i < 30){
                if(Connection.dataFromServer.length !== 0){
                    let index = this.searchAndReturn(action);

                    if(index !== -1){
                        let message = Connection.dataFromServer[index];
                        Connection.dataFromServer.splice(index, 1);
                        // delete Connection.dataFromServer[index];
                        console.log("resolving " + action);
                        console.log("about to resolve");
                        console.log(message);
                        resolve(JSON.parse(message.message));
                        break;
                    }

                }
                //console.log("going to sleep on " + action);
                await sleep(1000);
                i++;
            }
            reject("timeout");
        });
    }

    static handleReject(error){
        alert(error);
        window.history.back();
    }

    static async getResponse(action){
        return await Connection.catchResponse(action);
    }

    static sendRegister(username, password){
        Connection.sendMessage(Connection.connection ,JSON.stringify({
            action: "register",
            identifier: window.sessionStorage.getItem('username'),
            username: username,
            pwd: password,
        }));

        return Connection.getResponse("register");
    }

    static sendLogin(username, password){
       Connection.sendMessage(Connection.connection ,JSON.stringify({
            action: "login",
            identifier: window.sessionStorage.getItem('username'),
            username: username,
            pwd: password,
        }));

        return Connection.getResponse("login");
    }

    static sendSearchStoreByName(storeName){
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: "searchByStoreName",
            storeName: storeName,
        }));

        return Connection.getResponse("searchByStoreName");
    }

    static sendSearchProductByName(productName){
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: "searchByProductName",
            productName: productName,
        }));

        return Connection.getResponse("searchByProductName");
    }

    static sendSearchProductByCategory(category){
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: "searchByProductCategory",
            category: category,
        }));

        return Connection.getResponse("searchByProductCategory");
    }

    static sendSearchProductByKeyword(keyword){
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: "searchByProductKeyword",
            keyword: keyword,
        }));

        return Connection.getResponse("searchByProductKeyword");
    }

    static sendAddToCart(storeID, productID){
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: "addToCart",
            username: window.sessionStorage.getItem('username'),
            storeID: storeID,
            productID: productID,
        }));

        return Connection.getResponse("addToCart");
    }

    static sendOfferPrice(productID, storeID, priceOffer){
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: "bidOffer",
            username: window.sessionStorage.getItem('username'),
            productID: productID,
            storeID: storeID,
            priceOffer: priceOffer,
        }));

        return Connection.getResponse("bidOffer");
    }

    static sendManagerOfferReply(offeringUsername, productID, storeID, bidReply){
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: "bidManagerReply",
            username: window.sessionStorage.getItem('username'),
            offeringUsername: offeringUsername,
            productID: productID,
            storeID: storeID,
            bidReply: bidReply,
        }));

        return Connection.getResponse("bidManagerReply");
    }

    static sendBuyOffer(productID, storeID, paymentDetails, supplyDetails){
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: "bidUserReply",
            username: window.sessionStorage.getItem('username'),
            productID: productID,
            storeID: storeID,
            paymentDetails: JSON.stringify(paymentDetails),
            supplyDetails: JSON.stringify(supplyDetails),
        }));

        return Connection.getResponse("bidUserReply");
    }

    static sendRemoveFromCart(storeID, productID){
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: "removeFromCart",
            username: window.sessionStorage.getItem('username'),
            storeID: storeID,
            productID: productID,
        }));

        return Connection.getResponse("removeFromCart");
    }

    static sendGetCartDetails(){
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: "getCartDetails",
            username: window.sessionStorage.getItem('username'),
        }));

        return Connection.getResponse("getCartDetails");
    }

    static sendUpdateProductQuantity(storeID, productID, amount){
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: "updateProductQuantity",
            username: window.sessionStorage.getItem('username'),
            storeID: storeID,
            productID: productID,
            amount: amount,
        }));

        return Connection.getResponse("updateProductQuantity");
    }

    static sendDirectPurchase(paymentDetails, supplyDetails){
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: "directPurchase",
            username: window.sessionStorage.getItem('username'),
            paymentDetails: JSON.stringify(paymentDetails),
            supplyDetails: JSON.stringify(supplyDetails),
        }));

        return Connection.getResponse("directPurchase");
    }

    static sendLogout(){
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: "logout",
            username: window.sessionStorage.getItem('username'),
        }));

        return Connection.getResponse("logout");
    }

    static sendOpenStore(storeName){
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: "openStore",
            username: window.sessionStorage.getItem('username'),
            storeName: storeName,
        }));

        return Connection.getResponse("openStore");
    }

    static sendStoreOwned(){
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: "getStoreOwned",
            username: window.sessionStorage.getItem('username'),
        }))

        return Connection.getResponse("getStoreOwned");
    }

    static sendGetMyStores(){
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: "getMyStores",
            username: window.sessionStorage.getItem('username'),
        }))

        return Connection.getResponse("getMyStores");
    }

    static sendAddProductReview(storeID, productID, review){
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: "addProductReview",
            username: window.sessionStorage.getItem('username'),
            storeID: storeID,
            productID: productID,
            review: review,
        }));

        return Connection.getResponse("addProductReview");
    }

    static sendGetPurchaseHistory(){
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: "getPurchaseHistory",
            username: window.sessionStorage.getItem('username'),
        }));

        return Connection.getResponse("getPurchaseHistory");
    }

    static sendGetDailyStatistics(date){
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: "getDailyStatistics",
            adminName: window.sessionStorage.getItem('username'),
            date: date,
        }));

        return Connection.getResponse("getDailyStatistics");
    }

    static sendIsAdmin(){
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: "isAdmin",
            username: window.sessionStorage.getItem('username'),
        }))

        return Connection.getResponse("isAdmin");
    }

    // static sendAppointManager (functionName, appointerName, appointeeName, storeId){
    //     this.connection.send(JSON.stringify({
    //         action: functionName,
    //         appointerName: appointerName,
    //         appointeeName: appointeeName,
    //         storeId: storeId,
    //     }))
    // }

    /*
    Holds for all 4 Appointments Pages
     */
    static sendAppoints (functionName, appointerName, appointeeName, storeId){
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: functionName,
            appointerName: appointerName,
            appointeeName: appointeeName,
            storeID: storeId,
        }))

        return Connection.getResponse(functionName);
    }

    /*
    Holds for 2 Permission Pages
     */
    static sendPermission (functionName, permitting, storeId, permitted, permissions){
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: functionName,
            permitting: permitting,
            storeID: storeId,
            permitted: permitted,
            permissions: permissions,
        }))

        return Connection.getResponse(functionName);
    }

    static sendAddProduct (functionName, username, name, storeId, price, categories, keywords, amount){
        var categoriesVar = categories.split(',')
        var keywordsVar = keywords.split(',')
        // var DTOtoSend = new ProductDTO(name, storeId, price, categoriesVar, keywordsVar);
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: functionName,
            username: window.sessionStorage.getItem('username'),
            productDTO: JSON.stringify({name: name,
                                               storeID: storeId,
                                                price: price,
                                                categories: categoriesVar,
                                                keywords: keywordsVar}),
            amount: amount,
        }))

        return Connection.getResponse(functionName);
    }

    static sendDeleteProduct (functionName, username, storeId, productId, amount){
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: functionName,
            username: window.sessionStorage.getItem('username'),
            storeID: storeId,
            productID: productId,
            amount: amount,
        }))

        return Connection.getResponse(functionName);
    }


    static sendEditProduct (functionName, username, storeId, productId, newPrice, newName){
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: functionName,
            username: window.sessionStorage.getItem('username'),
            storeID: storeId,
            productID: productId,
            newPrice: newPrice,
            newName: newName,
        }))

        return Connection.getResponse(functionName);
    }

    static sendStorePurchaseHistory (functionName, adminName, storeId){
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: functionName,
            username: adminName,
            storeID: storeId,
        }))

        return Connection.getResponse(functionName);
    }

    /*
    * Holds for 2 pages in Report Pages- Need to receive information too
    */
    static sendReportRequest (functionName, adminName, storeId){
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: functionName,
            username: adminName,
            storeID: storeId,
        }))

        return Connection.getResponse(functionName);
    }

    static sendStoreHistoryRequest(storeId){
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: "getStorePurchaseHistory",
            adminName: window.sessionStorage.getItem('username'),
            storeID: storeId,
        }))

        return Connection.getResponse("getStorePurchaseHistory");
    }

    static sendGetPermissionsRequest (functionName, username, storeId){
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: functionName,
            username: window.sessionStorage.getItem('username'),
            storeID: storeId,
        }))

        return Connection.getResponse(functionName);
    }

    static sendCategoryDiscountRule (functionName, username, storeId, type, category, discount){
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: functionName,
            username: username,
            storeID: storeId,

            discountRule: JSON.stringify({type: type,
                category: category,
                discount: discount,
            }),
        }))
        return Connection.getResponse(functionName);
    }

    static sendProductDiscountRule (functionName, username, storeId, type, productId, discount){
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: functionName,
            username: username,
            storeID: storeId,

            discountRule: JSON.stringify({type: type,
                productID: productId,
                discount: discount,
            }),
        }))
        return Connection.getResponse(functionName);
    }

    static sendStoreDiscountRule (functionName, username, storeId, type, discount){
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: functionName,
            username: username,
            storeID: storeId,

            discountRule: JSON.stringify({type: type,
                discount: discount,
            }),
        }))
        return Connection.getResponse(functionName);
    }

    static sendCondCategoryDiscountRule (functionName, username, storeId, type, category, discount, minUnits, maxUnits){
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: functionName,
            username: username,
            storeID: storeId,

            discountRule: JSON.stringify({type: type,
                category: category,
                discount: discount,
                categoryPredicate: JSON.stringify({category: category, minUnits: minUnits,maxUnits: maxUnits})
                //minUnits: minUnits,
                //maxUnits: maxUnits
            }),
        }))
        return Connection.getResponse(functionName);
    }

    static sendCondProductDiscountRule (functionName, username, storeId, type, productId, discount, minUnits, maxUnits){
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: functionName,
            username: username,
            storeID: storeId,

            discountRule: JSON.stringify({type: type,
                productID: productId,
                discount: discount,
                productPredicate: JSON.stringify({minUnits: minUnits,maxUnits: maxUnits, productID: productId})
                //minUnits: minUnits,
                //maxUnits: maxUnits
            }),
        }))
        return Connection.getResponse(functionName);
    }

    static sendCondStoreDiscountRule (functionName, username, storeId, type, discount, minUnits, maxUnits, minPrice){
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: functionName,
            username: username,
            storeID: storeId,

            discountRule: JSON.stringify({type: type,
                discount: discount,
                storePredicate: JSON.stringify({ minUnits: minUnits,maxUnits: maxUnits,minPrice: minPrice})
                //minUnits: minUnits,
                //maxUnits: maxUnits,
                //minPrice: minPrice,
            }),
        }))
        return Connection.getResponse(functionName);
    }

    // static sendCompositionPolicies (functionName, username, storeId, type, category, discount,
    //                                 CategoryCategory, CategoryDiscount,
    //                                 StoreDiscount,
    //                                 ProductProductId, ProductDiscount,
    //                                 CondCategoryCategory, CondCategoryDiscount, CondCategoryMinUnits, CondCategoryMaxUnits,
    //                                 CondStoreDiscount, CondStoreMinUnits, CondStoreMaxUnits, CondStoreMinPrice,
    //                                 CondProductProductId, CondProductDiscount, CondProductMinUnits, CondProductMaxUnits){
    //
    // }

    static sendCompositionPoliciesAndOr (functionName, username, storeId, type, category, discount, policyRules){
        let fixedRules = policyRules.join(', ');
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: functionName,
            username: username,
            storeID: storeId,

            discountRule: JSON.stringify({type: type,
                category: category,
                discount: discount,
                policyRules: fixedRules,
            }),
        }))
        return Connection.getResponse(functionName);
    }

    static sendCompositionPoliciesSumMax (functionName, username, storeId, type, policyRules){
        let fixedRules = policyRules.join(', ');
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: functionName,
            username: username,
            storeID: storeId,

            discountRule: JSON.stringify({type: type,
                policyRules: fixedRules,
            }),
        }))
        return Connection.getResponse(functionName);
    }

    static sendCompositionPoliciesTerm (functionName, username, storeId, type, category, discount, predicate){
        let fixedRules = predicate.join(', ');
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: functionName,
            username: username,
            storeID: storeId,

            discountRule: JSON.stringify({type: type,
                category: category,
                discount: discount,
                predicates: fixedRules,
            }),
        }))
        return Connection.getResponse(functionName);
    }

    static sendCompositionPoliciesXor (functionName, username, storeId, type, discount, policyRules, xorResolveType){
        let fixedRules = policyRules.join(', ');
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: functionName,
            username: username,
            storeID: storeId,

            discountRule: JSON.stringify({type: type,
                discount: discount,
                policyRules: fixedRules,
                xorResolveType: xorResolveType,
            }),
        }))
        return Connection.getResponse(functionName);
    }

    // static sendCompositionPoliciesTerm (functionName, username, storeId, type, predicate){
    //     let fixedRules = predicate.join(', ');
    //     Connection.sendMessage(Connection.connection, JSON.stringify({
    //         action: functionName,
    //         username: username,
    //         storeID: storeId,
    //
    //         discountRule: JSON.stringify({type: type,
    //             predicates: fixedRules,
    //         }),
    //     }))
    //     return Connection.getResponse(functionName);
    // }

    static sendGetStoreRevenue (functionName, username, storeId){
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: functionName,
            username: username,
            storeID: storeId,
        }))

        return Connection.getResponse(functionName);
    }

    static sendGetSystemRevenue (functionName, username){
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: functionName,
            username: username,
        }))

        return Connection.getResponse(functionName);
    }

    static sendGetStoreWorkersInfo (functionName, username, storeId){
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: functionName,
            username: username,
            storeID: storeId,
        }))

        return Connection.getResponse(functionName);
    }

    static sendRemoveDiscount (functionName, username, storeId, discountRuleID){
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: functionName,
            username: username,
            storeID: storeId,
            discountRuleID: discountRuleID,
        }))

        return Connection.getResponse(functionName);
    }

    static sendRemovePurchase (functionName, username, storeId, purchaseRuleID){
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: functionName,
            username: username,
            storeID: storeId,
            purchaseRuleID: purchaseRuleID,
        }))

        return Connection.getResponse(functionName);
    }

    static sendCategoryPurchaseRule (functionName, username, storeId, type, category, minUnits, maxUnits){
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: functionName,
            username: username,
            storeID: storeId,

            purchaseRule: JSON.stringify({type: type,
                category: category,
                categoryPredicate: JSON.stringify({category: category, minUnits: minUnits,maxUnits: maxUnits})
            }),
        }))
        return Connection.getResponse(functionName);
    }

    static sendBasketPurchaseRule (functionName, username, storeId, type, minUnits, maxUnits, minPrice){
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: functionName,
            username: username,
            storeID: storeId,

            purchaseRule: JSON.stringify({type: type,
                basketPredicate: JSON.stringify({ minUnits: minUnits,maxUnits: maxUnits,minPrice: minPrice})
            }),
        }))
        return Connection.getResponse(functionName);
    }

    static sendProductPurchaseRule (functionName, username, storeId, type, productId, minUnits, maxUnits){
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: functionName,
            username: username,
            storeID: storeId,

            purchaseRule: JSON.stringify({type: type,
                productID: productId,
                productPredicate: JSON.stringify({minUnits: minUnits,maxUnits: maxUnits, productID: productId})
            }),
        }))
        return Connection.getResponse(functionName);
    }

    static sendCompositionPurchaseAndOr (functionName, username, storeId, type, policyRules){
        let fixedRules = policyRules.join(', ');
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: functionName,
            username: username,
            storeID: storeId,

            purchaseRule: JSON.stringify({type: type,
                policyRules: fixedRules,
            }),
        }))
        return Connection.getResponse(functionName);
    }

    static sendCompositionPurchaseConditioning (functionName, username, storeId, type, predicate1, predicate2){
        let fixedRules = predicate1.join(', ');
        let fixedRules2 = predicate2.join(', ');
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: functionName,
            username: username,
            storeID: storeId,

            purchaseRule: JSON.stringify({type: type,
                predicates: fixedRules,
                impliedPredicates: fixedRules2,

            }),
        }))

        return Connection.getResponse(functionName);
    }

    static sendDiscountPurchaseReportRequest(functionName, username, storeId){
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: functionName,
            username: username,
            storeID: storeId,
        }))

        return Connection.getResponse(functionName);
    }

    static sendOwnerStoreHistoryReportRequest(functionName, username, storeId){
        Connection.sendMessage(Connection.connection, JSON.stringify({
            action: functionName,
            username: username,
            storeID: storeId,
        }))

        return Connection.getResponse(functionName);
    }

}

export default Connection;