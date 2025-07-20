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
