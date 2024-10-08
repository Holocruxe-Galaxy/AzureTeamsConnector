const {ActivityHandler, MessageFactory} = require("botbuilder");

class TeamsBot extends ActivityHandler {
  constructor() {
    super();
    this.onMessage(async (context, next) => {
      const request = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: context.activity.text,
        }),
      };
      const response = await fetch(process.env.ChatBotUrl, request);

      if (!response.ok) {
        console.error(`Error en la respuesta: ${response.statusText}`);
        await context.sendActivity(
          MessageFactory.text(
            "Hubo un problema con el servicio. Inténtalo más tarde.",
            "error"
          )
        );
        return;
      }
      const responseData = await response.json();
      const responseText = responseData.text;
      await context.sendActivity(
        MessageFactory.text(responseText, responseText)
      );

      await next();
    });

    // this.onMembersAdded(async (context, next) => {
    //     const membersAdded = context.activity.membersAdded;
    //     const welcomeText = "Hello and welcome!";
    //     for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
    //         if (membersAdded[cnt].id !== context.activity.recipient.id) {
    //             await context.sendActivity(
    //                 MessageFactory.text(welcomeText, welcomeText)
    //             );
    //         }
    //     }
    //     // By calling next() you ensure that the next BotHandler is run.
    //     await next();
    // });
  }
}

module.exports.TeamsBot = TeamsBot;
