export const palavrasProibidas = [
  'merda',
  'caralho',
  'nigga',
  
];

export const verificarPalavrasProibidas = (texto) => {
  if (!texto) return { contemPalavraProibida: false, palavraEncontrada: null };
  
  const textoLower = texto.toLowerCase();
  const palavraEncontrada = palavrasProibidas.find(palavra => 
    textoLower.includes(palavra.toLowerCase())
  );

  return {
    contemPalavraProibida: !!palavraEncontrada,
    palavraEncontrada
  };
}; 