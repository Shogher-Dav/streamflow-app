import { Grid } from "@mui/material";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import CreateStream from "./CreateStream";
import ListStreams from "./ListStreams";

require('@solana/wallet-adapter-react-ui/styles.css');


function Main() {
  return (

    <Grid container spacing={2}     
        direction="column"
        marginTop={10}
        marginLeft={20} 
    >
      <Grid>
        <div>
          <h2>
           Select your wallet to create a stream
          </h2>
        </div>
        <WalletMultiButton  />
      </Grid>
      <Grid
      marginTop={10}
      >
        <Grid item xs={4} >
          <CreateStream />
        </Grid>
        <Grid item xs={8}>
          <ListStreams />
        </Grid>
        </Grid>
    </Grid>
  );
}

export default Main;