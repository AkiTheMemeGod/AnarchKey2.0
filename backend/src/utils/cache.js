import NodeCache from 'node-cache';

// Initialize cache with a standard TTL of 5 minutes (300 seconds)
const cache = new NodeCache({ stdTTL: 300 });

export default cache;
