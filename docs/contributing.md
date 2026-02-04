# Contributing to ImmutableType

Thank you for your interest in contributing to ImmutableType! This guide will help you get started.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/immutable5.git
   cd immutable5
   ```
3. **Create a branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make your changes**
5. **Test your changes**:
   ```bash
   npm run dev
   npm run lint
   ```
6. **Commit your changes**:
   ```bash
   git commit -m "Add: your feature description"
   ```
7. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
8. **Open a Pull Request** on GitHub

## Development Workflow

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates

### Commit Messages

Follow conventional commits:

```
type(scope): description

Examples:
- feat(wallet): add WalletConnect support
- fix(profile): fix profile creation error
- docs(readme): update installation instructions
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Code Style

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Use explicit types, avoid `any`
- Use interfaces for object shapes

### React

- Use functional components
- Use hooks for state management
- Use `'use client'` directive for client components
- Keep components small and focused

### Naming Conventions

- **Components**: PascalCase (`WalletSelector.tsx`)
- **Hooks**: camelCase starting with `use` (`useUnifiedWallet.ts`)
- **Services**: PascalCase with `Service` suffix (`ProfileNFTService.ts`)
- **Utilities**: camelCase (`wordValidation.ts`)
- **Constants**: UPPER_SNAKE_CASE (`WALLET_RDNS`)

### File Organization

```
lib/
├── hooks/           # React hooks
├── services/        # Service layer
│   ├── profile/     # Profile-related services
│   └── bookmark/    # Bookmark-related services
├── web3/            # Web3 utilities
└── types/           # TypeScript types
```

## Testing

### Manual Testing Checklist

Before submitting a PR, test:

- [ ] Wallet connection (MetaMask and Flow Wallet)
- [ ] Profile creation
- [ ] Bookmark minting
- [ ] Network switching
- [ ] Error handling
- [ ] Mobile responsiveness (if applicable)

### Testing Wallet Integration

1. Test with MetaMask installed
2. Test with Flow Wallet installed
3. Test with both installed
4. Test with neither installed
5. Test connection flow
6. Test disconnection
7. Test network switching

## Pull Request Guidelines

### Before Submitting

1. **Update documentation** if needed
2. **Add tests** if applicable
3. **Run linter**: `npm run lint`
4. **Test locally**: `npm run dev`
5. **Check for TypeScript errors**: `npm run build`

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests pass
```

## Code Review Process

1. **Automated Checks**: CI will run linting and type checking
2. **Review**: Maintainers will review your PR
3. **Feedback**: Address any feedback
4. **Merge**: Once approved, your PR will be merged

## Areas for Contribution

### High Priority

- WalletConnect integration
- Mobile wallet support
- Performance optimizations
- Test coverage improvements

### Medium Priority

- UI/UX improvements
- Documentation updates
- Error message improvements
- Accessibility improvements

### Low Priority

- Code refactoring
- Type improvements
- Code comments
- Developer experience improvements

## Questions?

- Open an issue on GitHub
- Check existing issues and discussions
- Review the documentation

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Respect different viewpoints

Thank you for contributing to ImmutableType! 🎉
