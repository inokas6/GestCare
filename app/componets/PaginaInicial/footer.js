import React from 'react';

// Componente do rodapé da página
const footer = () => {
    return (
        // Contentor principal do rodapé
        <footer className="footer bg-base-200 text-base-content p-10">
            <nav>
                <h6 className="footer-title">Serviços</h6>
                <a className="link link-hover">Calculadoras</a>
                <a className="link link-hover">Fórum</a>
                <a className="link link-hover">Dicas</a>
                <a className="link link-hover">Recursos</a>
            </nav>
            <nav>
                <h6 className="footer-title">Empresa</h6>
                <a className="link link-hover">Sobre nós</a>
                <a className="link link-hover">Contactos</a>
                <a className="link link-hover">Trabalhos</a>
                <a className="link link-hover">Kit de imprensa</a>
            </nav>
            <nav>
                <h6 className="footer-title">Legal</h6>
                <a className="link link-hover">Termos de utilização</a>
                <a className="link link-hover">Política de privacidade</a>
                <a className="link link-hover">Política de cookies</a>
            </nav>
            <form>
                <h6 className="footer-title">Newsletter</h6>
                <fieldset className="form-control w-80">
                    <label className="label">
                        <span className="label-text">Introduza o seu endereço de email</span>
                    </label>
                    <div className="join">
                        <input
                            type="text"
                            placeholder="utilizador@site.pt"
                            className="input input-bordered join-item" />
                        <button className="btn btn-primary join-item">Subscrever</button>
                    </div>
                </fieldset>
            </form>
        </footer>
    );
};

// Exporta o componente do rodapé
export default footer;