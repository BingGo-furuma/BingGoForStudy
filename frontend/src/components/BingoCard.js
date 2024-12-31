import React, { useEffect, useState } from 'react';
import axios from 'axios';

function BingoCard() {
  const [bingoCard, setBingoCard] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/bingo-card/')
      .then(response => setBingoCard(response.data.card.cells))
      .catch(error => console.error(error));
  }, []);

  const handleMissionComplete = (missionId) => {
    axios.post('http://127.0.0.1:8000/complete-mission/', { mission_id: missionId })
      .then(response => alert(response.data.message))
      .catch(error => console.error(error));
  };

  return (
    <div className="grid grid-cols-5 gap-4">
      {bingoCard.map((cell, index) => (
        <div 
          key={index} 
          className={`border p-4 text-center ${cell.stamped ? 'bg-yellow-300' : ''}`}
          onClick={() => !cell.stamped && handleMissionComplete(cell.mission_id)}
        >
          {cell.content}
        </div>
      ))}
    </div>
  );
}

export default BingoCard;
