import './App.css';
import { useState } from 'react';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import {
  Program, Provider, web3
} from '@project-serum/anchor';
import idl from './idl.json';

import { getPhantomWallet } from '@solana/wallet-adapter-wallets';
import { useWallet, WalletProvider, ConnectionProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton, WalletDisconnectButton } from '@solana/wallet-adapter-react-ui';
require('@solana/wallet-adapter-react-ui/styles.css');

console.log(idl);

const wallets = [
  getPhantomWallet()
]

const { SystemProgram, Keypair } = web3;

// creating an account 
const baseAccount = Keypair.generate();
const opts = {
  preflightCommitment: "processed"
}
const programID = new PublicKey(idl.metadata.address);

function App() {

  const [user, setUser] = useState('');
  const [bio, setBio] = useState('');
  const [eventList, setEventList] = useState([]);
  const [input, setInput] = useState('');
  const wallet = useWallet();
  

  async function getProvider() {
    // create the provider and return it to the caller
    // using local network for dev.
    const network = "http://127.0.0.1:8899" //clusterApiUrl('devnet');
    const connection = new Connection(
      network, 
      opts.preflightCommitment
    );

    const provider = new Provider(
      connection,
      wallet,
      opts.preflightCommitment,
    );
    return provider;
  }

  async function initialize() {
    const provider = await getProvider();
    const program = new Program(idl, programID, provider);
    try {
      await program.rpc.initialize(
        "URMAJESTY68", "I am a developer", "first event", {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount]
      });

      const account = await program.account.baseAccount.fetch(
        baseAccount.publicKey,
      );
      console.log('from initialize() account: ', account);
      setUser(account.userName.toString());
      setBio(account.bio.toString());
      setEventList(account.eventList);
    } catch (err) {
      console.log('Transaction Error: ', err)
    }
  }

  async function update() {
    if (!input) return
    const provider = await getProvider();
    const program = new Program(idl, programID, provider);
    await program.rpc.addEvent(input, {
      accounts: {
        baseAccount: baseAccount.publicKey
      }
    });

    const account = await program.account.baseAccount.fetch(
      baseAccount.publicKey
    );
    console.log('from update() account: ', account);
    setEventList(account.eventList);
    setInput('');

  }

  if (!wallet.connected) {
    // if the user's wallet is not connected, display
    // the connect button.
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
        <WalletMultiButton />
      </div>
    )
  } else {
    return (
      <div className="App">
        <div>
          {
            !user && (<button onClick={initialize}>Initialize</button>)
          }
          {
            user ? (
              <div>
                <WalletDisconnectButton />
                
                <h1>Welcome!</h1>
                <h2>Bio: {bio}</h2>
                <input 
                  placeholder="Add event to your list"
                  onChange={e => setInput(e.target.value)}
                  value={input}
                />
                <button onClick={update}>Add Event</button>
                <h3>Events</h3>

              </div>
            ) : (
              <h3>Please Initialize.</h3>
            )
          }
          {
            eventList.map((d, i) => <h4 key={i}>{d}</h4>)
          }
        </div>
      </div>
    );
  }
}

// wallet config

const network = "http://127.0.0.1:8899" //clusterApiUrl('devnet');
const AppWithProvider = () => (
  <ConnectionProvider endpoint={network}>
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>
        <App />
      </WalletModalProvider>
    </WalletProvider>
  </ConnectionProvider>
)

export default AppWithProvider;
