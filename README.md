# Diva Web Page

A modern TypeScript-based web application that provides a responsive and interactive user interface.

## Description

Diva Page is the web frontend for the Diva platform, built with modern web technologies to deliver a fast, responsive, and accessible user experience across all devices and browsers.

## Requirements

- **Node.js**: 18.0 or later
- **pnpm**: 8.0 or later
- **TypeScript**: 5.0 or later

## Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
```

## Building

### Using pnpm

```bash
# Install dependencies
pnpm install

# Build for production
pnpm build

# Development server
pnpm dev

# Linting
pnpm lint

# Format code
pnpm format

# Run tests
pnpm test
```

### Available Scripts

- `dev`: Start development server with hot reload
- `build`: Build for production
- `test`: Run unit and integration tests
- `lint`: Run ESLint
- `lint:fix`: Fix linting issues automatically
- `format`: Format code with Prettier

## Development

### Project Structure

```
web-page/
```

### Environment Variables

Create a `.env` file in the root directory:

```env

```

## Usage

### Development

```bash
# Start development server
pnpm dev

# The application will be available at http://localhost:5173
```

### Production

```bash
# Build for production
pnpm build

# The build output will be in the `dist/` directory
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure code passes linting: `pnpm lint`
5. Run tests: `pnpm test`
6. Submit a pull request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
