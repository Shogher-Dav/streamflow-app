import React from 'react';

import { useWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { getBN, StreamflowSolana } from '@streamflow/stream';

import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';

interface AvailableTokens {
  mint: string;
  isNative: boolean;
  amount: number;
  decimals: number;
  uiAmount: string;
}
const CreateStream = () => {
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet();
  const [loading, setLoading] = React.useState(false);
  const [tx, setTx] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [recipient, setRecipient] = React.useState("");
  const [streamName, setStreamName] = React.useState("");
  const [availableTokens, setAvailableTokens] = React.useState<AvailableTokens[]>([]);
  const [selectedToken, setSelectedToken] = React.useState<AvailableTokens>();


  const getTokenAccounts = async () => {
    const solanaConnection = new Connection("https://api.devnet.solana.com");
    const response = await solanaConnection.getParsedTokenAccountsByOwner(
       // @ts-ignore
       wallet.publicKey,
       { programId: TOKEN_PROGRAM_ID },
    );
    const result: AvailableTokens[] = [];
    response.value.forEach(value => {
      const mint = value.account.data.parsed.info.mint;
      const isNative = value.account.data.parsed.info.isNative;
      const amount = value.account.data.parsed.info.tokenAmount.uiAmount;
      const uiAmount = value.account.data.parsed.info.tokenAmount.uiAmountString;
      const decimals = value.account.data.parsed.info.tokenAmount.decimals;
      if (amount > 0) {
        result.push({ mint, amount, uiAmount, decimals, isNative });
      }
    });
    setAvailableTokens(result);
   };

   const onTokenChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedToken = availableTokens.find(token => token.mint === event.target.value);
      setSelectedToken(selectedToken);
   };

   const createStream = async () => {
  
    const client = new StreamflowSolana.SolanaStreamClient(
      "https://api.devnet.solana.com"
    );
    const mint = selectedToken?.mint;
    const depositedAmount = getBN(Number(amount), selectedToken?.decimals || 0);
    const amountPerPeriod = getBN(Number(amount) / 10, selectedToken?.decimals || 0);

     const createStreamParams = {
      recipient,
      tokenId: mint, 
      start:  Math.ceil(Date.now()/1000) + 300,
      depositedAmount, 
      period: 1, 
      cliff: 0, 
      cliffAmount: getBN(0, 9),
      amountPerPeriod,
      name: streamName,
      canTopup: false,
      cancelableBySender: true,
      cancelableByRecipient: false,
      transferableBySender: true,
      transferableByRecipient: false,
      automaticWithdrawal: true,
      withdrawalFrequency: 10,
      partner: null,
    };
    const solanaParams = {
      sender: anchorWallet, 
      isNative: selectedToken?.isNative
  };
    try {
      setLoading(true);
      // @ts-ignore
      const { ixs, tx, metadata } = await client.create(createStreamParams, solanaParams);
      setLoading(false);
      setTx(tx);
      setAvailableTokens([]);
      setAmount("");
      setRecipient("");
      setStreamName("");
    } catch (exception) {
      console.log("exception", exception);
    }
  };

  React.useEffect(() => {
    if (wallet.connected) {
      getTokenAccounts();
    }
  }, [wallet.connected]);

  React.useEffect(() => {
    return () => {
      setTx("");
    }
  }, []);

  return (
    <Grid container spacing={3}  direction="column">
      {wallet?.connected && (
        <>
          <Grid item xs={4}>
            <TextField select value={selectedToken?.mint} onChange={onTokenChange} fullWidth label="Select token">
              {availableTokens.map((token) => (
                <MenuItem key={token.mint} value={token.mint}>
                  {token.mint} - {token.uiAmount}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Stream Name"
              value={streamName}
              onChange={(e) => setStreamName(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={createStream}
                disabled={loading}
              >
                {loading ? 'Creating stream...' : 'Create Stream' }
              </Button>
              {!loading && tx && (
                <Typography variant="body1" component="div">
                  Stream txn id : {tx}
                </Typography>
              )}
            </>
          </Grid>
        </>
      )}
    </Grid>
  );
}

export default CreateStream;

