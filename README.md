
Language Agnostic Chatbot Software
AI-Powered Multilingual Chatbot
Overview
 YouTube link
https://youtu.be/w3Mf_1W2Eks?si=fKUCA0xPttKB8trP
# Language-Agnostic Chatbot

A web-based chatbot that lets users communicate in their own language, regardless of the language the bot operates in. The app detects and translates user input on the fly, enabling seamless multilingual conversations.

## Features

- 💬 Interactive chat interface
- 🌐 Automatic language detection and translation
- ⚡ Lightweight, dependency-free front-end (vanilla JS, HTML, CSS)
- 🔄 Real-time message translation via `translator.js`

## Project Structure

```
language-agnostic-chatbot/
├── index.html       # Main HTML structure of the chat UI
├── style.css         # Styling for the chatbot interface
├── app.js            # Core chatbot logic and event handling
├── translator.js      # Language detection and translation logic
└── README.md         # Project documentation
```

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, etc.)
- (Optional) A local server tool like [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) for VS Code, or Python's built-in server

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/jeevanandh/language-agnostic-chatbot.git
   cd language-agnostic-chatbot
   ```

2. Open `index.html` directly in your browser, **or** serve it locally:
   ```bash
   # Using Python 3
   python -m http.server 8000
   ```
   Then visit `http://localhost:8000` in your browser.

## Usage

1. Open the chatbot in your browser.
2. Type a message in any supported language.
3. The chatbot will detect the language, translate it as needed, and respond accordingly.

## Technologies Used

- HTML5
- CSS3
- JavaScript (Vanilla)
- Translation API/library (see `translator.js` for implementation details)

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your changes.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details (add one if not already present).

## Contact

For questions or suggestions, please open an issue on the repository.
