# Biteright_app Server

This is the server-side application for the Biteright_app project, which connects to a MySQL database to manage user data, diet plans, meal tracking, and more.

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- MySQL (version 5.7 or higher)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/AhnafwadudArnab/Biteright_app.git
   ```

2. Navigate to the server directory:
   ```
   cd Biteright_app/server
   ```

3. Install the dependencies:
   ```
   npm install
   ```

### Configuration

Before running the server, ensure that your MySQL database is set up correctly. You can find the database schema in the `all_in_one.sql` file located in the project directory. Import this schema into your MySQL database.

### Running the Server

To start the server, run the following command:
```
npm start
```

The server will start on the default port (usually 3000). You can change the port in the `src/app.ts` file if needed.

### API Endpoints

The server exposes several API endpoints for user management, diet plans, and meal tracking. Refer to the `src/routes/userRoutes.ts` file for the available routes and their functionalities.

## Backend Server Usage

### How to Start the Backend

1. Open a terminal and navigate to the `Backend_Server` directory:
   
   cd Backend_Server

2. Start the backend server:
   
   npm start

   - This will run the backend using `ts-node src/app.ts`.
   - The backend will listen on port 3000 by default (or the value of the `PORT` environment variable).

### Notes
- Make sure you have installed all dependencies with `npm install` before starting.
- The backend is separate from the Expo frontend. Run both servers in separate terminals for full functionality.

### License

This project is licensed under the MIT License. See the LICENSE file for more details.

### Acknowledgments

- Thanks to all contributors and libraries used in this project.