const INTENTION_UNKOWN = 'INTENTION_UKNOWN';
function get_input(event) {
  return event.message.input.trim().toLowerCase();
}
function get_message(bundle, locale = 'en_IN') {
  return (bundle[locale] === 'undefined')? bundle[en_IN] : bundle[locale];
}
function get_intention(g, event, strict = false) {
  let utterance = get_input(event);
  function exact(e) {return e.recognize.includes(utterance)}
  function contains(e) {return e.recognize.find(r=>utterance.includes(r))}
  let index = strict? g.findIndex(exact) : g.findIndex(e=>contains(e));
  return (index == -1) ? INTENTION_UNKOWN : g[index].intention;
}
function constructPromptAndGrammer(data) {
  var prompt;
  var grammer = [];
  data.forEach((element, index) => {
    prompt+= `\n ${index+1}. ${element}`;
    grammer.push({intention: element, recognize: [index+1]});
  });
  // console.log(prompt);
  // console.log(grammer);
  return {prompt, grammer};
}

let global_messages = {
  error: {
    retry: {
      en_IN: 'I am sorry, I didn\'t understand. Let\'s try again.',
      hi_IN: 'मुझे क्षमा करें, मुझे समझ नहीं आया। फिर से कोशिश करें।'
    },
    proceeding: {
      en_IN: 'I am sorry, I didn\'t understand. But proceeding nonetheless',
      hi_IN: 'मुझे क्षमा करें, मुझे समझ नहीं आया। फिर भी आगे बढ़ें।'
    }
  },
  system_error: {
    en_IN: 'I am sorry, our system has a problem. Could you try again in a few minutes please?',
    hi_IN: 'हमारे सिस्टम में एक समस्या है। क्या आप कुछ मिनटों में फिर से कोशिश कर सकते हैं?'
  }
}

module.exports = {get_message, get_intention, INTENTION_UNKOWN, global_messages, constructPromptAndGrammer};