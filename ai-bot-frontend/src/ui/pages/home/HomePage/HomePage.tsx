import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  Chip,
  Stack,
} from '@mui/material';
import usePosts from '../../../../hooks/usePosts.ts';
import useDonations from '../../../../hooks/useDonations.ts';
import useSessions from '../../../../hooks/useSessions.ts';

/**
 * TODO(student): Turn this into a small dashboard: total extracted posts,
 * posts above your Macedonian-confidence threshold, donated pages, and the
 * status of the latest extraction session.
 */
const HomePage = () => {
  const { posts, loading: postsLoading } = usePosts({}, 0, 1000);
  const { donations, loading: donationsLoading } = useDonations();
  const { sessions, loading: sessionsLoading } = useSessions();

  const loading =
    postsLoading || donationsLoading || sessionsLoading;

  const extractedPosts = posts?.content ?? [];

  const macedonianPosts = extractedPosts.filter(
    (post) =>
      post.macedonianConfidence !== null &&
      post.macedonianConfidence >= 0.8
  ).length;

  const donatedPosts = donations.reduce(
    (sum, donation) => sum + donation.postIds.length,
    0
  );

  const latestSession =
    sessions.length > 0
      ? [...sessions].sort((a, b) => {
          const dateA = a.startedAt
            ? new Date(a.startedAt).getTime()
            : 0;

          const dateB = b.startedAt
            ? new Date(b.startedAt).getTime()
            : 0;

          return dateB - dateA;
        })[0]
      : null;

  return (
    <Box sx={{ m: 0, p: 0 }}>
      <Container maxWidth='xl' sx={{ mt: 3, py: 3 }}>
        <Typography variant='h4' gutterBottom>
          AI Bot for doniraj.vezilka.ai 🤖
        </Typography>

        <Typography variant='body1' sx={{ mb: 4 }}>
          This bot navigates a social network, extracts Macedonian content
          and donates it to the Vezilka language-preservation platform.
          Use the Sessions page to run the bot, the Posts page to browse
          what it collected, and the Donations page to review and submit
          batches.
        </Typography>

        {loading ? (
          <Typography color='text.secondary'>
            Loading dashboard...
          </Typography>
        ) : (
          <>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      gutterBottom
                    >
                      Total Extracted Posts
                    </Typography>

                    <Typography variant='h4'>
                      {posts?.totalElements ?? extractedPosts.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      gutterBottom
                    >
                      Macedonian ≥ 80%
                    </Typography>

                    <Typography variant='h4'>
                      {macedonianPosts}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      gutterBottom
                    >
                      Donated Posts
                    </Typography>

                    <Typography variant='h4'>
                      {donatedPosts}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      gutterBottom
                    >
                      Extraction Sessions
                    </Typography>

                    <Typography variant='h4'>
                      {sessions.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Latest Extraction Session
                </Typography>

                {!latestSession ? (
                  <Typography color='text.secondary'>
                    No extraction sessions yet.
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    <Stack
                        sx={{ display: 'flex', alignItems: 'center', gap: 1, }}>
                      <Typography>
                        Session #{latestSession.id}
                      </Typography>

                      <Chip
                        label={latestSession.status}
                        size='small'
                      />
                    </Stack>

                    <Typography
                      variant='body2'
                      color='text.secondary'
                    >
                      Network: {latestSession.socialNetwork}
                    </Typography>

                    {latestSession.description && (
                      <Typography
                        variant='body2'
                        color='text.secondary'
                      >
                        {latestSession.description}
                      </Typography>
                    )}

                    {latestSession.startedAt && (
                      <Typography
                        variant='body2'
                        color='text.secondary'
                      >
                        Started:{' '}
                        {new Date(
                          latestSession.startedAt
                        ).toLocaleString()}
                      </Typography>
                    )}

                    {latestSession.finishedAt && (
                      <Typography
                        variant='body2'
                        color='text.secondary'
                      >
                        Finished:{' '}
                        {new Date(
                          latestSession.finishedAt
                        ).toLocaleString()}
                      </Typography>
                    )}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </Container>
    </Box>
  );
};

export default HomePage;
