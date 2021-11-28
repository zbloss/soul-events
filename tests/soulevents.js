const assert = require("assert");
const anchor = require('@project-serum/anchor');
const { SystemProgram } = anchor.web3;


describe('soulevents', () => {

  const provider = anchor.Provider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Soulevents;

  it("Initializing the account", async () => {
    const baseAccount = anchor.web3.Keypair.generate();
    await program.rpc.initialize("CoolUsername", "here is my bio!", "first event", {
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [baseAccount]
    });

    const account = await program.account.baseAccount.fetch(
      baseAccount.publicKey
    );
    console.log('account: ', account);
    console.log('User Name: ', account.userName);
    assert.ok(
      account.userName === "CoolUsername"
    );

    console.log('Bio: ', account.bio);
    assert.ok(
      account.bio === "here is my bio!"
    );
    _baseAccount = baseAccount;
  });

  it("Adding an event", async () => {
    const baseAccount = _baseAccount;
    await program.rpc.addEvent("birthday party for Zach", {
      accounts: {
        baseAccount: baseAccount.publicKey,
      }
    });

    const account = await program.account.baseAccount.fetch(
      baseAccount.publicKey
    );
    console.log('All account data: ', account);
    console.log('All Events: ', account.dataList);
    assert.ok(account.eventList.length === 2);
  });
  
});
