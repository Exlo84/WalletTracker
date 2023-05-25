const dotenv = require('dotenv');
const Web3 = require('web3');
const { Client, Events, GatewayIntentBits } = require('discord.js');

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ]
});

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.login(BOT_TOKEN).catch((error) => {
    console.error('Failed to log in:', error.message);
    process.exit(1);
});

const rpcUrls = {
    eth: process.env.ETH_RPC_URL,
    bsc: process.env.BSC_RPC_URL,
    polygon: process.env.POLYGON_RPC_URL,
    etho: process.env.ETHO_RPC_URL,
};

const networks = {
    eth: 'ETH',
    bsc: 'BSC',
    polygon: 'Polygon',
    etho: 'ETHO Protocol',
};

async function getBalance(chain, address) {
    try {
        const web3 = new Web3(rpcUrls[chain]);
        const balance = await web3.eth.getBalance(address);
        return web3.utils.fromWei(balance);
    } catch (error) {
        console.error(`Error getting ${networks[chain]} balance:`, error.message);
        throw error;
    }
}

// Store the previous balance for each tracked address
const previousBalances = {};

async function monitorBlockchain() {
    try {
        const trackedAddresses = {};

        client.on('messageCreate', async (message) => {
            if (message.author.bot) return;

            const args = message.content.trim().split(/ +/g);
            const command = args.shift().toLowerCase();

            if (command === '!track') {
                const chain = args[0];
                const address = args[1];
                if (!chain || !address) {
                    message.channel.send('❗ Please provide a chain (eth, bsc, polygon, etho) and an address. Example: `!track eth 0x742d35Cc6634C0532925a3b844Bc454e4438f44e`');
                    return;
                }
                if (!rpcUrls.hasOwnProperty(chain)) {
                    message.channel.send('❌ Error: Invalid chain specified.');
                    return;
                }
                trackedAddresses[address] = chain;
                message.channel.send(`🔎 Now tracking address: ${address} on ${networks[chain]}`);
                console.log(`Tracking address: ${address} on ${networks[chain]}`);
            } else if (command === '!balance') {
                const chain = args[0];
                const address = args[1];
                if (!chain || !address) {
                    message.channel.send('❗ Please provide a chain (eth, bsc, polygon, etho) and an address. Example: `!balance eth 0x742d35Cc6634C0532925a3b844Bc454e4438f44e`');
                    return;
                }
                if (!rpcUrls.hasOwnProperty(chain)) {
                    message.channel.send('❌ Error: Invalid chain specified.');
                    return;
                }
                try {
                    const balance = await getBalance(chain, address);
                    message.channel.send(`💰 Balance for address ${address} on ${networks[chain]}: ${balance} ${chain.toUpperCase()}`);
                } catch (error) {
                    console.error('Error getting balance:', error.message);
                    message.channel.send('❌ Error: Could not fetch the balance. Please make sure the address and chain are correct.');
                }
            } else if (command === '!untrack') {
                const address = args[0];
                if (!address) {
                    message.channel.send('❗ Please provide an address to untrack. Example: `!untrack 0x742d35Cc6634C0532925a3b844Bc454e4438f44e`');
                    return;
                }
                if (!trackedAddresses.hasOwnProperty(address)) {
                    message.channel.send('❌ Error: The address is not being tracked.');
                    return;
                }
                delete trackedAddresses[address];
                delete previousBalances[address];
                message.channel.send(`🔍 Stopped tracking address: ${address}`);
                console.log(`Stopped tracking address: ${address}`);
            }
        });

        setInterval(async () => {
            try {
                for (const address of Object.keys(trackedAddresses)) {
                    const chain = trackedAddresses[address];
                    try {
                        const balance = await getBalance(chain, address);

                        // Check if the balance has changed
                        if (previousBalances[address] !== balance) {
                            client.channels.cache.get(CHANNEL_ID).send(`💰 Balance update for address ${address} on ${networks[chain]}: ${balance} ${chain.toUpperCase()}`);
                            previousBalances[address] = balance; // Update the previous balance
                        }
                    } catch (error) {
                        console.error('Error getting balance:', error.message);
                    }
                }
            } catch (error) {
                console.error('❌ Error while monitoring blockchain:', error.message);
            }
        }, 30000); // Check for new blocks every 30 seconds
    } catch (error) {
        console.error('❌ Error while initializing monitorBlockchain:', error.message);
    }
}

client.on('ready', () => {
    console.log('Connected to Discord and ready!');
    console.log('Bot is running as:', client.user.tag);
    console.log(`Monitoring channel ID: ${CHANNEL_ID}`);

    // Send a greeting message to the channel
    client.channels.cache.get(CHANNEL_ID).send(`🤖 ${client.user.tag} WalletWatcher is online!`);
    const greetingMessage = '🎉 Sup bitches. I\'m here to help you track wallets on Ethereum, BSC, Polygon, and ETHO Protocol. Type `!help` to see the available commands.';
    client.channels.cache.get(CHANNEL_ID).send(greetingMessage);

    monitorBlockchain();
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const args = message.content.trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (command === '!help') {
        const helpMessage = `
📚 **Available Commands:**
\`\`\`
!track <chain> <address>   - Track an address on a specific chain (eth, bsc, polygon, etho)
!balance <chain> <address> - Check the balance of an address on a specific chain
!untrack <address>         - Stop tracking an address
!help                      - Show this help message
\`\`\`
`;
        message.channel.send(helpMessage);
    }
});
