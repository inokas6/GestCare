import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/users/online - Buscar usuários online
export async function GET() {
    try {
        // Consideramos usuários que atualizaram seu status nos últimos 5 minutos como online
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        const onlineUsers = await prisma.users.findMany({
            where: {
                updated_at: {
                    gte: fiveMinutesAgo
                }
            },
            select: {
                id: true,
                name: true,
                foto_perfil: true
            }
        });

        return NextResponse.json(onlineUsers);
    } catch (error) {
        console.error('Erro ao buscar usuários online:', error);
        return NextResponse.json({ error: 'Erro ao buscar usuários online' }, { status: 500 });
    }
}

// POST /api/users/online - Atualizar status online do usuário
export async function POST() {
    try {
        const session = await getServerSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        // Atualiza o timestamp do usuário
        await prisma.users.update({
            where: {
                id: session.user.id
            },
            data: {
                updated_at: new Date()
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Erro ao atualizar status online:', error);
        return NextResponse.json({ error: 'Erro ao atualizar status online' }, { status: 500 });
    }
} 