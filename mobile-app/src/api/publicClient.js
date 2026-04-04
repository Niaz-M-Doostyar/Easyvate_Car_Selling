import axios from 'axios';
import { PUBLIC_API_URL } from './config';

const publicApiClient = axios.create({
  baseURL: PUBLIC_API_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

export default publicApiClient;