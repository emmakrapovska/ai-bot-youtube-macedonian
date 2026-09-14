import { Delete, OpenInNew } from '@mui/icons-material';
import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    Chip,
    IconButton,
    Typography
} from '@mui/material';
import { useNavigate } from 'react-router';
import type { PostResponse } from '../../../../api/types/post.ts';

interface PostCardProps {
    post: PostResponse;
    onDelete?: (id: number) => void;
}

/**
 * TODO(student): Show the extracted post: author, content preview, source
 * link, the Macedonian-language confidence, media thumbnails, and whether it
 * is already part of a donation batch. Add navigation to /posts/{id} and a
 * delete action (usePosts().onDelete).
 */

const PostCard = ({ post, onDelete }: PostCardProps) => {
    const navigate = useNavigate();

    const confidencePercent = post.macedonianConfidence != null
        ? Math.round(post.macedonianConfidence * 100)
        : null;

    const handleDelete = (event: React.MouseEvent) => {
        event.stopPropagation();
        onDelete?.(post.id);
    };

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardActionArea
                onClick={() => navigate(`/posts/${post.id}`)}
                sx={{ flexGrow: 1, alignItems: 'flex-start' }}
            >
                <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant='subtitle2'>
                            {post.authorHandle ?? 'unknown author'}
                        </Typography>
                        {onDelete && (
                            <IconButton size='small' onClick={handleDelete} aria-label='delete post'>
                                <Delete fontSize='small' />
                            </IconButton>
                        )}
                    </Box>

                    <Typography
                        variant='body2'
                        color='text.secondary'
                        sx={{
                            mt: 1,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}
                    >
                        {post.content ?? 'No content extracted.'}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                        {confidencePercent !== null && (
                            <Chip
                                size='small'
                                label={`${confidencePercent}% MK`}
                                color={confidencePercent >= 50 ? 'success' : 'default'}
                            />
                        )}
                        {post.donationBatchId && (
                            <Chip size='small' label='Donated' color='primary' variant='outlined' />
                        )}
                        {post.mediaItems.length > 0 && (
                            <Chip size='small' label={`${post.mediaItems.length} media`} variant='outlined' />
                        )}
                    </Box>

                    {post.sourceUrl && (
                        <Box sx={{ mt: 1 }}>
                            <IconButton
                                size='small'
                                component='a'
                                href={post.sourceUrl}
                                target='_blank'
                                rel='noopener noreferrer'
                                onClick={(event) => event.stopPropagation()}
                                aria-label='open source'
                            >
                                <OpenInNew fontSize='small' />
                            </IconButton>
                        </Box>
                    )}
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default PostCard;
