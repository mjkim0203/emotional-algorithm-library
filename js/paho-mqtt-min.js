
/*!
 * Copyright (c) 2013, 2018 IBM Corp.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *    James Sutton - Initial Contribution
 */

/* Paho MQTT JavaScript client library v1.1.0 - mqttws31.min.js */

/* NOTE: Truncated for demo - in actual use, full file should be loaded from CDN or official repo */
var Paho={MQTT:{}};Paho.MQTT.Client=function(server,port,path,clientId){this.server=server;this.port=port;this.path=path;this.clientId=clientId;console.log("Mock Paho.MQTT.Client created")};
Paho.MQTT.Message=function(payload){this.payloadString=payload;};
