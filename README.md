
# SmoothStream Player

SmoothStream Player is a modern, web-based streaming application designed to handle various media streaming formats including HLS (m3u8) and regular transport streams (ts). The player offers a clean interface for watching live TV channels, movies, and series with a responsive design that works across devices.

## Project Features

- **Multi-Format Video Player**: Supports HLS (m3u8), TS, and other common streaming formats
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Channel Management**: Easy navigation through channel lists and categories
- **Movie & Series Support**: Watch movies and TV series with episode tracking
- **Customizable Layout**: Clean, modern UI with dark mode support
- **Playlist Import**: Support for various playlist formats 

## Technical Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Video Playback**: hls.js for HLS stream handling
- **State Management**: React Context and React Query
- **Routing**: React Router

## VPS Requirements for 50-100 Concurrent Users

For a deployment serving 50-100 concurrent users of this web application, here are the recommended specifications:

### Minimum VPS Specifications
- **CPU**: 4 vCPUs (2.5GHz+)
- **RAM**: 8GB
- **Storage**: 50GB SSD (more if storing media files locally)
- **Bandwidth**: 500GB/month minimum (streaming is bandwidth-intensive)
- **Network**: 1Gbps connection recommended

### Recommended VPS Specifications
- **CPU**: 8 vCPUs (3.0GHz+)
- **RAM**: 16GB
- **Storage**: 100GB SSD 
- **Bandwidth**: 1TB/month or unmetered if possible
- **Network**: 1Gbps+ connection

### Additional Considerations
- **CDN Integration**: Consider using a CDN for static assets to reduce server load
- **Load Balancing**: For higher reliability, consider multiple smaller VPS instances with a load balancer
- **Scaling Strategy**: Be prepared to scale vertically (upgrade VPS) or horizontally (add more servers) as user base grows
- **Monitoring**: Implement server monitoring to track resource usage and performance
- **Backup Strategy**: Regular backups of configuration and user data

### Recommended VPS Providers
- Digital Ocean
- Linode / Akamai
- AWS (EC2)
- Google Cloud Platform
- Vultr

## Development Setup

```sh
# Clone the repository
git clone <repository-url>

# Navigate to the project directory
cd smoothstream-player

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Deployment

This application can be deployed to any static hosting service or VPS:

```sh
# Build for production
npm run build

# The build output will be in the 'dist' directory
# Deploy these files to your web server
```

### Production Deployment Guide

For a production deployment, follow these additional steps:

1. **Configure Environment Variables**:
   - Create a `.env.production` file with your production environment variables
   - Make sure to set `NODE_ENV=production` and any API endpoints or service URLs

2. **Optimize Build**:
   ```sh
   # For production build with optimizations
   npm run build
   ```

3. **Server Configuration**:
   - For Nginx:
     ```
     server {
       listen 80;
       server_name yourdomain.com;
       root /path/to/smoothstream-player/dist;
       
       location / {
         try_files $uri $uri/ /index.html;
       }
       
       # Cache static assets
       location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
         expires 30d;
         add_header Cache-Control "public, no-transform";
       }
     }
     ```
   
   - For Apache, create a `.htaccess` file in your dist directory:
     ```
     <IfModule mod_rewrite.c>
       RewriteEngine On
       RewriteBase /
       RewriteRule ^index\.html$ - [L]
       RewriteCond %{REQUEST_FILENAME} !-f
       RewriteCond %{REQUEST_FILENAME} !-d
       RewriteRule . /index.html [L]
     </IfModule>
     ```

4. **SSL Configuration**:
   - Obtain an SSL certificate from Let's Encrypt or another provider
   - Configure your server to use HTTPS:
     ```
     # Nginx SSL Configuration
     server {
       listen 443 ssl http2;
       server_name yourdomain.com;
       
       ssl_certificate /path/to/fullchain.pem;
       ssl_certificate_key /path/to/privkey.pem;
       
       # Modern SSL configuration
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_prefer_server_ciphers on;
       ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
       
       # Rest of configuration...
     }
     ```

5. **Continuous Deployment**:
   - Consider setting up CI/CD using GitHub Actions, GitLab CI, or similar
   - Example GitHub Action workflow:
     ```yaml
     name: Deploy
     
     on:
       push:
         branches: [ main ]
         
     jobs:
       build-and-deploy:
         runs-on: ubuntu-latest
         steps:
           - uses: actions/checkout@v3
           - name: Use Node.js
             uses: actions/setup-node@v3
             with:
               node-version: '18'
           - name: Install dependencies
             run: npm ci
           - name: Build
             run: npm run build
           - name: Deploy
             uses: appleboy/scp-action@master
             with:
               host: ${{ secrets.HOST }}
               username: ${{ secrets.USERNAME }}
               key: ${{ secrets.SSH_KEY }}
               source: "dist/"
               target: "/path/on/your/server/"
     ```

### VPS Provider Details

1. **DigitalOcean**
   - Pricing: Starts at $5/month for basic VPS
   - For 50-100 users: Consider their $48/month plan (8GB RAM, 4 vCPUs, 160GB SSD)
   - Pros: Simple interface, good documentation, global data centers
   - Managed database options available

2. **Linode/Akamai**
   - Pricing: Starts at $5/month for basic VPS
   - For 50-100 users: Their $48/month plan (8GB RAM, 4 vCPUs, 160GB SSD)
   - Pros: High performance, good network, developer-friendly

3. **AWS EC2**
   - Pricing: Variable based on usage
   - For 50-100 users: t3.large or t3.xlarge instances
   - Pros: Extensive ecosystem, highly scalable, global presence
   - Cons: More complex setup, potential for unexpected costs

4. **Google Cloud Platform**
   - Pricing: Variable based on usage
   - For 50-100 users: e2-standard-4 instances
   - Pros: Good performance, integrates well with other Google services
   - Cons: Similar complexity to AWS

5. **Vultr**
   - Pricing: Starts at $5/month
   - For 50-100 users: Their $48/month High Frequency plan
   - Pros: High performance, global network, simple interface

## License

[Specify your license here]

## Contact

[Your contact information]
