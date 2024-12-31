import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const ProtectedData = () => {
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/users/protected/');
                setMessage(response.data.message);
            } catch (error) {

		console.error('データ取得失敗:', error.response ? error.response.data : error.message);
                setMessage('認証エラー: データを取得できませんでした。');
            }
        };

        fetchData();
    }, []);

    return <h3>{message || 'Loading...'}</h3>;
};

export default ProtectedData;
