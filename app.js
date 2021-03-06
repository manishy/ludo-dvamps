const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const GamesManager = require(path.resolve('src/models/gamesManager.js'));
const SessionManager = require(path.resolve('src/models/sessionManager.js'));
const getHandlers = require(path.resolve('src/handlers/getHandlers.js'));
const postHandlers = require(path.resolve('src/handlers/postHandlers.js'));
const deleteHandler = require(path.resolve('src/handlers/deleteHandler.js'));
const lib = require(path.resolve('src/handlers/middleWares.js'));
const GameRoute = require(path.resolve('src/handlers/gameRoute.js'));

const app = express();

app.initialize = function(gamesManager,sessionManager,client) {
  app.gamesManager = gamesManager;
  app.sessionManager = sessionManager;
  app.client = client;
};
/*eslint-disable*/
app.use(express.urlencoded({
  extended: false
}));
app.use(express.json());
app.use(cookieParser());
app.use(lib.trimRequestBody);
app.use(lib.checkGame);
app.use(lib.logger);
app.use(lib.restrictValidPlayer);
app.set('views','templates');
app.set('view engine','pug');
app.use(express.static('public'));
app.use('/game',GameRoute);
app.get('/getAvailableGames', getHandlers.serveAvailableGames);
app.get('/waitingStatus',lib.checkGameStarted,lib.checkIsRoomPresent,getHandlers.serveWaitingStatus);
app.post('/createGame',lib.verifyReqBody,lib.verifyCreateGameReq,
  lib.checkCharacterLimit,lib.blockIfUserHasGame,lib.verifyNoOfPlayers,
  postHandlers.createNewGame);
app.post('/joinGame',lib.verifyReqBody,postHandlers.joinPlayerToGame);
app.delete('/player',lib.checkCookie,lib.verifyIsGuest,deleteHandler.removePlayer);
module.exports = app;
