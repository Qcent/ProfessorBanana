/*
For custom interactions with the database utilizing sequlize
*/
require('dotenv').config();

const db = require('./db');
const { User, Conversation, Message, LastReadMessages } = require('./models');

async function run() {
  const output = await Conversation.destroy({
    where: {
      id: 8,
    },
  });

  console.log(output);

  console.log(`all commands run successfully`);
}

async function runCmd() {
  console.log('Executing commands...');
  try {
    await run();
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    console.log('closing db connection');
    await db.close();
    console.log('db connection closed');
  }
}

if (module === require.main) {
  runCmd();
}
