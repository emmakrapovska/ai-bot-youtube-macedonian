import { Box, Button, Chip, CircularProgress, Grid, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useState } from 'react';
import useDonations from '../../../../hooks/useDonations.ts';
import DonationBatchCard from '../../../components/donation/DonationBatchCard/DonationBatchCard.tsx';
import SubmitDonationDialog from '../../../components/donation/SubmitDonationDialog/SubmitDonationDialog.tsx';

/**
 * The donation dashboard towards doniraj.vezilka.ai.
 * TODO(student): Implement useDonations, DonationBatchCard and
 * SubmitDonationDialog, plus overall donation statistics.
 */
const DonationsPage = () => {
  const { donations, loading } = useDonations();

  const [newBatchDialogOpen, setNewBatchDialogOpen] = useState<boolean>(false);

  const acceptedCount = donations.filter((d) => d.status === 'ACCEPTED').length;
  const submittedCount = donations.filter((d) => d.status === 'SUBMITTED').length;
  const totalPosts = donations.reduce((sum, d) => sum + d.postIds.length, 0);

  return (
      <Box>
        {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress/>
            </Box>
        )}
        {!loading &&
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant='h5'>Donations</Typography>
                <Button variant='contained' startIcon={<AddIcon/>} onClick={() => setNewBatchDialogOpen(true)}>
                  New Batch
                </Button>
              </Box>

              {donations.length > 0 && (
                  <Stack direction='row' spacing={1} sx={{ mb: 2 }}>
                    <Chip label={`${donations.length} batches`} size='small'/>
                    <Chip label={`${totalPosts} posts total`} size='small' variant='outlined'/>
                    <Chip label={`${submittedCount} pending review`} size='small' color='warning' variant='outlined'/>
                    <Chip label={`${acceptedCount} accepted`} size='small' color='success' variant='outlined'/>
                  </Stack>
              )}

              {donations.length === 0 && (
                  <Typography color='text.secondary'>
                    No donation batches yet. Group extracted posts into a batch and
                    donate them to doniraj.vezilka.ai.
                  </Typography>
              )}
              <Grid container spacing={2}>
                {donations.map((batch) => (
                    <Grid key={batch.id} size={{ xs: 12, sm: 6, md: 4 }}>
                      <DonationBatchCard batch={batch}/>
                    </Grid>
                ))}
              </Grid>
              <SubmitDonationDialog
                  open={newBatchDialogOpen}
                  onClose={() => setNewBatchDialogOpen(false)}
              />
            </>}
      </Box>
  );
};

export default DonationsPage;
