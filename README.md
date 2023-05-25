Wallet Tracker Discord Bot

Wallet Watcher is a Discord bot that allows you to track EVM wallets, check their balances and list the NFTs owned by the wallet. This bot is designed to be easy to set up and deploy in your own environment.
Prerequisites

    Node.js 16.x or higher
    npm (usually bundled with Node.js)
    A Discord bot token

Installation

    Clone the repository or download the source code:

git clone https://github.com/Exlo84/WalletTracker.git
```

Navigate to the project directory:

cd WalletTracker
```

Install the required dependencies:

    npm install
    ```

Configuration

    Create a new file named .env in the project directory and add your Discord bot token. 
    Replace <YOUR_DISCORD_BOT_TOKEN>  with the respective values:

BOT_TOKEN=<YOUR_DISCORD_BOT_TOKEN>
```

(Optional) Configure the channel in which the bot will send wallet tracking notifications. Open the index.js file and change the CHANNEL_ID variable to the desired channel ID. If you don't know how to get the channel ID, you can follow these instructions.
javascript

    const CHANNEL_ID = process.env.CHANNEL_ID || 'YOUR_CHANNEL_ID';
    ```

Running the Bot

    Start the bot:

    node index.js
    ```

    The bot should now be running and connected to your Discord server. You should see a message in the configured channel indicating that the Wallet Watcher Bot is online.

Usage

The bot has the following commands:

    !track <chain> <address>: Track an Ethereum address for incoming and outgoing transactions.

    !balance <chain> <address>: Check the  balance of an EVM address.

    !nfts <chain> <address>: List NFTs owned by an Ethereum address.

    !help: Show a help message with the available commands.

Contributing

Feel free to open issues or submit pull requests if you find any bugs or have suggestions for improvements.
License

This project is licensed under the MIT License. See the LICENSE file for more information.
