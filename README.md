
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

## License

[Specify your license here]

## Contact

[Your contact information]
