import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import {
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography
} from '@mui/material';
import type { BotActionLogResponse } from '../../../../api/types/session.ts';

interface SessionLogViewerProps {
    logs: BotActionLogResponse[];
}

/**
 * TODO(student): Render the agentic-loop trace: one row per action with its
 * type, details, success indicator and timestamp — the live view of what
 * your bot is doing during a session.
 */
const formatTimestamp = (value: string) => new Date(value).toLocaleTimeString();

const SessionLogViewer = ({ logs }: SessionLogViewerProps) => {
    if (logs.length === 0) {
        return (
            <Typography color='text.secondary'>
                No actions logged yet.
            </Typography>
        );
    }

    return (
        <List dense>
            {logs.map((log) => (
                <ListItem key={log.id} divider>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                        {log.successful
                            ? <CheckCircleIcon color='success' fontSize='small'/>
                            : <ErrorIcon color='error' fontSize='small'/>}
                    </ListItemIcon>
                    <ListItemText
                        primary={`${log.actionType} — ${formatTimestamp(log.occurredAt)}`}
                        secondary={log.details ?? undefined}
                        slotProps={{
                            secondary: { sx: { wordBreak: 'break-word' } }
                        }}
                    />
                </ListItem>
            ))}
        </List>
    );
};

export default SessionLogViewer;
