import { config } from 'dotenv';

// Load defaults from .env
config();

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080;
const USER_AGENT = process.env.USER_AGENT || 'graphspiral';

export default {
    PORT,
    USER_AGENT
};
