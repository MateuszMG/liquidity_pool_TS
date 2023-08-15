enum Errors {
  PropertyMustBeGreaterThanZero = "Property must be greater than zero",
  FeeMaxMustBeGreaterThanFeeMin = "Fee max must be greater than fee min",
  InsufficientLiquidity = "Insufficient liquidity",
}

class LpPool {
  tokenReserve: number;
  stakedTokenReserve: number;
  lpTokenSupply: number;
  price: number;
  feeMin: number;
  feeMax: number;
  liquidityTarget: number;

  constructor(
    price: number,
    feeMin: number,
    feeMax: number,
    liquidityTarget: number
  ) {
    this.tokenReserve = 0;
    this.stakedTokenReserve = 0;
    this.lpTokenSupply = 0;
    this.price = price;
    this.feeMin = feeMin;
    this.feeMax = feeMax;
    this.liquidityTarget = liquidityTarget;
  }

  addLiquidity(amount: number): number | Errors {
    if (amount <= 0) return Errors.PropertyMustBeGreaterThanZero;
    this.tokenReserve += amount;

    const liquidityMinted =
      this.lpTokenSupply === 0
        ? amount
        : amount * (this.lpTokenSupply / this.tokenReserve);

    this.lpTokenSupply += liquidityMinted;
    return liquidityMinted;
  }

  removeLiquidity(lpTokenAmount: number): [number, number] | Errors {
    if (lpTokenAmount <= 0) return Errors.PropertyMustBeGreaterThanZero;
    if (lpTokenAmount > this.lpTokenSupply) return Errors.InsufficientLiquidity;

    const tokenAmount =
      (lpTokenAmount / this.lpTokenSupply) * this.tokenReserve;
    const stakedTokenAmount =
      (lpTokenAmount / this.lpTokenSupply) * this.stakedTokenReserve;

    if (
      tokenAmount > this.tokenReserve ||
      stakedTokenAmount > this.stakedTokenReserve
    )
      return Errors.InsufficientLiquidity;

    this.tokenReserve -= tokenAmount;
    this.stakedTokenReserve -= stakedTokenAmount;
    this.lpTokenSupply -= lpTokenAmount;

    return [tokenAmount, stakedTokenAmount];
  }

  swap(stakedTokenAmount: number): number | Errors {
    if (stakedTokenAmount <= 0) return Errors.PropertyMustBeGreaterThanZero;

    const tokenAmount = stakedTokenAmount * this.price;
    const feePercentage = this.calculateFeePercentage();
    const fee = tokenAmount * feePercentage;

    if (tokenAmount > this.tokenReserve) return Errors.InsufficientLiquidity;

    this.tokenReserve -= tokenAmount;
    this.stakedTokenReserve += stakedTokenAmount;

    return tokenAmount - fee;
  }

  private calculateFeePercentage(): number {
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
