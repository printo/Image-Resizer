# Image Resizer App

A powerful web-based application for batch resizing images based on CSV
specifications. Upload a ZIP file containing images and a CSV file with resize
dimensions, and get back perfectly resized images at 300 DPI. Features secure
employee authentication and a professional interface.

## 🚀 Features

- **Secure Authentication**: Employee login system with secure cookie handling
- **Batch Image Processing**: Resize multiple images simultaneously
- **CSV-Driven Specifications**: Define exact dimensions (length/width in
  inches) via CSV
- **High-Quality Output**: All images resized to 300 DPI for professional
  quality
- **Multiple Format Support**: Handles JPEG, PNG, WebP, and other common image
  formats
- **Progress Tracking**: Real-time progress updates during processing
- **Error Handling**: Comprehensive error reporting and validation
- **ZIP Download**: Get all processed images in a convenient ZIP file
- **Drag & Drop Interface**: User-friendly file upload with drag-and-drop
  support
- **Tab Protection**: Prevents browser suspension during long processing tasks
- **Modern UI**: Clean interface with toast notifications and loading states
- **Responsive Design**: Works seamlessly on various screen sizes

## 🏗️ Architecture

### Frontend

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite (primary) with Next.js compatibility layer
- **Styling**: Tailwind CSS with shadcn/ui components
- **Authentication**: JWT-based authentication with secure cookie storage
- **Form Handling**: React Hook Form with Zod validation
- **Notifications**: Sonner for toast notifications
- **Image Processing**: HTML5 Canvas API for client-side image manipulation
- **File Handling**: JSZip for ZIP operations, PapaParse for CSV parsing
- **Icons**: Lucide React icon library

### Backend

**This is a 100% client-side application** - no backend server required! All
processing happens in the user's browser using:

- HTML5 Canvas API for image resizing
- Web File API for file handling
- Browser's JavaScript engine for all computations

### Data Flow

1. User uploads ZIP (images) + CSV (specifications)
2. CSV is parsed and validated in browser
3. ZIP is extracted using JSZip
4. Images are processed using Canvas API
5. Resized images are packaged into new ZIP
6. User downloads the result

## 💻 System Requirements

### Minimum Requirements

- **RAM**: 4GB (for processing small batches of images)
- **CPU**: Any modern dual-core processor
- **Browser**: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- **Storage**: 1GB free space (temporary processing)

### Recommended for Heavy Usage

- **RAM**: 8GB+ (for large image batches or high-resolution images)
- **CPU**: Quad-core processor or better
- **Browser**: Latest version of Chrome or Firefox
- **Storage**: 5GB+ free space

### Performance Notes

- Processing is CPU and RAM intensive as it happens entirely in the browser
- Large images (>10MB) or batches (>50 images) may require more resources
- Processing time scales with image size and quantity
- Modern browsers with hardware acceleration perform best

## 🛠️ Self-Hosting Setup

### Prerequisites

- Node.js 18+ and npm/pnpm/yarn
- Modern web browser for testing

### Installation

1. **Clone the repository** \`\`\`bash git clone <repository-url> cd
   image-resizer-app \`\`\`

2. **Install dependencies** \`\`\`bash
   # Using npm
   npm install

   # Using pnpm (recommended)
   pnpm install

   # Using yarn
   yarn install \`\`\`

3. **Start development server** \`\`\`bash
   # Using npm
   npm run dev

   # Using pnpm
   pnpm dev

   # Using yarn
   yarn dev \`\`\`

4. **Open in browser** Navigate to `http://localhost:3000`

### Production Build

1. **Build the application** \`\`\`bash npm run build
   # or
   pnpm build
   # or
   yarn build \`\`\`

2. **Preview production build** \`\`\`bash npm run preview
   # or
   pnpm preview
   # or
   yarn preview \`\`\`

3. **Deploy static files** The `dist/` folder contains all static files ready
   for deployment to any web server (Nginx, Apache, Vercel, Netlify, etc.)

### Deployment Options

#### Static Hosting (Recommended)

- **Vercel**: `vercel --prod`
- **Netlify**: Drag and drop `dist/` folder
- **GitHub Pages**: Push `dist/` contents to gh-pages branch
- **AWS S3**: Upload `dist/` contents to S3 bucket with static hosting

#### Traditional Web Server

- **Nginx**: Serve `dist/` folder as static content
- **Apache**: Copy `dist/` contents to document root
- **Docker**: Use nginx:alpine base image to serve static files

## 📝 Usage

### CSV Format

Your CSV file must contain exactly 3 columns: \`\`\`csv filename,length,width
image1.jpg,8.5,11 image2.png,4,6 photo.jpeg,5,7 \`\`\`

- **filename**: Exact filename as it appears in the ZIP
- **length**: Height in inches (decimal values supported)
- **width**: Width in inches (decimal values supported)

### Supported Image Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)
- BMP (.bmp)
- GIF (.gif) - static only

### Processing Workflow

1. Upload ZIP file containing your images
2. Upload CSV file with resize specifications
3. Review CSV validation and preview
4. Click "Process Images" to start batch resize
5. Monitor progress in real-time
6. Download ZIP file with resized images

## 🔧 Configuration

### Environment Variables

No environment variables required - the app runs entirely client-side.

### Customization

- **DPI Setting**: Modify `DEFAULT_DPI` in `src/utils/imageProcessor.ts`
- **File Size Limits**: Adjust validation in `src/utils/fileValidation.ts`
- **UI Theme**: Customize colors in `tailwind.config.ts`

## 🐛 Troubleshooting

### Common Issues

**"Out of memory" errors**

- Reduce batch size or image resolution
- Close other browser tabs
- Increase system RAM

**Images not found in ZIP**

- Ensure CSV filenames exactly match ZIP contents
- Check for case sensitivity
- Verify file extensions

**Slow processing**

- Use modern browser with hardware acceleration
- Process smaller batches
- Optimize source image sizes

**CSV validation errors**

- Ensure exactly 3 columns: filename, length, width
- Use decimal numbers for dimensions
- Remove empty rows

## 📊 Performance Benchmarks

### Typical Processing Times (on modern hardware)

- **10 images (2MB each)**: ~30 seconds
- **50 images (5MB each)**: ~3-5 minutes
- **100 images (10MB each)**: ~10-15 minutes

### Memory Usage

- **Base app**: ~50MB
- **Per image**: ~20-50MB during processing
- **Large images (>20MB)**: Can use 100MB+ each

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for
details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [JSZip](https://stuk.github.io/jszip/) for ZIP file handling
- [PapaParse](https://www.papaparse.com/) for CSV parsing
- [Lucide](https://lucide.dev/) for the icon library
