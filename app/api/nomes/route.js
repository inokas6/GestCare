const significadosNomes = {
  'miguel': 'Significa "quem é como Deus" ou "semelhante a Deus".',
  'sofia': 'Significa "sabedoria" ou "conhecimento".',
  'gabriel': 'Significa "homem de Deus" ou "mensageiro de Deus".',
  'isabella': 'Significa "promessa de Deus" ou "juramento de Deus".',
  'lucas': 'Significa "luminoso" ou "iluminado".',
  'maria': 'Significa "senhora soberana" ou "a pura".',
  'arthur': 'Significa "urso" ou "forte como um urso".',
  'alice': 'Significa "de linhagem nobre" ou "verdade".',
  'pedro': 'Significa "pedra" ou "rocha".',
  'laura': 'Significa "loureiro" ou "coroa de louros".',
  'joão': 'Significa "Deus é gracioso" ou "agraciado por Deus".',
  'beatriz': 'Significa "aquela que traz felicidade" ou "viajante".',
  'matheus': 'Significa "dom de Deus" ou "presente de Deus".',
  'júlia': 'Significa "jovem" ou "cheia de juventude".',
  'davi': 'Significa "amado" ou "querido".',
  'valentina': 'Significa "forte" ou "saudável".',
  'enzo': 'Significa "senhor da casa" ou "proprietário".',
  'manuela': 'Significa "Deus está conosco" ou "Deus está presente".',
  'benjamin': 'Significa "filho da mão direita" ou "filho da felicidade".',
  'cecilia': 'Significa "cega" ou "aquela que não vê".',
  'samuel': 'Significa "nome de Deus" ou "Deus ouviu".',
  'helena': 'Significa "tocha" ou "luz".',
  'rafael': 'Significa "Deus curou" ou "curado por Deus".',
  'lara': 'Significa "proteção" ou "refúgio".',
  'daniel': 'Significa "Deus é meu juiz" ou "justiça de Deus".',
  'mariana': 'Significa "combinação de Maria e Ana" ou "graça de Deus".',
  'leonardo': 'Significa "leão forte" ou "forte como um leão".',
  'isabela': 'Significa "promessa de Deus" ou "juramento de Deus".',
  'theo': 'Significa "dom de Deus" ou "presente de Deus".',
  'lorena': 'Significa "coroa de louros" ou "vitória".',
  'tiago': 'Significa "aquele que vem de Jacó" ou "suplantador".',
  'carolina': 'Significa "mulher livre" ou "forte".',
  'francisco': 'Significa "francês" ou "livre".',
  'margarida': 'Significa "pérola" ou "flor de margarida".',
  'antonio': 'Significa "inestimável" ou "de valor incalculável".',
  'catarina': 'Significa "pura" ou "casta".',
  'jose': 'Significa "Deus acrescenta" ou "que o Senhor acrescente".',
  'ana': 'Significa "graça" ou "favor".',
  'duarte': 'Significa "guardião rico" ou "protetor da riqueza".',
  'ines': 'Significa "pura" ou "casta".',
  'inês': 'Significa "pura" ou "casta".',
  'afonso': 'Significa "nobre e pronto" ou "guerreiro preparado".',
  'constança': 'Significa "constante" ou "firme".',
  'joaquim': 'Significa "Deus estabelecerá" ou "aquele que Deus estabelece".',
  'teresa': 'Significa "caçadora" ou "verão".',
  'nuno': 'Significa "nono" ou "o nono filho".',
  'madalena': 'Significa "da cidade de Magdala" ou "torre".',
  'vasco': 'Significa "corvo" ou "pássaro".',
  'henrique': 'Significa "senhor do lar" ou "governante da casa".',
  'juliana': 'Significa "jovem" ou "cheia de juventude".',
  'fernando': 'Significa "atrevido para a paz" ou "ousado para a paz".',
  'manuel': 'Significa "Deus está conosco" ou "Deus está presente".',
  'isabel': 'Significa "promessa de Deus" ou "juramento de Deus".',
  'filipe': 'Significa "amigo dos cavalos" ou "amante dos cavalos".',
  'antónio': 'Significa "inestimável" ou "de valor incalculável".',
  'luís': 'Significa "guerreiro famoso" ou "combatente glorioso".',
  'sara': 'Significa "princesa" ou "senhora".',
  'tomás': 'Significa "gêmeo" ou "duplo".',
  'marta': 'Significa "senhora" ou "dona da casa".',
  'rodrigo': 'Significa "famoso pelo poder" ou "governante famoso".',
  'clara': 'Significa "clara" ou "brilhante".',
  'guilherme': 'Significa "protetor decidido" ou "guardião determinado".',
  'raquel': 'Significa "ovelha" ou "cordeiro".',
  'diogo': 'Significa "aquele que ensina" ou "mestre".',
  'lurdes': 'Significa "referência a Nossa Senhora de Lourdes".',
  'rui': 'Significa "famoso" ou "glorioso".',
  'mónica': 'Significa "única" ou "sozinha".',
  'bruno': 'Significa "marrom" ou "escuro".',
  'patrícia': 'Significa "nobre" ou "de linhagem nobre".',
  'hugo': 'Significa "inteligente" ou "espírito".',
  'cristina': 'Significa "seguidora de Cristo" ou "cristã".',
  'eduardo': 'Significa "guardião da riqueza" ou "protetor da fortuna".',
  'susana': 'Significa "lírio" ou "flor de lírio".',
  'marcos': 'Significa "consagrado ao deus Marte" ou "guerreiro".',
  'rita': 'Significa "pérola" ou "preciosa".',
  'simão': 'Significa "aquele que ouve" ou "que escuta".',
  'rosa': 'Significa "rosa" ou "flor".',
  'paulo': 'Significa "pequeno" ou "de baixa estatura".',
  'alexandra': 'Significa "protetora da humanidade" ou "defensora dos homens".',
  'carlos': 'Significa "homem livre" ou "homem do povo".',
  'diana': 'Significa "divina" ou "celestial".',
  'elena': 'Significa "tocha" ou "luz".',
  'gonçalo': 'Significa "batalha" ou "combate".',
  'lídia': 'Significa "da Lídia" ou "da Ásia Menor".',
  'mário': 'Significa "homem" ou "masculino".',
  'nádia': 'Significa "esperança" ou "esperançosa".',
  'otávio': 'Significa "oitavo" ou "o oitavo filho".',
  'paula': 'Significa "pequena" ou "de baixa estatura".',
  'quitéria': 'Significa "pura" ou "casta".',
  'raul': 'Significa "conselho do lobo" ou "sábio como um lobo".',
  'sandra': 'Significa "protetora da humanidade" ou "defensora dos homens".',
  'telma': 'Significa "vontade" ou "determinação".',
  'ulisses': 'Significa "irritado" ou "zangado".',
  'vanda': 'Significa "eslava" ou "da Eslavônia".',
  'xavier': 'Significa "nova casa" ou "casa nova".',
  'yara': 'Significa "senhora das águas" ou "mãe d\'água".',
  'zé': 'Significa "Deus acrescenta" ou "que o Senhor acrescente".',
  'adriana': 'Significa "da cidade de Adria" ou "do mar Adriático".',
  'bernardo': 'Significa "forte como um urso" ou "urso corajoso".',
  'carmo': 'Significa "jardim" ou "vinha".',
  'dulce': 'Significa "doce" ou "suave".',
  'elisa': 'Significa "Deus é juramento" ou "promessa de Deus".',
  'fátima': 'Significa "referência a Nossa Senhora de Fátima".',
  'gabriela': 'Significa "mulher de Deus" ou "mensageira de Deus".',
  'horácio': 'Significa "aquele que tem boa visão" ou "que vê bem".',
  'ivone': 'Significa "teixo" ou "árvore sagrada".',
  'jéssica': 'Significa "rica" ou "abastada".',
  'kátia': 'Significa "pura" ou "casta".',
  'leonor': 'Significa "luz" ou "brilho".',
  'marcelo': 'Significa "pequeno guerreiro" ou "jovem guerreiro".',
  'nelson': 'Significa "filho de Neil" ou "campeão".',
  'olívia': 'Significa "oliveira" ou "paz".',
  'palmira': 'Significa "cidade das palmeiras" ou "palmeira".',
  'quim': 'Significa "Deus estabelecerá" ou "aquele que Deus estabelece".',
  'romana': 'Significa "de Roma" ou "romana".',
  'sílvia': 'Significa "da floresta" ou "selvagem".',
  'tânia': 'Significa "rainha das fadas" ou "fada".',
  'úrsula': 'Significa "pequena ursa" ou "urso".',
  'valter': 'Significa "governante do exército" ou "comandante".',
  'wilson': 'Significa "filho de William" ou "filho do guerreiro".',
  'xénia': 'Significa "estrangeira" ou "hospitaleira".',
  'yolanda': 'Significa "violeta" ou "flor roxa".',
  'zacarias': 'Significa "Deus se lembrou" ou "lembrado por Deus".',
  'adelaide': 'Significa "de linhagem nobre" ou "nobre".',
  'baltazar': 'Significa "proteja o rei" ou "guardião do rei".',
  'celeste': 'Significa "celestial" ou "do céu".',
  'damião': 'Significa "domador" ou "aquele que doma".',
  'eugénia': 'Significa "bem nascida" ou "de boa linhagem".',
  'florinda': 'Significa "flor" ou "florescente".',
  'gertrudes': 'Significa "lança forte" ou "fortaleza".',
  'herculano': 'Significa "consagrado a Hércules" ou "forte".',
  'ilídio': 'Significa "do sol" ou "solar".',
  'jordão': 'Significa "que desce" ou "rio que flui".',
  'kelly': 'Significa "guerreira" ou "combatente".',
  'lídio': 'Significa "da Lídia" ou "da Ásia Menor".',
  'máximo': 'Significa "o maior" ou "máximo".',
  'narciso': 'Significa "sono" ou "entorpecimento".',
  'olavo': 'Significa "herança dos ancestrais" ou "legado".',
  'pandora': 'Significa "todos os dons" ou "presentes".',
  'quintino': 'Significa "quinto" ou "o quinto filho".',
  'romualdo': 'Significa "glória de Roma" ou "famoso em Roma".',
  'sabrina': 'Significa "do rio Severn" ou "fronteira".',
  'taciano': 'Significa "silencioso" ou "calado".',
  'urbano': 'Significa "da cidade" ou "civilizado".',
  'viriato': 'Significa "homem" ou "viril".',
  'wanda': 'Significa "eslava" ou "da Eslavônia".',
  'xisto': 'Significa "polido" ou "liso".',
  'yara': 'Significa "senhora das águas" ou "mãe d\'água".',
  'mafalda': 'Significa "poderosa em batalha" ou "forte na guerra".',
  'alves': 'Significa "filho de Álvaro" ou "guardião de todos".',
  'ruben': 'Significa "eis um filho" ou "veja, um filho".',
  'antonia': 'Significa "inestimável" ou "de valor incalculável".',
  'jorge': 'Significa "agricultor" ou "trabalhador da terra".',
  'henriete': 'Significa "senhora do lar" ou "governante da casa".',
  'hélia': 'Significa "do sol" ou "solar".',
  'hélder': 'Significa "guerreiro glorioso" ou "combatente famoso".',
  'mirene': 'Significa "paz" ou "tranquilidade".',
  'marília': 'Significa "combinação de Maria e Lília" ou "graça e pureza".',
  'luz': 'Significa "luz" ou "iluminação".',
  'monteiro': 'Significa "morador do monte" ou "habitante da montanha".',
  'freitas': 'Significa "pedras soltas" ou "terreno pedregoso".',
  'miranda': 'Significa "admirável" ou "digna de admiração".',
  'rodrigues': 'Significa "filho de Rodrigo" ou "descendente do governante famoso".',
  
  // Nomes adicionais muito comuns em Portugal
  'adriano': 'Significa "da cidade de Adria" ou "do mar Adriático".',
  'alberto': 'Significa "nobre e brilhante" ou "ilustre".',
  'alexandre': 'Significa "protetor da humanidade" ou "defensor dos homens".',
  'andré': 'Significa "homem" ou "masculino".',
  'augusto': 'Significa "venerável" ou "sagrado".',
  'caetano': 'Significa "da cidade de Gaeta" ou "italiano".',
  'camilo': 'Significa "nascido de pais livres" ou "nobre".',
  'césar': 'Significa "cabeludo" ou "de cabelo longo".',
  'cláudio': 'Significa "coxo" ou "manco".',
  'cristiano': 'Significa "seguidor de Cristo" ou "cristão".',
  'diego': 'Significa "aquele que ensina" ou "mestre".',
  'domingos': 'Significa "do Senhor" ou "consagrado ao Senhor".',
  'elias': 'Significa "meu Deus é Javé" ou "Deus é o Senhor".',
  'ernesto': 'Significa "sério" ou "determinado".',
  'estêvão': 'Significa "coroa" ou "guirlanda".',
  'fábio': 'Significa "feijão" ou "cultivador de feijão".',
  'felix': 'Significa "feliz" ou "afortunado".',
  'flávio': 'Significa "louro" ou "de cabelo amarelo".',
  'frederico': 'Significa "pacificador" ou "governante da paz".',
  'gaspar': 'Significa "tesoureiro" ou "guardião do tesouro".',
  'geraldo': 'Significa "governante com lança" ou "guerreiro".',
  'gilberto': 'Significa "brilhante promessa" ou "juramento brilhante".',
  'gustavo': 'Significa "conselho do deus" ou "sábio".',
  'heitor': 'Significa "aquele que segura" ou "que mantém".',
  'igor': 'Significa "guerreiro" ou "combatente".',
  'isaac': 'Significa "ele ri" ou "que ri".',
  'isidoro': 'Significa "dom de Ísis" ou "presente da deusa".',
  'ivo': 'Significa "teixo" ou "árvore sagrada".',
  'jacinto': 'Significa "flor de jacinto" ou "azul".',
  'jacob': 'Significa "suplantador" ou "que segura pelo calcanhar".',
  'jair': 'Significa "ele ilumina" ou "que brilha".',
  'justino': 'Significa "justo" ou "equitativo".',
  'leandro': 'Significa "leão homem" ou "homem leão".',
  'lino': 'Significa "linho" ou "tecido de linho".',
  'lorenzo': 'Significa "de Laurento" ou "coroado de louros".',
  'mateus': 'Significa "dom de Deus" ou "presente de Deus".',
  'matias': 'Significa "dom de Deus" ou "presente de Deus".',
  'mauro': 'Significa "mouro" ou "escuro".',
  'maximiano': 'Significa "o maior" ou "máximo".',
  'nicolau': 'Significa "vitória do povo" ou "conquistador do povo".',
  'octávio': 'Significa "oitavo" ou "o oitavo filho".',
  'orlando': 'Significa "terra famosa" ou "glória da terra".',
  'osvaldo': 'Significa "poder divino" ou "governante divino".',
  'renato': 'Significa "renascido" ou "nascido novamente".',
  'ricardo': 'Significa "governante forte" ou "poderoso".',
  'roberto': 'Significa "fama brilhante" ou "glória brilhante".',
  'salvador': 'Significa "salvador" ou "aquele que salva".',
  'sebastião': 'Significa "venerável" ou "respeitável".',
  'serafim': 'Significa "ardente" ou "queimando".',
  'sérgio': 'Significa "servo" ou "escravo".',
  'teodoro': 'Significa "dom de Deus" ou "presente de Deus".',
  'valentim': 'Significa "forte" ou "saudável".',
  
  // Nomes femininos adicionais muito comuns em Portugal
  'agata': 'Significa "boa" ou "virtuosa".',
  'agnes': 'Significa "pura" ou "casta".',
  'alba': 'Significa "alba" ou "amanhecer".',
  'alberta': 'Significa "nobre e brilhante" ou "ilustre".',
  'alexandrina': 'Significa "protetora da humanidade" ou "defensora dos homens".',
  'alfonsina': 'Significa "nobre e pronta" ou "guerreira preparada".',
  'almira': 'Significa "princesa" ou "nobre".',
  'amalia': 'Significa "trabalho" ou "esforço".',
  'amelia': 'Significa "trabalho" ou "esforço".',
  'anabela': 'Significa "graça" ou "favor".',
  'andrea': 'Significa "mulher" ou "feminina".',
  'angela': 'Significa "mensageira" ou "anjo".',
  'angelina': 'Significa "pequena mensageira" ou "pequeno anjo".',
  'apolonia': 'Significa "consagrada a Apolo" ou "solar".',
  'augusta': 'Significa "venerável" ou "sagrada".',
  'aurora': 'Significa "amanhecer" ou "alvorada".',
  'benedita': 'Significa "abençoada" ou "bendita".',
  'berenice': 'Significa "que traz a vitória" ou "portadora da vitória".',
  'bernardina': 'Significa "forte como uma ursa" ou "ursa corajosa".',
  'berta': 'Significa "brilhante" ou "ilustre".',
  'bianca': 'Significa "branca" ou "pura".',
  'brigida': 'Significa "exaltada" ou "elevada".',
  'camila': 'Significa "nascida de pais livres" ou "nobre".',
  'candida': 'Significa "branca" ou "pura".',
  'carla': 'Significa "mulher livre" ou "mulher do povo".',
  'carmelita': 'Significa "do monte Carmelo" ou "jardim".',
  'celia': 'Significa "celestial" ou "do céu".',
  'cintia': 'Significa "do monte Cinto" ou "lunar".',
  'claudia': 'Significa "coxo" ou "manco".',
  'clementina': 'Significa "clemente" ou "misericordiosa".',
  'dolores': 'Significa "dores" ou "sofrimento".',
  'domingas': 'Significa "do Senhor" ou "consagrada ao Senhor".',
  'edite': 'Significa "riqueza" ou "prosperidade".',
  'elvira': 'Significa "verdadeira" ou "autêntica".',
  'emilia': 'Significa "rival" ou "competidora".',
  'estela': 'Significa "estrela" ou "brilhante".',
  'eugenia': 'Significa "bem nascida" ou "de boa linhagem".',
  'eunice': 'Significa "boa vitória" ou "vitória feliz".',
  'eva': 'Significa "vida" ou "vivente".',
  'felicidade': 'Significa "felicidade" ou "alegria".',
  'felipa': 'Significa "amiga dos cavalos" ou "amante dos cavalos".',
  'fernanda': 'Significa "atrevida para a paz" ou "ousada para a paz".',
  'francisca': 'Significa "francesa" ou "livre".',
  'gloria': 'Significa "glória" ou "honra".',
  'graca': 'Significa "graça" ou "favor".',
  'graça': 'Significa "graça" ou "favor".',
  'henrieta': 'Significa "senhora do lar" ou "governante da casa".',
  'hermínia': 'Significa "mensageira" ou "intérprete".',
  'iria': 'Significa "paz" ou "tranquilidade".',
  'jacqueline': 'Significa "que suplanta" ou "substitui".',
  'joana': 'Significa "Deus é gracioso" ou "agraciada por Deus".',
  'josefa': 'Significa "Deus acrescenta" ou "que o Senhor acrescente".',
  'josefina': 'Significa "Deus acrescenta" ou "que o Senhor acrescente".',
  'julia': 'Significa "jovem" ou "cheia de juventude".',
  'julieta': 'Significa "jovem" ou "cheia de juventude".',
  'jussara': 'Significa "senhora das águas" ou "mãe d\'água".',
  'lidia': 'Significa "da Lídia" ou "da Ásia Menor".',
  'luzia': 'Significa "luz" ou "iluminação".',
  'marcela': 'Significa "pequena guerreira" ou "jovem guerreira".',
  'marina': 'Significa "do mar" ou "marinha".',
  'matilde': 'Significa "forte em batalha" ou "guerreira poderosa".',
  'mauricia': 'Significa "moura" ou "escura".',
  'micaela': 'Significa "quem é como Deus" ou "semelhante a Deus".',
  'miguelina': 'Significa "quem é como Deus" ou "semelhante a Deus".',
  'monica': 'Significa "única" ou "sozinha".',
  'natalia': 'Significa "natal" ou "nascimento".',
  'natercia': 'Significa "nascida no Natal" ou "natalina".',
  'nazare': 'Significa "de Nazaré" ou "nazarena".',
  'nicole': 'Significa "vitória do povo" ou "conquistadora do povo".',
  'nina': 'Significa "pequena" ou "menina".',
  'noemia': 'Significa "agradável" ou "deliciosa".',
  'nuria': 'Significa "luz" ou "brilho".',
  'odete': 'Significa "riqueza" ou "prosperidade".',
  'odilia': 'Significa "riqueza" ou "prosperidade".',
  'olga': 'Significa "santa" ou "sagrada".',
  'olimpia': 'Significa "do Olimpo" ou "celestial".',
  'otilia': 'Significa "riqueza" ou "prosperidade".',
  'paulina': 'Significa "pequena" ou "de baixa estatura".',
  'patricia': 'Significa "nobre" ou "de linhagem nobre".',
  'perpetua': 'Significa "perpétua" ou "eterna".',
  'petronila': 'Significa "pedra" ou "rocha".',
  'piedade': 'Significa "piedade" ou "compaixão".',
  'regina': 'Significa "rainha" ou "soberana".',
  'renata': 'Significa "renascida" ou "nascida novamente".',
  'rosalia': 'Significa "rosa" ou "flor".',
  'rosalina': 'Significa "pequena rosa" ou "florzinha".',
  'rosario': 'Significa "rosário" ou "coroa de rosas".',
  'serafina': 'Significa "ardente" ou "queimando".',
  'sonia': 'Significa "sabedoria" ou "conhecimento".',
  'tomasia': 'Significa "gêmea" ou "dupla".',
  'ursula': 'Significa "pequena ursa" ou "urso".',
  'vera': 'Significa "verdade" ou "autêntica".',
  'veronica': 'Significa "verdadeira imagem" ou "imagem autêntica".',
  'victoria': 'Significa "vitória" ou "triunfo".',
  'violeta': 'Significa "violeta" ou "flor roxa".',
  'virginia': 'Significa "virgem" ou "pura".',
  'vitoria': 'Significa "vitória" ou "triunfo".',
  'zita': 'Significa "moça" ou "jovem".',
  'zulmira': 'Significa "brilhante" ou "ilustre".',
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const nome = searchParams.get('nome')?.toLowerCase();

  if (!nome) {
    return new Response(JSON.stringify({ error: 'Nome não fornecido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const significado = significadosNomes[nome];

  if (!significado) {
    return new Response(JSON.stringify({ error: 'Nome não encontrado' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ meaning: significado }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
} 