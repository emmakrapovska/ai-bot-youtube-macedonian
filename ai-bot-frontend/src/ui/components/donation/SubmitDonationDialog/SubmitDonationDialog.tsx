import { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography
} from '@mui/material';
import postApi from '../../../../api/postApi.ts';
import type { PostResponse } from '../../../../api/types/post.ts';
import useDonations from '../../../../hooks/useDonations.ts';

interface SubmitDonationDialogProps {
    open: boolean;
    onClose: () => void;
}

/**
 * TODO(student): Implement the "create donation batch" flow: let the user
 * pick not-yet-donated posts (postApi.findAll with donated=false), review
 * their content, and create the batch via useDonations().onCreate.
 */
const SubmitDonationDialog = ({ open, onClose }: SubmitDonationDialogProps) => {
    const { onCreate } = useDonations();

    const [posts, setPosts] = useState<PostResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!open) return;

        const loadPosts = async () => {
            setLoading(true);
            try {
                const response = await postApi.findAll({ donated: false }, 0, 50);
                setPosts(response.data.content);
            } catch (err) {
                console.error('Failed to load undonated posts.', err);
            } finally {
                setLoading(false);
            }
        };

        void loadPosts();
        setSelectedIds([]);
    }, [open]);

    const toggleSelected = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id]
        );
    };

    const handleSubmit = async () => {
        if (selectedIds.length === 0) return;

        setSubmitting(true);
        try {
            await onCreate({ postIds: selectedIds });
            onClose();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth='md'>
            <DialogTitle>New Donation Batch</DialogTitle>
            <DialogContent>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress/>
                    </Box>
                ) : posts.length === 0 ? (
                    <Typography color='text.secondary'>
                        No undonated posts available.
                    </Typography>
                ) : (
                    <List dense>
                        {posts.map((post) => (
                            <ListItem key={post.id} disablePadding>
                                <ListItemButton onClick={() => toggleSelected(post.id)}>
                                    <ListItemIcon>
                                        <Checkbox
                                            edge='start'
                                            checked={selectedIds.includes(post.id)}
                                            tabIndex={-1}
                                            disableRipple
                                        />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={post.authorHandle ?? 'unknown author'}
                                        secondary={post.content?.slice(0, 120) ?? 'No content'}
                                        slotProps={{
                                            secondary: { sx: { wordBreak: 'break-word' } }
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    variant='contained'
                    onClick={handleSubmit}
                    disabled={selectedIds.length === 0 || submitting}
                >
                    Create Batch ({selectedIds.length})
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SubmitDonationDialog;
