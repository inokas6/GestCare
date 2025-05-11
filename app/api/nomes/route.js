import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const nome = searchParams.get('nome');

    if (!nome) {
        return NextResponse.json(
            { error: 'Nome não informado' },
            { status: 400 }
        );
    }

    try {
        console.log('Buscando nome:', nome);

        const response = await fetch(
            `https://www.behindthename.com/api/lookup.json?name=${encodeURIComponent(nome)}&key=in177596553&exact=yes`,
            {
                headers: {
                    'Accept': 'application/json',
                },
            }
        );

        console.log('Status da resposta:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erro na API:', errorText);
            throw new Error(`API externa retornou status ${response.status}`);
        }

        const data = await response.json();
        console.log('Dados recebidos:', data);
        
        if (!data || (Array.isArray(data) && data.length === 0)) {
            return NextResponse.json(
                { error: 'Nome não encontrado' },
                { status: 404 }
            );
        }

        let significado = '';
        if (Array.isArray(data)) {
            const nomeInfo = data.find(item => 
                item.name && item.name.toLowerCase() === nome.toLowerCase()
            );
            if (nomeInfo) {
                significado = nomeInfo.meaning || nomeInfo.info?.meaning || 'Significado não disponível';
            }
        } else if (data.meaning) {
            significado = data.meaning;
        }

        if (!significado) {
            return NextResponse.json(
                { error: 'Significado não encontrado para este nome' },
                { status: 404 }
            );
        }

        return NextResponse.json({ meaning: significado });
    } catch (error) {
        console.error('Erro ao buscar nome:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar nome: ' + error.message },
            { status: 500 }
        );
    }
} 