# Diva Pages

Main project website and documentation hub for the Diva ecosystem.

## Project Structure

```
pages/
├── app-page/      # Web app
├── docs-page/     # Documentation site
├── landing-page/  # Main landing page
├── LICENSE
└── README.md
```

## Purpose

- **Landing Page**: Showcase the Diva ecosystem, its components, and features
- **Documentation**: Comprehensive guides, API references, and tutorials for all Diva projects
- **App Page**: Web application interface

## Prerequisites

- [Node.js](https://nodejs.org) >= 22.12
- [pnpm](https://pnpm.io) >= 11.9

## Commands

| Command        | Description              |
| -------------- | ------------------------ |
| `pnpm install` | Install all dependencies |
| `pnpm dev`     | Start all dev servers    |
| `pnpm build`   | Build all projects       |
| `pnpm lint`    | Lint all projects        |
| `pnpm format`  | Format all projects      |

Single project:

```
pnpm --filter app-page dev
pnpm --filter docs-page build
pnpm --filter landing-page preview
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
