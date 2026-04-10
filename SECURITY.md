# Security Policy

## Overview
This Weather App is a frontend-only application deployed on GitHub Pages. It follows security best practices for client-side applications.

## API Security
- **OpenWeatherMap API Key**: The API key is intentionally exposed as it's for a public, free-tier API with rate limiting
- **HTTPS Only**: All API requests use HTTPS
- **No User Data Storage**: Only local weather search history is stored in browser's localStorage
- **No Authentication Required**: Public API doesn't require user credentials

## Security Headers
This application implements the following security headers:
- **Content-Security-Policy**: Restricts resource loading to trusted sources
- **X-UA-Compatible**: Ensures proper rendering in older IE browsers
- **Permissions-Policy**: Disables unnecessary permissions (geolocation, microphone, camera)
- **Referrer-Policy**: Controls referrer information

## Subresource Integrity (SRI)
- Font Awesome CDN resources include SRI hashes to prevent tampering
- All external resources are verified with integrity checks

## Best Practices
✅ All external scripts use HTTPS  
✅ Content Security Policy enabled  
✅ No sensitive user data collected  
✅ LocalStorage used only for weather history  
✅ Regular security headers implemented  
✅ No mixed content (HTTP + HTTPS)  

## Known Limitations
- Frontend-only application cannot hide API keys
- For production use with sensitive data, implement a backend proxy

## Contact
For security concerns, please create an issue on GitHub.
