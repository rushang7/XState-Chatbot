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

module.exports = {get_message, get_intention, INTENTION_UNKOWN};