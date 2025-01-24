const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("Vault_CCIP Contract", function () {
  /**
   * Deploys:
   * 1) `MyToken`
   * 2) `Vault_CCIP`
   * and does basic setup for testing.
   *
   * Returns { vault, myToken, owner, otherAccount, thirdAccount }.
   */
  async function deployVaultFixture() {
    const [owner, otherAccount, thirdAccount] = await ethers.getSigners();

    // 1) Deploy an ERC20 token (e.g. MyToken)
    //    Adjust constructor params to match your token if they differ.
    const MyToken = await ethers.getContractFactory("MyToken");
    const myToken = await MyToken.deploy("MyToken", "MTK", 100000, owner.address);
    await myToken.deployed();

    // Transfer some tokens to other signers for testing
    await myToken.transfer(otherAccount.address, ethers.parseEther("1000"));
    await myToken.transfer(thirdAccount.address, ethers.parseEther("1000"));

    // 2) Deploy the Vault_CCIP contract
    const Vault = await ethers.getContractFactory("Vault_CCIP");
    const vault = await Vault.deploy();
    await vault.deployed();

    return { vault, myToken, owner, otherAccount, thirdAccount };
  }

  describe("Deployment & Basic Checks", function () {
    it("Should set the correct owner", async function () {
      const { vault, owner } = await loadFixture(deployVaultFixture);
      expect(await vault.owner()).to.equal(owner.address);
    });

    it("Should allow owner to changeMaster", async function () {
      const { vault, owner, otherAccount } = await loadFixture(deployVaultFixture);
      await expect(vault.connect(owner).changeMaster(otherAccount.address)).to.not.be.reverted;
    });

    it("Should revert if non-owner tries to changeMaster", async function () {
      const { vault, otherAccount } = await loadFixture(deployVaultFixture);
      await expect(vault.connect(otherAccount).changeMaster(otherAccount.address)).to.be.reverted;
    });
  });

  describe("Fees and Owner Withdrawals", function () {
    it("Should allow owner to withdrawNative", async function () {
      const { vault, owner } = await loadFixture(deployVaultFixture);

      // Send some ETH to vault
      await owner.sendTransaction({
        to: vault.address,
        value: ethers.parseEther("1"),
      });

      const beforeBalance = await ethers.provider.getBalance(owner.address);
      await expect(vault.connect(owner).withdrawNative(owner.address)).to.not.be.reverted;
      const afterBalance = await ethers.provider.getBalance(owner.address);

      expect(afterBalance).to.be.gt(beforeBalance);
    });

    it("Should revert if non-owner tries to withdrawNative", async function () {
      const { vault, otherAccount } = await loadFixture(deployVaultFixture);
      await expect(vault.connect(otherAccount).withdrawNative(otherAccount.address)).to.be.reverted;
    });

    it("Should allow owner to withdrawToken", async function () {
      const { vault, myToken, owner } = await loadFixture(deployVaultFixture);

      // Transfer tokens to the vault
      await myToken.transfer(vault.address, ethers.parseEther("100"));

      // Now withdraw from vault to owner
      await expect(vault.connect(owner).withdrawToken(owner.address, myToken.address)).to.not.be.reverted;
      expect(await myToken.balanceOf(vault.address)).to.equal(0);
    });

    it("Should revert if non-owner tries to withdrawToken", async function () {
      const { vault, myToken, otherAccount } = await loadFixture(deployVaultFixture);
      await expect(vault.connect(otherAccount).withdrawToken(otherAccount.address, myToken.address)).to.be.reverted;
    });
  });

  describe("Deposit Tokens", function () {
    it("Should revert if user does not pay the fee (when fee > 0)", async function () {
      const { vault, myToken, owner } = await loadFixture(deployVaultFixture);

      // Suppose you want to set the fee to some nonzero value.
      // There's no public setter in your snippet, but you can add one or test otherwise.
      // We'll assume you might have something like vault.connect(owner).setFee(...).
      // If you do not have a setFee function, skip or adapt this test.

      // For demonstration, let's assume you *added*:
      // function setFee(uint256 newFee) external onlyOwner { fee = newFee; }
      // to your Vault_CCIP. If not, comment out or adapt.

      // await vault.connect(owner).setFee(ethers.parseEther("0.01"));

      // Try deposit with msg.value = 0
      await expect(
        vault.depositToken(owner.address, myToken.address, ethers.parseEther("10"), {
          value: 0,
        })
      ).to.be.revertedWith("Pay the fee!");
    });

    it("Should deposit tokens and emit CCIP message (mocked)", async function () {
      const { vault, myToken, owner } = await loadFixture(deployVaultFixture);

      // Approve vault to transfer user's tokens
      await myToken.connect(owner).approve(vault.address, ethers.parseEther("100"));

      // deposit 10 tokens
      await expect(
        vault.depositToken(owner.address, myToken.address, ethers.parseEther("10"), {
          value: ethers.parseEther("1"), // Enough to cover fee if set, plus router cost
        })
      ).to.not.be.reverted;

      // Check Vault's internal balance mapping
      const bal = await vault.balance(owner.address, myToken.address);
      expect(bal).to.equal(ethers.parseEther("10"));

      // The token should be in the user's list
      expect(await vault.getLength(owner.address)).to.equal(1);
    });

    it("Should revert if user hasn’t approved enough tokens", async function () {
      const { vault, myToken, owner } = await loadFixture(deployVaultFixture);

      // No approval or insufficient approval
      await myToken.connect(owner).approve(vault.address, ethers.parseEther("5")); // only 5

      await expect(
        vault.depositToken(owner.address, myToken.address, ethers.parseEther("10"), {
          value: ethers.parseEther("1"),
        })
      ).to.be.reverted; // reverts from SafeERC20 if allowance is insufficient
    });
  });

  describe("Withdraw Tokens", function () {
    it("Should revert if user does not have enough vault balance", async function () {
      const { vault, myToken, owner } = await loadFixture(deployVaultFixture);

      // Approve & deposit only 10
      await myToken.connect(owner).approve(vault.address, ethers.parseEther("10"));
      await vault.depositToken(owner.address, myToken.address, ethers.parseEther("10"), {
        value: ethers.parseEther("0"), // fee might be 0 in your unmodified code
      });

      // Attempt to withdraw 20
      await expect(
        vault.withdrawTokens(myToken.address, ethers.parseEther("20"), {
          value: 0,
        })
      ).to.be.revertedWith("Not enough balance!");
    });

    it("Should allow user to withdraw if they have enough balance", async function () {
      const { vault, myToken, owner } = await loadFixture(deployVaultFixture);

      // Approve & deposit 50
      await myToken.connect(owner).approve(vault.address, ethers.parseEther("50"));
      await vault.depositToken(owner.address, myToken.address, ethers.parseEther("50"), {
        value: 0,
      });

      // Check pre-withdraw Vault balance
      expect(await vault.balance(owner.address, myToken.address)).to.equal(ethers.parseEther("50"));

      // Withdraw 20
      await expect(
        vault.connect(owner).withdrawTokens(myToken.address, ethers.parseEther("20"), { value: 0 })
      ).to.not.be.reverted;

      // Check internal vault balance
      expect(await vault.balance(owner.address, myToken.address)).to.equal(ethers.parseEther("30"));

      // User’s actual token balance should have increased by 20
      // The user started with 100,000 minted to them, but we transferred some to vault, etc.
      // For a precise check, you'd measure the difference before/after if needed.
      // We'll just check that the vault no longer holds the 20.
      // But let's do the direct check:
      expect(await myToken.balanceOf(owner.address)).to.be.gt(ethers.parseEther("99950")); 
      // or do a more direct approach
    });

    it("Should remove token from user’s token array if balance goes to 0", async function () {
      const { vault, myToken, owner } = await loadFixture(deployVaultFixture);

      // deposit 10
      await myToken.connect(owner).approve(vault.address, ethers.parseEther("10"));
      await vault.depositToken(owner.address, myToken.address, ethers.parseEther("10"));

      expect(await vault.getLength(owner.address)).to.equal(1);

      // withdraw 10
      await vault.connect(owner).withdrawTokens(myToken.address, ethers.parseEther("10"));

      expect(await vault.balance(owner.address, myToken.address)).to.equal(0);
      expect(await vault.getLength(owner.address)).to.equal(0);
    });
  });

  describe("CCIP & _sendTokensOut", function () {
    it("Should revert if ccipReceive sender is not the master", async function () {
      const { vault, myToken, owner } = await loadFixture(deployVaultFixture);

      // We'll not set the vault's `master` address or set it to something else
      // ccipReceive should revert with "Invalid sender!"
      const mockAny2EVMMessage = {
        sourceChainId: 0,
        sender: ethers.defaultAbiCoder.encode(["address"], [owner.address]), // but vault.master is 0x0 by default
        data: ethers.defaultAbiCoder.encode(
          ["address","address","address","uint256"],
          [owner.address, owner.address, myToken.address, ethers.parseEther("5")]
        ),
        tokenAmounts: [],
      };

      await expect(vault.ccipReceive(mockAny2EVMMessage)).to.be.revertedWith("Invalid sender!");
    });

    it("Should call _sendTokensOut if ccipReceive sender is master (and valid data)", async function () {
      const { vault, myToken, owner } = await loadFixture(deployVaultFixture);

      // 1) Set vault.master to owner for test convenience
      await vault.changeMaster(owner.address);

      // 2) The user 'owner' needs some vault balance first
      await myToken.connect(owner).approve(vault.address, ethers.parseEther("10"));
      await vault.depositToken(owner.address, myToken.address, ethers.parseEther("10"));

      // 3) Craft a mock ccip message with data => (from, to, token, amount)
      const ccipMessage = {
        sourceChainId: 0,
        sender: ethers.defaultAbiCoder.encode(["address"], [owner.address]), // matches vault.master
        data: ethers.defaultAbiCoder.encode
