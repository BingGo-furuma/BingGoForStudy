import React from 'react';

const BingoBoard = ({ bingoData, onMissionClick }) => {
    return (
        <div style={{ display: 'flex' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '5px', width: '50%' }}>
                {bingoData.map((cell, index) => (
                    <div
                        key={index}
                        style={{
                            border: '2px solid black',
                            padding: '20px',
                            backgroundColor: cell.stamped ? 'lightgreen' : 'white',
                        }}
                    >
                        {cell.id}
                    </div>
                ))}
            </div>
            <div style={{ width: '50%', padding: '10px' }}>
                <h3>Missions</h3>
                <ul>
                    {bingoData.map((cell, index) => (
                        <li key={index}>
                            <button onClick={() => onMissionClick(cell.id)}>{`Mission ${cell.id}`}</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default BingoBoard;
