# Codespaces React Project

This project is a React application that integrates with GitHub APIs to display workflow runs and security
vulnerabilities.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Contributing](#contributing)
- [License](#license)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/codespaces-react.git
   cd codespaces-react
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

1. Start the development server:

   ```bash
   npm start
   ```

2. Start the backend server:

   ```bash
   npm run server
   ```

3. Open your browser and navigate to `http://localhost:3000`.

## Environment Variables

Create a `.env` file in the root directory and add the following environment variables:

```properties
ACTIONS_TOKEN=your_actual_token_here
VITE_API_BASE_URL=http://localhost:5000
NODE_ENV=development
```

If running in GitHub Codespace, you can instead ensure that the `ACTIONS_TOKEN` secret is correctly set in your
Codespace settings.

## Scripts

- `npm start`: Starts the React development server.
- `npm run build`: Builds the React application for production.
- `npm run preview`: Previews the production build.
- `npm run test`: Runs the test suite.
- `npm run server`: Starts the backend server with `nodemon`.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any changes.

## License

This project is licensed under the MIT License.
