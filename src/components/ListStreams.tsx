import react from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { Stream, StreamflowSolana } from "@streamflow/stream";

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';

interface UserStreams {
  stream: Stream;
  id: string;

}

const ListStreams = () => {
  const [streams, setStreams] = react.useState<UserStreams[]>([]);

  const wallet = useWallet();

  const getStreams = async (publicKey: PublicKey) => {
    const client = new StreamflowSolana.SolanaStreamClient(
      "https://api.devnet.solana.com"
    );
     // @ts-ignore
    const streams = await client.get({ wallet: publicKey });
    const result: UserStreams[] = [];
    streams.forEach(value => {
      const id = value[0];
      const stream = value[1] as Stream;
      result.push({ id, stream });
    })
    setStreams(result);
  };

  react.useEffect(() => {
    if (wallet.connected) {
      // @ts-ignore
      getStreams(wallet.publicKey);
    }
  }, [wallet.connected]);

  return (  
    <Grid container spacing={2} mt={2} px={1}>
      {wallet?.connected && (
        <Grid item xs={10}>
           <Grid item xs={10}>
            <h2> List of streams</h2>
          </Grid>
          <TableContainer component={Paper}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Stream ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Mint</TableCell>
                  <TableCell>Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {streams.map((row) => (
                  <TableRow
                    key={row.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row.id}
                    </TableCell>
                    <TableCell>{row.stream.name || '-'}</TableCell>
                    <TableCell>{row.stream.mint}</TableCell>
                    <TableCell>{row.stream.depositedAmount.toNumber()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      )}
    </Grid>
  );
}

export default ListStreams;