import logo from './logo.svg';
import './App.css';

import { useState } from 'react';

function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  return (
    <>
      <h2>Alma Ata, Kazajistán</h2>
      <Panel
        title="Acerca de"
        isActive={activeIndex === 0}
        onShow={() => setActiveIndex(0)}
      >
        Con una población de unos 2 millones de habitantes, Alma Ata es la mayor ciudad de Kazajistán. De 1929 a 1997 fue su capital.
      </Panel>
      <Panel
        title="Etimología"
        isActive={activeIndex === 1}
        onShow={() => setActiveIndex(1)}
      >
        El nombre proviene de <span lang="kk-KZ">алма</span>, la palabra en kazajo para "manzana", y suele traducirse como "lleno de manzanas". De hecho, se cree que la región que rodea a Alma Ata es el hogar ancestral de la manzana, y el <i lang="la">Malus Silvestris</i> se considera un candidato probable para el ancestro de la manzana doméstica moderna.
      </Panel>
    </>
  );
}

function Panel({
  title,
  children,
  isActive,
  onShow
}) {
  return (
    <section className="panel">
      <h3>{title}</h3>
      {isActive ? (
        <p>{children}</p>
      ) : (
        <button onClick={onShow}>
          Mostrar
        </button>
      )}
    </section>
  );
}


export default App;
