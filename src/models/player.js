const Coin = require('./coin.js');
const Path = require('./path.js');
const PairedCoins = require('./pairedCoins.js');

const isOdd = number => {
  return number % 2 != 0;
};

class Player {
  constructor(name, color, coins, path) {
    this.name = name;
    this.color = color;
    this.coins = coins;
    this.path = path;
    this.pairedCoins = new PairedCoins();
    this.hasKilledOpp = false;
  }
  getName() {
    return this.name;
  }
  getCoin(id) {
    return this.coins.find(coin => coin.id == id);
  }
  getColor() {
    return this.color;
  }
  getCoins() {
    return this.coins;
  }
  pairCoins(cell){
    if(cell.isUnsafe() && cell.noOfCoins==2){
      this.pairedCoins.addPair(cell.getCoins(),cell.position);
    }
  }
  getStatus() {
    let coinsPositions = this.coins.map(coin => coin.getStatus());
    return {
      name: this.name,
      color: this.color,
      coins: coinsPositions
    };
  }
  getPath() {
    return this.path;
  }
  isCoinPaired(coinId){
    return this.pairedCoins.isCoinPaired(coinId);
  }
  getMovableCoins(move) {
    let currentMove;
    let hasKilledOpp = this.hasKilledOpp;
    return this.coins.filter(coin => {
      currentMove = move;
      if(this.isCoinPaired(coin.id)){
        currentMove = move / 2;
      }
      if(isOdd(move) && this.isCoinPaired(coin.id)){
        return false;
      }
      return this.path.isMovePossible(coin, currentMove, hasKilledOpp);
    });
  }
  hasMovableCoins(move) {
    return this.getMovableCoins(move).length > 0;
  }
  assignPath(path) {
    this.path.add(path);
  }
  moveCoin(coinId, move) {
    let coin = this.getCoin(coinId);
    let coinPair = this.pairedCoins.getPairOf(+coinId);
    let status;
    let coinsToMove = [];
    if(coinPair){
      let coinIds = coinPair.coinIds;
      move = move/2;
      coinIds.forEach((coinId)=>{
        coin = this.getCoin(coinId);
        status = this.path.moveCoin(coin, move, this.hasKilledOpp);
      });
    }else{
      status = this.path.moveCoin(coin, move, this.hasKilledOpp);
    }
    this.pairCoins(this.getPath().getCell(coin.position));
    return status;
  }
  moveCoinToHome(coinDetail) {
    let coin = this.coins.find((coin) => coin.id == coinDetail.id);
    this.path.putAtHome(coin);
  }
  getNoOfCoinsInDest() {
    let path = this.getPath();
    return path.getCoinsInDest();
  }
  setKilledOpponent() {
    this.hasKilledOpp = true;
  }
  getNextPos(coinId,move){
    let coinPair = this.pairedCoins.getPairOf(+coinId);
    if(coinPair && !isOdd(move)){
      move = move / 2;
    }
    let coin = this.coins.find(coin=>coin.id==coinId);
    let status = this.path.getNextMove(coin,move,this.hasKilledOpp);
    return status.position;
  }
}
module.exports = Player;
