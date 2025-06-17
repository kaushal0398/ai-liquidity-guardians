import { expect } from "chai";
import { ethers } from "hardhat";

describe("SmartLiquidityVault", function () {
  let owner: any, user: any;
  let TokenA: any, TokenB: any;
  let tokenA: any, tokenB: any;
  let pool: any, vault: any;

  beforeEach(async () => {
    [owner, user] = await ethers.getSigners();

    TokenA = await ethers.getContractFactory("contracts/mocks/MockERC20.sol:MockERC20");
    TokenB = await ethers.getContractFactory("contracts/mocks/MockERC20.sol:MockERC20");
    tokenA = await TokenA.deploy("Token A", "TKA", 18);
    tokenB = await TokenB.deploy("Token B", "TKB", 18);

    await tokenA.mint(user.address, ethers.utils.parseEther("1000"));
    await tokenB.mint(user.address, ethers.utils.parseEther("1000"));

    const Pool = await ethers.getContractFactory("SimpleLiquidityPool");
    pool = await Pool.deploy(tokenA.address, tokenB.address);

    const Vault = await ethers.getContractFactory("SmartLiquidityVault");
    vault = await Vault.deploy(owner.address, owner.address, owner.address); 
  });

  it("should allow user to enter vault", async () => {
    await tokenA.connect(user).approve(vault.address, ethers.utils.parseEther("500"));
    await tokenB.connect(user).approve(vault.address, ethers.utils.parseEther("500"));

    await vault.connect(user).enterVault(
      tokenA.address,
      tokenB.address,
      pool.address,
      1000,
      -10,
      15,
      false
    );

    const config = await vault.vaults(user.address);
    expect(config.active).to.equal(true);
    expect(config.owner).to.equal(user.address);
  });
});
