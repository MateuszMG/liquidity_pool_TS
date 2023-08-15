"use strict";
class LpPool {
  constructor(price, feeMin, feeMax, liquidityTarget) {
    this.tokenReserve = 0;
    this.stakedTokenReserve = 0;
    this.lpTokenSupply = 0;
    this.price = price;
    this.feeMin = feeMin;
    this.feeMax = feeMax;
    this.liquidityTarget = liquidityTarget;
  }

  addLiquidity(amount) {
    this.tokenReserve += amount;
    const liquidityMinted =
      this.lpTokenSupply === 0
        ? amount
        : amount * (this.lpTokenSupply / this.tokenReserve);
    this.lpTokenSupply += liquidityMinted;
    return liquidityMinted;
  }

  removeLiquidity(lpTokenAmount) {
    const tokenAmount =
      (lpTokenAmount / this.lpTokenSupply) * this.tokenReserve;
    const stakedTokenAmount =
      (lpTokenAmount / this.lpTokenSupply) * this.stakedTokenReserve;
    this.tokenReserve -= tokenAmount;
    this.stakedTokenReserve -= stakedTokenAmount;
    this.lpTokenSupply -= lpTokenAmount;
    return [tokenAmount, stakedTokenAmount];
  }

  swap(stakedTokenAmount) {
    const tokenAmount = stakedTokenAmount * this.price;
    const feePercentage = this.calculateFeePercentage();
    const fee = tokenAmount * feePercentage;
    this.tokenReserve -= tokenAmount;
    this.stakedTokenReserve += stakedTokenAmount;
    return tokenAmount - fee;
  }

  calculateFeePercentage() {
    const liquidityRatio = this.tokenReserve / this.liquidityTarget;
    return this.feeMin + liquidityRatio * (this.feeMax - this.feeMin);
  }
}

const lpPool = new LpPool(1.5, 0.001, 0.09, 90.0);
console.log(lpPool.addLiquidity(100.0));
console.log(lpPool.swap(6));
console.log(lpPool.addLiquidity(10.0));
console.log(lpPool.swap(30.0));
console.log(lpPool.removeLiquidity(109.9991));
