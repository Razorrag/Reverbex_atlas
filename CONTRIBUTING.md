# 🤝 Contributing to GalaxEye

We welcome contributions! This project is designed to showcase modern web development + geospatial processing.

## Quick Start for Contributors

1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/your-username/galaxeye.git
   cd galaxeye
   ```

3. **Install dependencies**:
   ```bash
   npm install
   cd api && npm install
   cd ../worker && pip install -r requirements.txt
   ```

4. **Test the setup**:
   ```bash
   python check_setup.py
   ```

5. **Run the application**:
   ```bash
   ./start.sh  # Mac/Linux
   # or
   start.bat   # Windows
   ```

## Ways to Contribute

### 🐛 Bug Fixes
- Report issues in the GitHub issue tracker
- Fix bugs you encounter
- Improve error handling

### ✨ New Features
- **Alignment Algorithms**: Add new image registration methods
- **Data Formats**: Support more geospatial file formats
- **Visualizations**: Add new ways to display results
- **UI/UX**: Improve the user interface

### 📚 Documentation
- Improve code comments
- Add tutorials and guides
- Create video demonstrations
- Translate documentation

### 🧪 Testing
- Add unit tests for components
- Create integration tests
- Test with different satellite datasets
- Performance testing

## Development Guidelines

### Code Style
- **Frontend**: Use TypeScript and follow React best practices
- **Backend**: Follow Node.js/Express conventions
- **Worker**: Use Python with clear docstrings
- **CSS**: Use Tailwind classes consistently

### Commit Messages
Use conventional commits:
```
feat: add WebAssembly processing support
fix: resolve map synchronization issue
docs: update API documentation
test: add worker unit tests
```

### Pull Request Process
1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Make your changes
3. Test thoroughly
4. Update documentation
5. Submit PR with clear description

## Project Structure

```
galaxeye/
├── frontend/          # React application
├── api/              # Node.js backend
├── worker/           # Python processing
├── docs/             # Documentation
└── tests/            # Test files
```

## Getting Help

- **Issues**: Use GitHub issues for bugs and feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check the docs/ folder for guides

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

---

**Ready to contribute? Start by running `python check_setup.py` and exploring the codebase!** 🚀