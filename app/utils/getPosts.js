export default async function getPosts() {
    try {
        // Aqui você deve implementar a lógica para buscar os posts do seu backend
        // Por enquanto, retornando dados de exemplo
        const posts = [
            {
                id: 1,
                title: "Exemplo de Post",
                content: "Conteúdo do post",
                createdAt: new Date().toISOString()
            }
        ];
        
        return {
            posts,
            count: posts.length
        };
    } catch (error) {
        console.error("Erro ao buscar posts:", error);
        return {
            posts: [],
            count: 0
        };
    }
} 