# XState-Chatbot

XState-Chatbot is a chatbot developed on the technology [XState](https://xstate.js.org). XState is a JavaScript implementation of the concept of [State-Charts](https://statecharts.github.io). 

Chatbot is developed as a backend service which will receive messages incoming from the user, and send messages to the user using a separate api call. 

In this project `nodejs` directory contains the primary project. It contains all the files of the project that will get deployed on the server. `react-app` is provided only for the purpose of easing the process of dialog development. It should be used only on a developer's local machine when developing any new chat flow. `nodejs` should be run as a backend service and tested once on the local machine using postman before deploying the build to the server. 

