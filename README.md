# Route Project Backend

Backend API projesi - Vercel serverless functions kullanarak.

## Önemli Notlar

### Package.json Konfigürasyonu
- **Build script YOK** - Bu kasıtlı bir tercihtir
- Build script varsa Vercel bunu frontend projesi sanır
- Vercel TypeScript'i otomatik olarak compile eder → dist klasörüne
- Sonra public klasörünü aramaya çalışır ve hata alır
- Backend projeler için build script gerekmez

### API Endpoint
- Local: `http://localhost:3000/api`
- Production: `https://your-app.vercel.app/api`

### Geliştirme
```bash
npm start  # vercel dev çalıştırır
```

### Deployment
```bash
vercel --prod
```

## Environment Variables
- `ORS_API_KEY`: OpenRouteService API anahtarı