import { Button, Card, CardActions, CardContent, Chip, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SendIcon from '@mui/icons-material/Send';
import type { DonationStatus, DonationBatchResponse } from '../../../../api/types/donation.ts';
import useDonations from '../../../../hooks/useDonations.ts';

interface DonationBatchCardProps {
  batch: DonationBatchResponse;
}

/**
 * TODO(student): Show the batch: number of posts, status, the Vezilka
 * reference once submitted, and approve/submit actions
 * (useDonations().onApprove / onSubmit) enabled according to the status.
 */
const STATUS_COLORS: Record<DonationStatus, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  DRAFT: 'default',
  APPROVED: 'info',
  SUBMITTED: 'warning',
  ACCEPTED: 'success',
  REJECTED: 'error',
  FAILED: 'error'
};

const canApprove = (status: DonationStatus) => status === 'DRAFT';
const canSubmit = (status: DonationStatus) => status === 'APPROVED';

const formatTimestamp = (value: string | null) => {
  if (!value) return null;
  return new Date(value).toLocaleString();
};

const DonationBatchCard = ({ batch }: DonationBatchCardProps) => {
  const { onApprove, onSubmit } = useDonations();

  return (
      <Card>
        <CardContent>
          <Typography variant='h6'>Batch #{batch.id}</Typography>

          <Chip
              label={batch.status}
              size='small'
              color={STATUS_COLORS[batch.status]}
              sx={{ mt: 1, mb: 1 }}
          />

          <Typography variant='body2' color='text.secondary'>
            {batch.postIds.length} post{batch.postIds.length !== 1 ? 's' : ''}
          </Typography>

          <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
            Created: {formatTimestamp(batch.createdAt)}
          </Typography>

          {batch.submittedAt && (
              <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
                Submitted: {formatTimestamp(batch.submittedAt)}
              </Typography>
          )}

          {batch.vezilkaReference && (
              <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ display: 'block', wordBreak: 'break-all' }}
              >
                Vezilka ref: {batch.vezilkaReference}
              </Typography>
          )}
        </CardContent>

        <CardActions>
          <Button
              startIcon={<CheckCircleIcon/>}
              color='success'
              size='small'
              disabled={!canApprove(batch.status)}
              onClick={() => onApprove(batch.id)}
          >
            Approve
          </Button>
          <Button
              startIcon={<SendIcon/>}
              color='primary'
              size='small'
              disabled={!canSubmit(batch.status)}
              onClick={() => onSubmit(batch.id)}
          >
            Submit
          </Button>
        </CardActions>
      </Card>
  );
};

export default DonationBatchCard;
