const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("Master Contract", function () {
  /**
   * Deploys:
   *  1) `MyToken` for testing.
   *  2) `Master` contract.
   * Mints tokens to the owner and other accounts.
   */
  async function deployMasterFixture() {
    const [owner, otherAccount, thirdAccount] = await ethers.getSigners();

    // Deploy "MyToken"
    // constructor(
    //   string memory _name,
    //   string memory _symbol,
    //   uint256 _supply,
    //   address _initialOwner
    // )
    const MyToken = await ethers.getContractFactory("MyToken");
    // Example: name="MyToken", symbol="MKT", supply=10000, owner=owner.address
    const myToken = await MyToken.deploy("MyToken", "MKT", 10000, owner.address);
    await myToken.deployed();

    // Now transfer some tokens from owner to other accounts
    // The total supply is 10000 * 10^18, minted to `owner`.
    // We'll share some with otherAccount, etc., if you wish:
    await myToken.transfer(otherAccount.address, ethers.parseEther("1000"));
    await myToken.transfer(thirdAccount.address, ethers.parseEther("1000"));

    // Deploy the Master contract
    const Master = await ethers.getContractFactory("Master");
    const master = await Master.deploy();
    await master.deployed();

    return { master, myToken, owner, otherAccount, thirdAccount };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { master, owner } = await loadFixture(deployMasterFixture);
      expect(await master.owner()).to.equal(owner.address);
    });
  });

  describe("Owner-only functions", function () {
    it("Should allow the owner to setVault", async function () {
      const { master, owner, otherAccount } = await loadFixture(deployMasterFixture);
      await expect(master.connect(owner).setVault(otherAccount.address)).to.not.be.reverted;
    });

    it("Should revert if a non-owner tries to setVault", async function () {
      const { master, otherAccount } = await loadFixture(deployMasterFixture);
      await expect(master.connect(otherAccount).setVault(otherAccount.address)).to.be.reverted;
    });

    it("Should allow the owner to setFee", async function () {
      const { master, owner } = await loadFixture(deployMasterFixture);
      await expect(master.connect(owner).setFee(ethers.parseEther("1"))).to.not.be.reverted;
    });

    it("Should revert if a non-owner tries to setFee", async function () {
      const { master, otherAccount } = await loadFixture(deployMasterFixture);
      await expect(master.connect(otherAccount).setFee(ethers.parseEther("1"))).to.be.reverted;
    });

    it("Should allow the owner to withdrawNative", async function () {
      const { master, owner } = await loadFixture(deployMasterFixture);

      // Send some ETH to the master contract
      await owner.sendTransaction({
        to: master.getAddress ? await master.getAddress() : master.address, 
        value: ethers.parseEther("1"),
      });

      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
      await expect(master.connect(owner).withdrawNative(owner.address)).to.not.be.reverted;
      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);

      // Gas consumption can vary, so check that the balance at least increases significantly.
      expect(ownerBalanceAfter).to.be.gt(ownerBalanceBefore);
    });

    it("Should revert if a non-owner tries to withdrawNative", async function () {
      const { master, otherAccount } = await loadFixture(deployMasterFixture);
      await expect(
        master.connect(otherAccount).withdrawNative(otherAccount.address)
      ).to.be.reverted;
    });

    it("Should allow the owner to withdrawToken", async function () {
      const { master, myToken, owner } = await loadFixture(deployMasterFixture);

      // Transfer tokens into the master contract
      await myToken.transfer(
        master.getAddress ? await master.getAddress() : master.address,
        ethers.parseEther("100")
      );

      await expect(master.connect(owner).withdrawToken(owner.address, myToken.address))
        .to.not.be.reverted;

      // Check the final balance in the Master contract
      expect(await myToken.balanceOf(master.address)).to.equal(0);
    });

    it("Should revert if non-owner tries to withdrawToken", async function () {
      const { master, myToken, otherAccount } = await loadFixture(deployMasterFixture);
      await expect(
        master.connect(otherAccount).withdrawToken(otherAccount.address, myToken.address)
      ).to.be.reverted;
    });
  });

  describe("Cross-chain deposit/withdraw simulation (ccipReceive)", function () {
    it("Should deposit tokens on valid CCIP message", async function () {
      const { master, myToken, owner } = await loadFixture(deployMasterFixture);

      // Set the vault so ccipReceive checks pass
      await master.setVault(owner.address);

      // Build a mock CCIP message
      const user = owner.address;
      const token = myToken.address;
      const amount = ethers.parseEther("10");
      const add = true;

      const mockSender = ethers.defaultAbiCoder.encode(["address"], [owner.address]);
      const mockData = ethers.defaultAbiCoder.encode(
        ["address","address","uint256","bool"],
        [user, token, amount, add]
      );

      const mockAny2EVMMessage = {
        sourceChainId: 0,
        sender: mockSender,
        data: mockData,
        tokenAmounts: [],
      };

      // Simulate ccipReceive
      await master.connect(owner).ccipReceive(mockAny2EVMMessage);

      const userBalance = await master.balance(user, token);
      expect(userBalance).to.equal(amount);

      expect(await master.getLength(user)).to.equal(1);
    });

    it("Should withdraw tokens on valid CCIP message", async function () {
      const { master, myToken, owner } = await loadFixture(deployMasterFixture);

      // Set the vault
      await master.setVault(owner.address);

      // First deposit
      const depositData = {
        sourceChainId: 0,
        sender: ethers.defaultAbiCoder.encode(["address"], [owner.address]),
        data: ethers.defaultAbiCoder.encode(
          ["address","address","uint256","bool"],
          [owner.address, myToken.address, ethers.parseEther("50"), true]
        ),
        tokenAmounts: [],
      };
      await master.ccipReceive(depositData);

      // Now withdraw
      const withdrawData = {
        sourceChainId: 0,
        sender: ethers.defaultAbiCoder.encode(["address"], [owner.address]),
        data: ethers.defaultAbiCoder.encode(
          ["address","address","uint256","bool"],
          [owner.address, myToken.address, ethers.parseEther("20"), false]
        ),
        tokenAmounts: [],
      };
      await master.ccipReceive(withdrawData);

      const userBalance = await master.balance(owner.address, myToken.address);
      expect(userBalance).to.equal(ethers.parseEther("30"));
      expect(await master.getLength(owner.address)).to.equal(1);
    });

    it("Should remove token from user’s list if balance goes to zero", async function () {
      const { master, myToken, owner } = await loadFixture(deployMasterFixture);

      await master.setVault(owner.address);

      // Deposit 50
      const depositData = {
        sourceChainId: 0,
        sender: ethers.defaultAbiCoder.encode(["address"], [owner.address]),
        data: ethers.defaultAbiCoder.encode(
          ["address","address","uint256","bool"],
          [owner.address, myToken.address, ethers.parseEther("50"), true]
        ),
        tokenAmounts: [],
      };
      await master.ccipReceive(depositData);

      expect(await master.getLength(owner.address)).to.equal(1);

      // Withdraw 50
      const withdrawData = {
        sourceChainId: 0,
        sender: ethers.defaultAbiCoder.encode(["address"], [owner.address]),
        data: ethers.defaultAbiCoder.encode(
          ["address","address","uint256","bool"],
          [owner.address, myToken.address, ethers.parseEther("50"), false]
        ),
        tokenAmounts: [],
      };
      await master.ccipReceive(withdrawData);

      expect(await master.balance(owner.address, myToken.address)).to.equal(0);
      expect(await master.getLength(owner.address)).to.equal(0);
    });
  });

  describe("sendTokensOut", function () {
    it("Should revert if user does not have enough balance", async function () {
      const { master, myToken, owner } = await loadFixture(deployMasterFixture);
      await expect(
        master.connect(owner).sendTokensOut(owner.address, myToken.address, ethers.parseEther("5"))
      ).to.be.revertedWith("Not enough balance!");
    });

    it("Should revert if the fee is not paid", async function () {
      const { master, myToken, owner } = await loadFixture(deployMasterFixture);

      // Set a small fee
      await master.setFee(ethers.parseEther("0.01"));

      // Set vault
      await master.setVault(owner.address);

      // Deposit some tokens into user balance
      const depositData = {
        sourceChainId: 0,
        sender: ethers.defaultAbiCoder.encode(["address"], [owner.address]),
        data: ethers.defaultAbiCoder.encode(
          ["address","address","uint256","bool"],
          [owner.address, myToken.address, ethers.parseEther("100"), true]
        ),
        tokenAmounts: [],
      };
      await master.ccipReceive(depositData);

      // Try to send tokens out without paying fee
      await expect(
        master.connect(owner).sendTokensOut(
          owner.address,
          myToken.address,
          ethers.parseEther("10"),
          { value: 0 }
        )
      ).to.be.revertedWith("Pay the fee!");
    });

    it("Should succeed if fee is paid and user has balance", async function () {
      const { master, myToken, owner } = await loadFixture(deployMasterFixture);

      // Set fee
      await master.setFee(ethers.parseEther("0.01"));

      // Set vault
      await master.setVault(owner.address);

      // Deposit some tokens
      const depositData = {
        sourceChainId: 0,
        sender: ethers.defaultAbiCoder.encode(["address"], [owner.address]),
        data: ethers.defaultAbiCoder.encode(
          ["address","address","uint256","bool"],
          [owner.address, myToken.address, ethers.parseEther("100"), true]
        ),
        tokenAmounts: [],
      };
      await master.ccipReceive(depositData);

      // Now send tokens out, paying enough ETH to cover fee
      await expect(
        master.connect(owner).sendTokensOut(
          owner.address,
          myToken.address,
          ethers.parseEther("10"),
          { value: ethers.parseEther("1") } // Enough to cover 0.01 + router fee
        )
      ).to.not.be.reverted;
    });
  });
});
