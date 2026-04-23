import axios from 'axios';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'ecomatch_secret_key_123';

async function testApi() {
  const token = jwt.sign({ userId: '69ea231eddc6bf0f5e8edd34', role: 'buyer' }, JWT_SECRET);
  
  try {
    const res = await axios.get('http://localhost:3000/api/listings/buyer/matches', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Success:', JSON.stringify(res.data, null, 2));
  } catch (e) {
    console.error('API Test Failed:', e.response?.status, e.response?.data);
  }
}

testApi();
