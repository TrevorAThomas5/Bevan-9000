const { Client } = require("discord.js");
const { config } = require("dotenv");
const fs = require("fs");
const firebase = require("firebase");

// config to access firebase database
const firebaseConfig = {
  apiKey: "AIzaSyBm7r_v8w-V5P0GeIC8IIA2dS5oLjDN0II",
  authDomain: "bevan-9000.firebaseapp.com",
  databaseURL: "https://bevan-9000.firebaseio.com",
  projectId: "bevan-9000",
  storageBucket: "bevan-9000.appspot.com",
};
firebase.initializeApp(firebaseConfig);

// create client bot
const client = new Client({
  disableEveryone: true,
});

// path of env file
config({
  path: __dirname + "/.env",
});

// defaults on startup
client.on("ready", () => {
  console.log(`I'm online! My name is ${client.user.username}`);

  // displayed under username as "Playing ..."
  client.user.setActivity("without toes | !help");
});

// handle commands from server chat
client.on("message", (message) => {
  // tell Evan he doesn't have toes
  if (message.author.id === "224255322997522432") {
    message.channel.send("You don't have any toes.");
  }
  // handle generic commands
  else {
    // format command and arguments
    const args = message.content.slice(1).trim().split(" ");
    const command = args.shift().toLowerCase();

    // display command information/help page
    if (command === "help") {
      fs.readFile("help", (err, data) => {
        if (err) throw err;
        message.channel.send(data.toString());
      });
    }
    // tell the tale of Evan's lost toes
    else if (command === "toes") {
      message.channel.send(
        "When young Bevan was just 4 years old, he suffered from a tragic boating accident. He fell off the back of the boat, and his toes were caught up in the propeller. All ten of his toes were lost that day, thus Bevan no longer has any toes. The end."
      );
    }
    // display when a user was last online
    else if (command === "lastonline") {
      // must have a username to check for
      if (args.length == 1) {
        let userID = args[0].replace(/[\\<>@#&!]/g, "");

        // read user info from database
        firebase
          .database()
          .ref("users/" + userID)
          .once(
            "value",
            function (snapshot) {
              data = snapshot.val();

              // null check
              if (data === null || data.currentlyOnline === null) {
                message.channel.send("This user is not in the database.");
              }
              // the user is online right now
              else if (data.currentlyOnline == true) {
                message.channel.send("This user is currently online.");
              }
              // the user is currently offline
              else {
                message.channel.send(
                  `This user was last online at ${data.lastOnline}`
                );
              }
            },
            // error handling
            function (err) {
              message.channel.send("The read failed: " + err.code);
            }
          );
      }
    }
  }
});

// when a user goes offline/online or plays a new game
client.on("presenceUpdate", (oldPresence, newPresence) => {
  // the current date and time
  let now = new Date();
  let options = {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  let time = now.toLocaleString("en-us", options);

  // if we don't know the last thing the user was doing
  if (!oldPresence) {
    // if the user is now offline
    if (newPresence.status !== "online") {
      console.log(`${newPresence.user.username} is now offline at ${time}`);
      firebase
        .database()
        .ref("users/" + newPresence.userID)
        .update({ lastOnline: time, currentlyOnline: false });
    }
    // if the user is now online
    else {
      console.log(`${newPresence.user.username} is now online at ${time}`);
      firebase
        .database()
        .ref("users/" + newPresence.userID)
        .update({ currentlyOnline: true });
    }
  }
  // if the status has changed, ie offline -> online or online -> offline
  else if (newPresence.status !== oldPresence.status) {
    // if the user is now offline
    if (newPresence.status !== "online") {
      console.log(`${newPresence.user.username} is now offline at ${time}`);
      firebase
        .database()
        .ref("users/" + newPresence.userID)
        .update({ lastOnline: time, currentlyOnline: false });
    }
    // if the user is now online
    else {
      console.log(`${newPresence.user.username} is now online at ${time}`);
      firebase
        .database()
        .ref("users/" + newPresence.userID)
        .update({ currentlyOnline: true });
    }
  }
});

// start the bot
client.login(process.env.TOKEN);
