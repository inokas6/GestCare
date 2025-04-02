import PostList from '@/components/PostList';
import getPosts from '@/utils/getPosts';

export default async function Home() {
    const {posts, count} = await getPosts();

    return (
        <PostList posts={posts} totalPosts={count}></PostList>
    )
}
