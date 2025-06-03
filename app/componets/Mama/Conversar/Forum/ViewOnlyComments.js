"use client";
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ViewOnlyComments({ topicoId, onDeleteComment, isDeleting }) {
    const [comentarios, setComentarios] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const supabase = createClientComponentClient();

    useEffect(() => {
        fetchComentarios();
    }, [topicoId]);

    const fetchComentarios = async () => {
        try {
            const { data, error } = await supabase
                .from('comentarios')
                .select(`
                    *,
                    users:user_id (id, nome, foto_perfil)
                `)
                .eq('topico_id', topicoId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setComentarios(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const formatarData = (dataString) => {
        if (!dataString) return '';
        return format(new Date(dataString), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {comentarios.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhum comentário ainda</p>
            ) : (
                comentarios.map((comentario) => (
                    <div key={comentario.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                                {comentario.users?.foto_perfil ? (
                                    <img 
                                        src={comentario.users.foto_perfil} 
                                        alt={comentario.users.nome} 
                                        className="h-8 w-8 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                                        <span className="text-purple-800 font-medium text-sm">
                                            {comentario.users?.nome?.charAt(0).toUpperCase() || '?'}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-800">
                                            {comentario.users?.nome}
                                        </span>
                                        <span className="text-gray-500 text-sm">
                                            {formatarData(comentario.created_at)}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => onDeleteComment(comentario.id)}
                                        disabled={isDeleting}
                                        className="text-gray-500 hover:text-red-600 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                                <p className="text-gray-700 whitespace-pre-line">
                                    {comentario.conteudo}
                                </p>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
} 