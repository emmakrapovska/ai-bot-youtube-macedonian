import { Box, Chip, CircularProgress, Divider, Stack, Typography } from '@mui/material';
import { useParams } from 'react-router';
import useSessionDetails from '../../../../hooks/useSessionDetails.ts';
import SessionLogViewer from '../../../components/session/SessionLogViewer/SessionLogViewer.tsx';

/**
 * TODO(student): Show one session in detail: its targets, timestamps and the
 * live agentic-loop trace (SessionLogViewer + useSessionDetails).
 */
const formatTimestamp = (value: string | null) => {
    if (!value) return null;
    return new Date(value).toLocaleString();
};

const SessionDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const { session, logs, loading } = useSessionDetails(id!);

    if (loading && !session) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress/>
            </Box>
        );
    }

    if (!session) {
        return (
            <Typography color='text.secondary'>
                Session not found.
            </Typography>
        );
    }

    return (
        <Box>
            <Typography variant='h5' gutterBottom>
                Session #{id} — {session.socialNetwork}
            </Typography>

            <Chip label={session.status} size='small' sx={{ mb: 1 }}/>

            {session.description && (
                <Typography color='text.secondary' sx={{ mb: 1 }}>
                    {session.description}
                </Typography>
            )}

            <Stack direction='row' spacing={3} sx={{ mb: 2 }}>
                {formatTimestamp(session.startedAt) && (
                    <Typography variant='body2' color='text.secondary'>
                        Started: {formatTimestamp(session.startedAt)}
                    </Typography>
                )}
                {formatTimestamp(session.finishedAt) && (
                    <Typography variant='body2' color='text.secondary'>
                        Finished: {formatTimestamp(session.finishedAt)}
                    </Typography>
                )}
            </Stack>

            {session.targets.length > 0 && (
                <Box sx={{ mb: 2 }}>
                    <Typography variant='subtitle2' gutterBottom>Targets</Typography>
                    <Stack direction='row' spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                        {session.targets.map((target) => (
                            <Chip
                                key={target.id}
                                label={`${target.type}: ${target.value}`}
                                size='small'
                                variant='outlined'
                            />
                        ))}
                    </Stack>
                </Box>
            )}

            <Divider sx={{ mb: 2 }}/>

            <Typography variant='subtitle2' gutterBottom>Bot Action Trace</Typography>
            <SessionLogViewer logs={logs}/>
        </Box>
    );
};

export default SessionDetailsPage;
