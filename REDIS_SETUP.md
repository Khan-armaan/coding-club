# Visitor Counter Setup with Upstash Redis

## 1. Create Upstash Redis Database

1. Go to [https://console.upstash.com/](https://console.upstash.com/)
2. Sign up/login (free account)
3. Click "Create Database"
4. Choose a name (e.g., "visitor-counter")
5. Select region closest to your users
6. Click "Create"

## 2. Get Your Credentials

After creating the database:
1. Go to your database details page
2. Copy the **REST URL** 
3. Copy the **REST TOKEN**

## 3. Set Environment Variables

Create a `.env.local` file in your project root:

```env
UPSTASH_REDIS_REST_URL=https://your-database-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

## 4. Deploy to Vercel

When deploying to Vercel:
1. Go to your project settings
2. Add the environment variables:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

## 5. Test

- Visit your site: counter should increment
- Visit admin panel: should show real count
- Reset works across all instances
- Counter persists across deployments

## Why Upstash Redis?

✅ **Perfect for Vercel**: Serverless-optimized  
✅ **Free tier**: 10,000 requests/day  
✅ **Fast**: Single-digit millisecond latency  
✅ **Persistent**: Data survives deployments  
✅ **Global**: Works across multiple instances  
✅ **Atomic**: Thread-safe increments  

The counter will now work reliably across all environments!
