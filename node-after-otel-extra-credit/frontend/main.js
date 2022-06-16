'use strict';

const opentelemetry = require('@opentelemetry/api');
const express = require('express');
const fetch = require('node-fetch');

// Constants
const PORT = 7000;
const HOST = '0.0.0.0';
const MESSAGE_ENDPOINT = process.env.MESSAGE_ENDPOINT || 'localhost:9000';
const NAME_ENDPOINT = process.env.NAME_ENDPOINT || 'localhost:8000';

const nameUrl = `http://${NAME_ENDPOINT}/name`;
const messageUrl = `http://${MESSAGE_ENDPOINT}/message`;

// App
const app = express();
app.get('/greeting', async (req, res) => {
  try {
    const greetingSpan = opentelemetry.trace.getTracer('default').startSpan('Preparing Greeting');
    greetingSpan.end();
    const nameSpan = opentelemetry.trace.getTracer('default').startSpan('call /name');
    const name = await getName(nameUrl);
    nameSpan.setAttribute("person name", name);
    nameSpan.end();
    const messageSpan = opentelemetry.trace.getTracer('default').startSpan('call /message');
    const message = await getMessage(messageUrl);
    messageSpan.setAttribute("message", message);
    messageSpan.end();
    res.send(`Hello ${name}, ${message}`);
  } catch (error) {
    console.error(error);
  }
});


const getName = (url) =>
  fetch(url)
    .then((data) => {
      return data.text();
    })
    .then((text) => {
      console.log(text);
      return text;
    })
    .catch((err) => console.error(`Problem getting name: ${err}`));

const getMessage = (url) =>
  fetch(url)
    .then((data) => {
      return data.text();
    })
    .then((text) => {
      console.log(text);
      return text;
    })
    .catch((err) => console.error(`Problem getting message: ${err}`));

app.listen(PORT, HOST);
console.log(`Running node frontend service on http://${HOST}:${PORT}`);
