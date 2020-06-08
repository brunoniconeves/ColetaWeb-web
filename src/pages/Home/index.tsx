import React from 'react';
import { FiLogIn } from 'react-icons/fi'

import './styles.css';

import logo from '../../assets/logo.svg';
import { Link } from 'react-router-dom';

const Home = () => {
  return(
    <div id="page-home">
      <div className="content">
        <header>
          <img src={logo} alt="ColetaWeb"/>
        </header>
        <main>
          <h1>Descarte seus resíduos de forma segura</h1>
          <p>Ajude o meio ambiente encontrando facilmente o ponto de coleta mais próximo.</p>
          <Link to="/CreatePoint">
            <span><FiLogIn/></span>
            <strong>Cadastre um ponto de coleta</strong>
          </Link>
        </main>
      </div>
    </div>
  );
}

export default Home;