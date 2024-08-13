import React, { useState } from 'react';
import { CContainer, CRow, CCol } from '@coreui/react';
import CardList from './components/CardList';
import CardDetail from './components/CardDetail';
import CardTable from './components/CardTable';
import cards from './data/cards';
import './App.css';

const App = () => {
  const [selectedCard, setSelectedCard] = useState(null);

  const handleCardClick = (card) => {
    setSelectedCard(card);
  };

  return (
    <CContainer className="mt-4">
      <CRow>
        <CCol md="4">
          <CardList cards={cards} onCardClick={handleCardClick} />
        </CCol>
        <CCol md="8">
          <CardDetail card={selectedCard} />
          <CardTable cards={cards} />
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default App;






const cards = [
  {
    id: 1,
    name: "Magic Card",
    description: "A magical card with special abilities.",
    image: "https://via.placeholder.com/150",
    price: "$10"
  },
  {
    id: 2,
    name: "Fire Card",
    description: "A card that controls fire.",
    image: "https://via.placeholder.com/150",
    price: "$15"
  },
  // Tambah lebih banyak kartu jika perlu
];

export default cards;