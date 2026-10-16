import dns from 'dns';
import mongoose from 'mongoose';

// Attempt standard DNS servers config for environments where it is supported
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
  if (typeof (dns as any).setDefaultResultOrder === 'function') {
    (dns as any).setDefaultResultOrder('ipv4first');
  }
} catch (e) {
  // Ignore in restricted environments
}

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Resolves a mongodb+srv:// URI to a standard mongodb:// replica set URI
 * using DNS-over-HTTPS (DoH). This completely bypasses Windows / ISP DNS
 * firewalls that block SRV queries (querySrv ECONNREFUSED).
 */
async function resolveMongoSrvViaDoH(srvUri: string): Promise<string> {
  if (!srvUri.startsWith('mongodb+srv://')) {
    return srvUri;
  }

  try {
    const match = srvUri.match(/^mongodb\+srv:\/\/([^@]+@)?([^/?#]+)(\/[^?#]*)?(\?.*)?$/);
    if (!match) return srvUri;

    const [, userinfo = '', hostname, pathname = '/event_leads', query = ''] = match;

    // Fetch SRV records via Google DoH over HTTPS (port 443 is never blocked by ISPs)
    const srvRes = await fetch(`https://dns.google/resolve?name=_mongodb._tcp.${hostname}&type=SRV`, {
      cache: 'no-store',
    });

    if (!srvRes.ok) {
      return srvUri;
    }

    const srvData = await srvRes.json();
    if (!srvData.Answer || !srvData.Answer.length) {
      return srvUri;
    }

    const hosts = srvData.Answer.map((ans: { data: string }) => {
      const parts = ans.data.trim().split(/\s+/);
      const port = parts[2] || '27017';
      const target = (parts[3] || parts[parts.length - 1]).replace(/\.$/, '');
      return `${target}:${port}`;
    }).join(',');

    // Fetch TXT records for replicaSet options
    let txtParams = '';
    try {
      const txtRes = await fetch(`https://dns.google/resolve?name=${hostname}&type=TXT`, {
        cache: 'no-store',
      });
      if (txtRes.ok) {
        const txtData = await txtRes.json();
        if (txtData.Answer && txtData.Answer.length) {
          txtParams = txtData.Answer.map((a: { data: string }) => a.data.replace(/^"|"$/g, '')).join('&');
        }
      }
    } catch {
      // Optional TXT lookup
    }

    const searchParams = new URLSearchParams(query.startsWith('?') ? query.slice(1) : query);
    searchParams.set('ssl', 'true');
    if (txtParams) {
      const txtUrlParams = new URLSearchParams(txtParams);
      txtUrlParams.forEach((val, key) => {
        if (!searchParams.has(key)) {
          searchParams.set(key, val);
        }
      });
    }

    const resolvedUri = `mongodb://${userinfo}${hosts}${pathname}?${searchParams.toString()}`;
    console.log('[MongoDB] Resolved SRV via HTTPS DoH successfully to replica set nodes');
    return resolvedUri;
  } catch (err) {
    console.warn('[MongoDB] DoH resolution failed, falling back to original URI:', err);
    return srvUri;
  }
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache;
}

let cached: MongooseCache = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    };

    cached.promise = (async () => {
      // First try directly
      try {
        const m = await mongoose.connect(MONGODB_URI, opts);
        console.log('[MongoDB] Connected to MongoDB Atlas directly');
        return m;
      } catch (err: any) {
        // If querySrv ECONNREFUSED happens, auto-resolve via DoH and retry
        if (err && (err.code === 'ECONNREFUSED' || err.syscall === 'querySrv' || err.message?.includes('querySrv'))) {
          console.warn('[MongoDB] querySrv ECONNREFUSED detected. Auto-resolving SRV via DNS-over-HTTPS fallback...');
          const resolvedUri = await resolveMongoSrvViaDoH(MONGODB_URI);
          if (resolvedUri !== MONGODB_URI) {
            const m = await mongoose.connect(resolvedUri, opts);
            console.log('[MongoDB] Connected to MongoDB Atlas via DoH resolved connection');
            return m;
          }
        }
        throw err;
      }
    })();
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
