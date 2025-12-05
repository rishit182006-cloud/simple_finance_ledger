# Simple Finance Ledger 💰

Hey there! Welcome to the **Simple Finance Ledger**. This is a straightforward project I built to help track income and expenses without any complicated bells and whistles. It's clean, fast, and does exactly what it says on the tin.

## What is this?

It's a full-stack web application where you can:
- **Track Transactions**: Log your daily income and expenses.
- **View Dashboard**: Get a quick snapshot of your total balance, income, and expenses.
- **Manage Entries**: Add, edit, or delete transactions easily.

I built this using **FastAPI** for the backend (because it's super fast and easy to use) and vanilla **HTML/CSS/JS** for the frontend (to keep things lightweight). The data is stored in a local **SQLite** database.

## How to Run It

### 1. Backend Setup (The Engine)

First, you'll need Python installed. Then, pop open your terminal:

```bash
# Navigate to the project folder
cd simple_finance_ledger

# Create a virtual environment (optional but recommended)
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate

# Install the dependencies
pip install -r requirements.txt

# Start the server!
uvicorn app.main:app --reload
```
The backend will be running at `http://127.0.0.1:8000`.

### 2. Frontend Setup (The Look)

No complex build steps here! The frontend is just static files.

1.  Go to the `frontend` folder.
2.  Open `config.js` and make sure the `API_BASE_URL` matches your backend (default is usually fine if running locally).
3.  Just open `index.html` in your browser! Or, to avoid CORS issues, use a simple server:

```bash
cd frontend
# If you have Python installed:
python -m http.server 5500
```
Then visit `http://localhost:5500`.

## Features
- 📊 **Dashboard View**: See your finances at a glance.
- 📝 **Transaction List**: Detailed table of all your money moves.
- ✨ **Modern UI**: Clean design with a calm color palette.
- 🛠️ **Edit Capability**: Made a mistake? No prob, just edit the transaction.

## Project Structure
- `/app`: Contains the Python backend code.
- `/frontend`: All the HTML, CSS, and JS magic.
- `ledger.db`: The local database file (created automatically).

Enjoy tracking your finances! Let me know if you have any questions.
