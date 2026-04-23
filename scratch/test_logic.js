import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function testMatching() {
  // First, login to get a token
  try {
    const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'zeeshanmadras198@gmail.com',
      password: '' // Wait, this is a Google user, I can't login with password.
    });
  } catch (e) {
    console.log('Login failed (expected for Google user)');
  }

  // I'll just check the listings route directly if I can bypass auth for testing
  // Or I can just check the AI service logic directly.
}
