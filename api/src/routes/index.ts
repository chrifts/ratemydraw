// const router = require("express").Router();
// const AuthController = require("../controllers/AuthController");
// const Middleware = require("../middlewares");
// const UserModel = require ("../models/user.model");

// import { ADD_CONTACT, GET_CONTACTS, HANDLE_CONTACT_REQUEST, READ_NOTIFICATIONS, DELETE_NOTIFICATION } from "../controllers/user/index";

// import { getOrCreate, postMessage, getMessages, clearNotifications } from '../controllers/chat/index';

// module.exports = function(io: any) {
    

//     router.post("/auth/signup", AuthController.signup);

//     router.post("/auth/login", AuthController.login);

//     router.post("/auth/refresh_token", AuthController.generateRefreshToken);

//     router.post("/auth/logout", AuthController.logout);

//     router.post('/get-user', Middleware.checkAuth, async function (req, res) {
//         let fullUser = await UserModel.findOne({ email: req.user.email }).lean();
//         if(fullUser) {
//             delete fullUser.password;
//         }
//         res.status(200).send(fullUser);
//     }); 

//     router.post("/user/add-contact", Middleware.checkAuth, ADD_CONTACT(io));    
    
//     router.post("/user/get-contacts", Middleware.checkAuth, GET_CONTACTS(io));
    
//     router.post("/user/handle-contact-request", Middleware.checkAuth, HANDLE_CONTACT_REQUEST(io));

//     router.post("/user/read-notifications", Middleware.checkAuth, READ_NOTIFICATIONS());

//     router.post("/user/remove-notification", Middleware.checkAuth, DELETE_NOTIFICATION());

//     router.post("/chat/get-or-create", Middleware.checkAuth, getOrCreate);

//     router.post("/chat/get-messages", Middleware.checkAuth, getMessages);
    
//     router.post("/chat/post-message", Middleware.checkAuth, postMessage(io));
    
//     router.post("/chat/clear-notifications", Middleware.checkAuth, clearNotifications);
    
//     return router; 
// }

const router = require("express").Router();
import { join } from "../controllers/RoomController";
const Middleware = require("../middlewares");
const UserModel = require ("../models/user.model");

import { ADD_CONTACT, GET_CONTACTS, HANDLE_CONTACT_REQUEST, READ_NOTIFICATIONS, DELETE_NOTIFICATION } from "../controllers/user/index";

import { getOrCreate, postMessage, getMessages, clearNotifications } from '../controllers/chat/index';

module.exports = function(io: any) {
    

    router.post("/join-public", join(io));

    return router; 
}