/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const moment = require('moment-timezone');
const axios = require('axios');
const API_KEY = 'a117f5890e839aba52bb9bf5a8bc7aba';


const genre_code = {
  'Action': 28,
  'Adventure': 12,
  'Animation': 16,
  'Comedy': 35,
  'Crime': 80,
  'Documentary': 99,
  'Drama': 18,
  'Family': 10751,
  'Fantasy': 14,
  'Horror': 27,
  'Thriller': 53,
  'War': 10752,
  'History': 14,

};




const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  async handle(handlerInput) {
    let apiAccessToken = handlerInput.requestEnvelope.context.System.apiAccessToken;
    let deviceId = handlerInput.requestEnvelope.context.System.device.deviceId;
    let speechText = 'Hi';
    await axios.get(`https://api.eu.amazonalexa.com/v2/devices/${deviceId}/settings/System.timeZone`, {
      headers: { 'Authorization': `Bearer ${apiAccessToken}` }
    })
    .then((response) => {
        let timeobject = new moment();
        let time = timeobject.tz(response.data).format('hh');
        time = String(time);
        //console.log(time);
        time = Number(time);
        if(time >= 21 && time <= 3)
       
        {
          speechText = 'Would you like to see some Horror movies right now? ';
        }
        else
        {
          speechText = 'What kind of movie would you like to watch Action, Thriller or in the mood for some comedy? ';
          console.log('okkkkk');
        }
    })
    .catch(err => {
        console.log(err.error);
        speechText = 'I did not get it';
    });
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();    
  },
};

const GenreIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'GenreIntent';
  },
  handle(handlerInput)
  {
   let genreslot = handlerInput.requestEnvelope.request.intent.slots['genre'].value;
   const sessionAttributes1 = handlerInput.attributesManager.getSessionAttributes();
   const {genre} = sessionAttributes1;
   sessionAttributes1.genre = genreslot;
   let speechText = `Alright! I will look something for you in ${genreslot}. Can I know the age demographics of the people you are watching the movie please?`
   handlerInput.attributesManager.setSessionAttributes(sessionAttributes1);
   return handlerInput.responseBuilder
   .speak(speechText)
   .reprompt(speechText)
   .getResponse();
  },

};

const AgeIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AgeIntent';
  },
async handle(handlerInput)
{
  let age = handlerInput.requestEnvelope.request.intent.slots['age'].value;
  const sessionAttributes1 = handlerInput.attributesManager.getSessionAttributes();
  let genre = sessionAttributes1.genre;
  genre = genre_code[genre];
  let speechText = '';
  if(age<18)
  {
  await axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&with_genres=${genre}`)
  .then((response) => {
    const data = JSON.parse(response);
    let result = data['results'];
    for(let i = 0;i<result.length;i++)
    {
      speechText += result['original_title'];
    }
  })
  .catch((err)=>{
    console.log(err);

  });

  }
  else
  {
    {
      await axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=true&include_video=false&page=1&with_genres=${genre}`)
      .then((response) => {
        const data = JSON.parse(response);
        let result = data['results'];
        console.log(result);
        for(let i = 0;i<result.length;i++)
        {
          speechText += result['original_title'];
        }
      })
      .catch((err) =>{
        console.log(err);

      });
    
      }
  }
  return handlerInput.responseBuilder
   .speak(speechText)
   .reprompt(speechText)
   .getResponse();
  

}  

};


const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can say hello to me!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    GenreIntentHandler,
    AgeIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
