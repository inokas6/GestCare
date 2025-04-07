import { getTopicos, createTopico } from './topicos';
import { getRespostas, addResposta } from './respostas';
import { getCategorias } from './categorias';
import { addReacao } from './reacoes';
import { getTopUsers } from './usuarios';

export const forum = {
  getTopicos,
  createTopico,
  getRespostas,
  addResposta,
  getCategorias,
  addReacao,
  getTopUsers
}; 