import { Box, FormControlLabel, Slider, Switch, TextField, Typography } from '@mui/material';
import type { PostFilter } from '../../../../api/types/post.ts';

interface PostFiltersProps {
    filter: PostFilter;
    onChange: (filter: PostFilter) => void;
}

/**
 * TODO(student): Implement the filter bar for the content browser: session,
 * minimum Macedonian confidence (slider), donated yes/no, and a free-text
 * search over the content. Call onChange with the updated filter.
 */
const PostFilters = ({ filter, onChange }: PostFiltersProps) => {
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...filter, search: event.target.value || undefined });
    };

    const handleConfidenceChange = (_event: Event, value: number | number[]) => {
        const numericValue = Array.isArray(value) ? value[0] : value;
        onChange({ ...filter, minMacedonianConfidence: numericValue > 0 ? numericValue : undefined });
    };

    const handleDonatedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...filter, donated: event.target.checked ? true : undefined });
    };

    return (
        <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
                label='Search content'
                value={filter.search ?? ''}
                onChange={handleSearchChange}
                size='small'
                fullWidth
            />

            <Box sx={{ px: 1 }}>
                <Typography variant='body2' color='text.secondary' gutterBottom>
                    Minimum Macedonian confidence: {Math.round((filter.minMacedonianConfidence ?? 0) * 100)}%
                </Typography>
                <Slider
                    value={filter.minMacedonianConfidence ?? 0}
                    onChange={handleConfidenceChange}
                    min={0}
                    max={1}
                    step={0.1}
                    valueLabelDisplay='auto'
                    valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
                />
            </Box>

            <FormControlLabel
                control={
                    <Switch
                        checked={filter.donated === true}
                        onChange={handleDonatedChange}
                    />
                }
                label='Only donated posts'
            />
        </Box>
    );
};

export default PostFilters;