import {
    Box,
    Chip,
    CircularProgress,
    Divider,
    Link,
    Stack,
    Typography,
} from '@mui/material';
import {useEffect, useState} from 'react';
import {useParams} from 'react-router';
import postApi from '../../../../api/postApi.ts';
import type {PostResponse} from '../../../../api/types/post.ts';

/**
 * TODO(student): Show one extracted post in full: the complete content, its
 * media items (images/videos), the source link, the language confidence and
 * its donation status (postApi.findById).
 */
const formatTimestamp = (value: string | null) => {
    if (!value) return null;

    return new Date(value).toLocaleString();
};

const PostDetailsPage = () => {
    const {id} = useParams<{ id: string }>();

    const [post, setPost] = useState<PostResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchPost = async () => {
            if (!id) return;

            setLoading(true);

            try {
                const response = await postApi.findById(id);
                setPost(response.data);
            } catch (err) {
                console.error('Failed to load post.', err);
                setPost(null);
            } finally {
                setLoading(false);
            }
        };

        void fetchPost();
    }, [id]);

    if (loading) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}>
                <CircularProgress/>
            </Box>
        );
    }

    if (!post) {
        return (
            <Typography color='text.secondary'>
                Post not found.
            </Typography>
        );
    }

    return (
        <Box>
            <Typography variant='h5' gutterBottom>
                Post #{post.id}
            </Typography>

            <Stack
                direction='row'
                spacing={1}
                sx={{mb: 2, flexWrap: 'wrap', gap: 1}}
            >
                <Chip
                    label={post.socialNetwork}
                    size='small'
                />

                {post.donationBatchId !== null && (
                    <Chip
                        label={`Donated · Batch #${post.donationBatchId}`}
                        size='small'
                        color='success'
                        variant='outlined'
                    />
                )}

                {post.donationBatchId === null && (
                    <Chip
                        label='Not donated'
                        size='small'
                        variant='outlined'
                    />
                )}
            </Stack>

            {post.authorHandle && (
                <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{mb: 1}}
                >
                    Author: {post.authorHandle}
                </Typography>
            )}

            {formatTimestamp(post.postedAt) && (
                <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{mb: 2}}
                >
                    Posted: {formatTimestamp(post.postedAt)}
                </Typography>
            )}

            <Divider sx={{mb: 2}}/>

            <Typography variant='subtitle2' gutterBottom>
                Content
            </Typography>

            <Typography
                variant='body1'
                sx={{
                    whiteSpace: 'pre-wrap',
                    mb: 3,
                }}
            >
                {post.content || 'No content available.'}
            </Typography>

            {post.sourceUrl && (
                <Box sx={{mb: 3}}>
                    <Typography variant='subtitle2' gutterBottom>
                        Source
                    </Typography>

                    <Link
                        href={post.sourceUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                    >
                        {post.sourceUrl}
                    </Link>
                </Box>
            )}

            <Box sx={{mb: 3}}>
                <Typography variant='subtitle2' gutterBottom>
                    Macedonian Language Confidence
                </Typography>

                {post.macedonianConfidence !== null ? (
                    <Typography variant='body1'>
                        {(post.macedonianConfidence * 100).toFixed(1)}%
                    </Typography>
                ) : (
                    <Typography color='text.secondary'>
                        No confidence score available.
                    </Typography>
                )}
            </Box>

            {post.mediaItems.length > 0 && (
                <Box sx={{mb: 3}}>
                    <Typography variant='subtitle2' gutterBottom>
                        Media
                    </Typography>

                    <Stack spacing={2}>
                        {post.mediaItems.map((media) => (
                            <Box key={media.id}>
                                {media.type === 'IMAGE' ? (
                                    <Box
                                        component='img'
                                        src={media.sourceUrl}
                                        alt='Post media'
                                        sx={{
                                            display: 'block',
                                            maxWidth: '100%',
                                            maxHeight: 500,
                                            objectFit: 'contain',
                                            borderRadius: 2,
                                        }}
                                    />
                                ) : (
                                    <Box
                                        component='video'
                                        src={media.sourceUrl}
                                        controls
                                        sx={{
                                            display: 'block',
                                            maxWidth: '100%',
                                            maxHeight: 500,
                                            borderRadius: 2,
                                        }}
                                    />
                                )}
                            </Box>
                        ))}
                    </Stack>
                </Box>
            )}

            {post.externalId && (
                <Typography variant='body2' color='text.secondary'>
                    External ID: {post.externalId}
                </Typography>
            )}

            <Typography variant='body2' color='text.secondary'>
                Session ID: {post.sessionId}
            </Typography>
        </Box>
    );
};

export default PostDetailsPage;
