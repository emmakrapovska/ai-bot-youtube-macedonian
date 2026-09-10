import { useCallback, useEffect, useState } from 'react';
import postApi from '../api/postApi.ts';
import type { PageResponse, PostFilter, PostResponse } from '../api/types/post.ts';

/**
 * TODO(student): Load a page of extracted posts (postApi.findAll) for the
 * PostsPage, re-fetching whenever the filter or page changes, with
 * loading/error state and a delete action (postApi.delete).
 */
const usePosts = (filter: PostFilter, page: number, size: number) => {
  const [posts, setPosts] = useState<PageResponse<PostResponse> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await postApi.findAll(filter, page, size);
      setPosts(response.data);
    } catch (err) {
      console.error('Failed to load posts.', err);
    } finally {
      setLoading(false);
    }
  }, [filter, page, size]);

  useEffect(() => {
    void fetchPosts();
  }, [fetchPosts]);

  const onDelete = async (id: number) => {
    try {
      await postApi.delete(id.toString());
      await fetchPosts();
    } catch (err) {
      console.error('Failed to delete post.', err);
    }
  };

  return { posts, loading, onDelete };
};

export default usePosts;
