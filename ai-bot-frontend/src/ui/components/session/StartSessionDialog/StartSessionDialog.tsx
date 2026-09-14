import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    MenuItem,
    TextField
} from '@mui/material';
import type { CreateTargetRequest, TargetType } from '../../../../api/types/session.ts';
import useSessions from '../../../../hooks/useSessions.ts';

interface StartSessionDialogProps {
    open: boolean;
    onClose: () => void;
}

/**
 * TODO(student): Implement the "new extraction session" form: a select for
 * the social network (your assigned one), a description field, and a dynamic
 * list of targets (type + value). Submit it via useSessions().onCreate and
 * close the dialog on success.
 */
const TARGET_TYPES: TargetType[] = ['PROFILE', 'HASHTAG', 'KEYWORD', 'FEED_URL'];

const EMPTY_TARGET: CreateTargetRequest = { type: 'FEED_URL', value: '' };

const StartSessionDialog = ({ open, onClose }: StartSessionDialogProps) => {
    const { onCreate } = useSessions();

    const [description, setDescription] = useState('');
    const [targets, setTargets] = useState<CreateTargetRequest[]>([{ ...EMPTY_TARGET }]);
    const [submitting, setSubmitting] = useState(false);

    const handleAddTarget = () => {
        setTargets([...targets, { ...EMPTY_TARGET }]);
    };

    const handleRemoveTarget = (index: number) => {
        setTargets(targets.filter((_, i) => i !== index));
    };

    const handleTargetTypeChange = (index: number, type: TargetType) => {
        setTargets(targets.map((t, i) => (i === index ? { ...t, type } : t)));
    };

    const handleTargetValueChange = (index: number, value: string) => {
        setTargets(targets.map((t, i) => (i === index ? { ...t, value } : t)));
    };

    const resetForm = () => {
        setDescription('');
        setTargets([{ ...EMPTY_TARGET }]);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const isValid = description.trim() !== ''
        && targets.length > 0
        && targets.every((t) => t.value.trim() !== '');

    const handleSubmit = async () => {
        if (!isValid) return;

        setSubmitting(true);
        try {
            await onCreate({
                socialNetwork: 'YOUTUBE',
                description,
                targets
            });
            handleClose();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm'>
            <DialogTitle>New Extraction Session</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                <TextField
                    label='Description'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    fullWidth
                    size='small'
                />

                {targets.map((target, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <TextField
                            select
                            label='Type'
                            value={target.type}
                            onChange={(e) => handleTargetTypeChange(index, e.target.value as TargetType)}
                            size='small'
                            sx={{ minWidth: 140 }}
                        >
                            {TARGET_TYPES.map((type) => (
                                <MenuItem key={type} value={type}>{type}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label='Value'
                            value={target.value}
                            onChange={(e) => handleTargetValueChange(index, e.target.value)}
                            fullWidth
                            size='small'
                        />
                        <IconButton
                            onClick={() => handleRemoveTarget(index)}
                            disabled={targets.length === 1}
                            aria-label='remove target'
                        >
                            <DeleteIcon fontSize='small'/>
                        </IconButton>
                    </Box>
                ))}

                <Button startIcon={<AddIcon/>} onClick={handleAddTarget} sx={{ alignSelf: 'flex-start' }}>
                    Add target
                </Button>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button
                    variant='contained'
                    onClick={handleSubmit}
                    disabled={!isValid || submitting}
                >
                    Create
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default StartSessionDialog;
