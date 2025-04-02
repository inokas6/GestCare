'use client';

export default function PostList({ posts, totalPosts }) {
    if (!posts || posts.length === 0) {
        return (
            <div className="p-4">
                <p>Nenhum post encontrado.</p>
            </div>
        );
    }

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Posts ({totalPosts})</h2>
            <div className="space-y-4">
                {posts.map((post) => (
                    <div key={post.id} className="border rounded-lg p-4 shadow-sm">
                        <h3 className="text-xl font-semibold">{post.title}</h3>
                        <p className="text-gray-600 mt-2">{post.content}</p>
                        <p className="text-sm text-gray-500 mt-2">
                            {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
} 