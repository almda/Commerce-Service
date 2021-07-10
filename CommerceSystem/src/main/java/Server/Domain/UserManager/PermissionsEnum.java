package Server.Domain.UserManager;

public enum PermissionsEnum {

    /** Guest **/
    REGISTER,                  /* Use Case: 2.3 */

    /** Registered User **/
    //LOGIN,                     /* Use Case: 2.4 */
    LOGOUT,                    /* Use Case: 3.1 */
    OPEN_STORE,                /* Use Case: 3.2 */
    REVIEW_PRODUCT,            /* Use Case: 3.3 */
    GET_PURCHASE_HISTORY,        /*Use Case: 3.7 */

    /** Store Owner **/
    //MANAGE_PRODUCTS,           /* Use Case: 4.1 - includes 4.1.1, 4.1.2, 4.1.3 */
    ADD_PRODUCT_TO_STORE,
    REMOVE_PRODUCT_FROM_STORE,
    UPDATE_PRODUCT_INFO,

    VIEW_DISCOUNT_POLICY,    /* Use Case: 4.2 */
    VIEW_PURCHASE_POLICY,    /* Use Case: 4.2 */

    ADD_DISCOUNT_RULE,       /* Use Case: 4.2.1 */
    ADD_PURCHASE_RULE,       /* Use Case: 4.2.2 */
    REMOVE_DISCOUNT_RULE,    /* Use Case: 4.2.3 */
    REMOVE_PURCHASE_RULE,    /* Use Case: 4.2.4 */

    APPOINT_OWNER,              /* Use Case: 4.3 */
    REMOVE_OWNER_APPOINTMENT,   /* Use Case: 4.4 */
    APPOINT_MANAGER,            /* Use Case: 4.5 */
    ADD_PERMISSION,             /* Use Case: 4.6 */
    REMOVE_PERMISSION,             /* Use Case: 4.6 */
    REMOVE_MANAGER_APPOINTMENT, /* Use Case: 4.7 */
    RECEIVE_STORE_WORKER_INFO,         /* Use Case: 4.9 */
    RECEIVE_STORE_HISTORY,      /* Use Case: 4.11 */

    RECEIVE_STORE_REVENUE,
    REPLY_TO_BID,

    /** Store Manager **/
    /* NOTE: Store manager will have permissions 4.9 and 4.10 immediately after he is appointed.
     *  all other permissions are taken from store owner above, depends on which permissions
     *  are given him by his appointer  */

    /** System Manager **/
    RECEIVE_GENERAL_HISTORY,    /* Use Case: 6.4 */
    RECEIVE_GENERAL_REVENUE,

    DAILY_VISITOR_STATISTICS
}
