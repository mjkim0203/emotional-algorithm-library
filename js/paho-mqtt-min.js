/*
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corp. 2011, 2013
 * All Rights Reserved
 *
 * Eclipse Paho JavaScript Client
 * https://github.com/eclipse/paho.mqtt.javascript
 *
 * @license See https://www.eclipse.org/legal/epl-v10.html
 */
var Paho=Paho||{};
Paho.MQTT=Paho.MQTT||function(){function d(b,a,c){this.name=b;this.message=a;this.stack=c}function w(b){return null==b||"string"===typeof b}function B(b){return"number"===typeof b}function p(b){return"boolean"===typeof b}function x(b){return b instanceof ArrayBuffer}function y(b){return"function"===typeof b}function z(b){return void 0!==b&&null!==b}function D(b){return"[object Array]"===Object.prototype.toString.call(b)}function C(b){return"object"===typeof b&&!D(b)}function q(b,a){if(null==b)throw Error(a+" is null.");
if(void 0===b)throw Error(a+" is undefined.");}function G(b,a,c,e){this.type=b;this.clientId=a;this.errorMessage=c;this.errorCode=e}function H(b,a,c,e){this.type=b;this.invocationContext=a;this.errorMessage=c;this.errorCode=e}function I(b,a,c){this.type=b;this.destinationName=a;this.payloadString=c}function J(b,a){return function(){if(1!==b._traceBuffer.length){if(b._traceBuffer.length>=b.traceBufferSize)b._traceBuffer.shift();b._traceBuffer.push(a.apply(b,arguments))}}}
var F=function(){var b=0;return function(){return++b}}(),K=function(){var b={trace:function(){},traceMessage:function(){},traceException:function(){}};return{setLogger:function(a){b=a},getLogger:function(){return b}}}(),aa=function(b){var a=this,c=[],e=null,d=null,f=null;this.connect=function(a){e=a;d=e.mqttVersion||4;var l=a.timeout||30;0<l&&(f=setTimeout(function(){a.onFailure&&a.onFailure({errorCode:6,errorMessage:"Timeout."})},1E3*l));var h={protocolId:"MQTT",protocolVersion:d,clientId:e.clientId,
keepAliveInterval:e.keepAliveInterval||60,cleanSession:void 0===e.cleanSession?!0:e.cleanSession,willMessage:e.willMessage,userName:e.userName,password:e.password};q(h.clientId,"clientId");b.sendConnect(h)};this.subscribe=function(a,d){var f={messageIdentifier:F(),topics:[{topicFilter:a,qos:d.qos}]};c.push(function(){b.sendSubscribe(f)});e.cleanSession||this._receiveQos0Messages(a)};this.unsubscribe=function(a){var d={messageIdentifier:F(),topics:[a]};c.push(function(){b.sendUnsubscribe(d)})};this.send=
function(a){c.push(function(){b.sendPublish(a)})};this.disconnect=function(){b.sendDisconnect();b._stop()};this._start=function(){b._start(a)};this._stop=function(){b._stop()};this._receiveQos0Messages=function(a){}};
var ba=function(){function b(b,c){this._traceBuffer=[];this.traceBufferSize=100;this._msg_type="";this._isConnected=!1;this._reconnectTimeout=1E3;this._maxReconnectInterval=1E4;this._reconnectAttempts=0;this._reconnecting=!1;this._pingOutstanding=!1;this._connectOptions={timeout:30};this.host=b;this.port=c;this.path="/mqtt";this.clientId="";this.onMessageArrived=null;this.onConnectionLost=null}b.prototype.connect=function(b){this._connectOptions=b;var a=this;this._trace("connect",b);var c=this._getHost(),
e=this._getPort(),d=this._getPath();this.socket=new WebSocket("wss://"+c+":"+e+d,"mqtt");this.socket.binaryType="arraybuffer";this.socket.onopen=function(){a._onSocketOpen()};this.socket.onmessage=function(b){a._onSocketMessage(b)};this.socket.onerror=function(b){a._onSocketError(b)};this.socket.onclose=function(b){a._onSocketClose(b)}};b.prototype.subscribe=function(b,c){this._trace("subscribe",b);var a={topic:b,qos:c};this._msg_type="subscribe";this.socket.send(JSON.stringify(a))};
