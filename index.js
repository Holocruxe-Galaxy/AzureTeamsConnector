const path = require("path");

const dotenv = require("dotenv");
const ENV_FILE = path.join(__dirname, ".env");
dotenv.config({path: ENV_FILE});

const restify = require("restify");

// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
const {
  CloudAdapter,
  ConfigurationBotFrameworkAuthentication,
} = require("botbuilder");

const {TeamsBot} = require("./bot");

// Create HTTP server
const server = restify.createServer();
server.use(restify.plugins.bodyParser());

server.listen(process.env.port || process.env.PORT || 3978, () => {
  console.log(`\n${server.name} listening to ${server.url}`);
  console.log(
    "\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator"
  );
  console.log('\nTo talk to your bot, open the emulator select "Open Bot"');
});

const botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication(
  process.env
);

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about how bots work.
const adapter = new CloudAdapter(botFrameworkAuthentication);

// Catch-all for errors.
const onTurnErrorHandler = async (context, error) => {
  console.error(`\n [onTurnError] unhandled error: ${error}`);
  await context.sendTraceActivity(
    "OnTurnError Trace",
    `${error}`,
    "https://www.botframework.com/schemas/error",
    "TurnError"
  );

  await context.sendActivity("The bot encountered an error or bug.");
  await context.sendActivity(
    "To continue to run this bot, please fix the bot source code."
  );
};

// Set the onTurnError for the singleton CloudAdapter.
adapter.onTurnError = onTurnErrorHandler;

// Create the main dialog.
const myBot = new TeamsBot();

// Listen for incoming requests.
server.post("/api/messages", async (req, res) => {
  await adapter.process(req, res, (context) => myBot.run(context));
});

server.on("upgrade", async (req, socket, head) => {
  const streamingAdapter = new CloudAdapter(botFrameworkAuthentication);
  streamingAdapter.onTurnError = onTurnErrorHandler;

  await streamingAdapter.process(req, socket, head, (context) =>
    myBot.run(context)
  );
});
