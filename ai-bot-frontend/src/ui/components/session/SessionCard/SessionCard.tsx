import { Button, Card, CardActions, CardContent, Chip, Stack, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import InfoIcon from '@mui/icons-material/Info';
import { useNavigate } from 'react-router';
import type { SessionResponse, SessionStatus } from '../../../../api/types/session.ts';
import useSessions from '../../../../hooks/useSessions.ts';

interface SessionCardProps {
  session: SessionResponse;
}

/**
 * TODO(student): Extend this card — show the targets, the timestamps and a
 * status-appropriate color, and disable start/stop according to the
 * session's lifecycle (see SessionStatus).
 */
const STATUS_COLORS: Record<SessionStatus, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  CREATED: 'default',
  RUNNING: 'info',
  PAUSED: 'warning',
  COMPLETED: 'success',
  FAILED: 'error'
};

const canStart = (status: SessionStatus) => status === 'CREATED' || status === 'PAUSED';
const canStop = (status: SessionStatus) => status === 'RUNNING';

const formatTimestamp = (value: string | null) => {
  if (!value) return null;
  return new Date(value).toLocaleString();
};

const SessionCard = ({ session }: SessionCardProps) => {
  const navigate = useNavigate();
  const { onStart, onStop } = useSessions();

  return (
      <Card sx={{ maxWidth: 300, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography variant='h5'>{session.socialNetwork}</Typography>
          <Typography variant='subtitle1' sx={{ flexGrow: 1 }}>{session.description}</Typography>

          <Chip
              label={session.status}
              size='small'
              color={STATUS_COLORS[session.status]}
              sx={{ alignSelf: 'flex-start', mb: 1 }}
          />

          {session.targets.length > 0 && (
              <Stack
                  direction='row'
                  spacing={0.5}
                  sx={{ flexWrap: 'wrap', gap: 0.5, mb: 1 }}
              >
                {session.targets.map((target) => (
                    <Chip
                        key={target.id}
                        label={`${target.type}: ${target.value}`}
                        size='small'
                        variant='outlined'
                    />
                ))}
              </Stack>
          )}

          {formatTimestamp(session.startedAt) && (
              <Typography variant='caption' color='text.secondary'>
                Started: {formatTimestamp(session.startedAt)}
              </Typography>
          )}
          {formatTimestamp(session.finishedAt) && (
              <Typography variant='caption' color='text.secondary'>
                Finished: {formatTimestamp(session.finishedAt)}
              </Typography>
          )}
        </CardContent>

        <CardActions sx={{ justifyContent: 'space-between' }}>
          <Button
              startIcon={<InfoIcon/>}
              onClick={() => navigate(`/sessions/${session.id}`)}
          >
            Info
          </Button>
          <Button
              startIcon={<PlayArrowIcon/>}
              color='success'
              disabled={!canStart(session.status)}
              onClick={() => onStart(session.id)}
          >
            Start
          </Button>
          <Button
              startIcon={<StopIcon/>}
              color='error'
              disabled={!canStop(session.status)}
              onClick={() => onStop(session.id)}
          >
            Stop
          </Button>
        </CardActions>
      </Card>
  );
};

export default SessionCard;
