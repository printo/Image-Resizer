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

## 🛠️ Installation

1. **Prerequisites**

   - Node.js (v16 or later)
   - npm (v7 or later) or pnpm (v8 or later)
   - Modern web browser (Chrome, Firefox, Safari, Edge)

2. **Clone the repository**

   ```bash
   git clone https://github.com/printo/Image-Resizer.git
   cd Image-Resizer
   ```

3. **Install dependencies**

   ```bash
   # Using npm
   npm install

   # Or using pnpm
   pnpm install
   ```

4. **Start the development server**

   ```bash
   # Using npm
   npm run dev

   # Or using pnpm
   pnpm dev
   ```

   The application will be available at `http://localhost:5173`

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_APP_NAME=Image Resizer
VITE_API_BASE_URL=http://your-api-url.com
# Add other environment variables as needed
```

## 🏗️ Project Structure

```
Image-Resizer/
├── public/              # Static files
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── ui/          # shadcn/ui components
│   │   ├── FileUpload.tsx
│   │   ├── CSVPreview.tsx
│   │   └── LoginPage.tsx
│   ├── context/         # React context providers
│   │   └── AuthContext.tsx
│   ├── lib/             # Utility functions
│   ├── utils/           # Helper utilities
│   │   ├── auth.ts
│   │   ├── csvParser.ts
│   │   ├── fileValidation.ts
│   │   ├── imageProcessor.ts
│   │   └── zipGenerator.ts
│   ├── App.tsx          # Main application component
│   └── main.tsx         # Application entry point
├── .eslintrc.json       # ESLint configuration
├── .gitignore           # Git ignore file
├── index.html           # HTML template
├── package.json         # Project dependencies and scripts
├── postcss.config.js    # PostCSS configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite configuration
```

## 📜 Available Scripts

- `dev`: Start the development server
  ```bash
  npm run dev
  ```
- `build`: Build the application for production
  ```bash
  npm run build
  ```
- `preview`: Preview the production build locally
  ```bash
  npm run preview
  ```
- `lint`: Run ESLint to check code quality
  ```bash
  npm run lint
  ```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to a GitHub, GitLab, or Bitbucket repository
2. Import the repository to Vercel
3. Configure the build settings:
   - Build Command: `npm run build` or `pnpm build`
   - Output Directory: `dist`
   - Install Command: `npm install` or `pnpm install`
4. Add environment variables if needed
5. Deploy!

### Netlify

1. Push your code to a Git repository
2. Create a new site in Netlify and link your repository
3. Set the build command and publish directory:
   - Build Command: `npm run build` or `pnpm build`
   - Publish directory: `dist`
4. Add environment variables in the site settings
5. Deploy the site

## 🧪 Testing

To run tests, use the following command:

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Generate test coverage report
npm test -- --coverage
```

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**

   - Ensure all dependencies are installed: `npm install`
   - Clear the cache: `rm -rf node_modules/.vite`
   - Check for TypeScript errors: `npx tsc --noEmit`

2. **Authentication Issues**

   - Clear browser cookies for the application
   - Ensure the authentication server is running and accessible

3. **Image Processing Errors**
   - Check the browser console for specific error messages
   - Ensure images are in a supported format
   - Verify CSV file format matches the expected structure

## 🤝 Contributing

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit them: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.

## 📞 Support

For support, please open an issue in the GitHub repository or contact the
maintainers.

## 🙏 Acknowledgments

- [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling
- [React](https://reactjs.org/) - A JavaScript library for building user
  interfaces
- [shadcn/ui](https://ui.shadcn.com/) - Beautifully designed components
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [Lucide Icons](https://lucide.dev/) - Beautiful & consistent icon toolkit

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

## � Performance Benchmarks

### Typical Processing Times (on modern hardware)

- **10 images (2MB each)**: ~30 seconds
- **50 images (5MB each)**: ~3-5 minutes
- **100 images (10MB each)**: ~10-15 minutes

### Memory Usage

- **Base app**: ~50MB
- **Per image**: ~20-50MB during processing
- **Large images (>20MB)**: Can use 100MB+ each

## 📝 Usage

### CSV Format

Your CSV file must contain exactly 3 columns:

```csv
filename,length,width
image1.jpg,8.5,11
image2.png,4,6
photo.jpeg,5,7
```

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
